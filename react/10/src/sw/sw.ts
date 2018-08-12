declare const serviceWorkerOption: {
    assets: string[];
};

const DEBUG = false;
const ASSETS_CACHE = new Date().toISOString();
const ASSETS_STRATEGY: FetchStrategyType = "cache-only";

const CACHES = [
    ASSETS_CACHE,
    "github",
    "google/maps",
    "google/maps/api",
    "google/photos",
    "google/static",
];

interface Route {
    strategy: FetchStrategyType,
    cacheName: string;
    href?: string;
    host?: string;
    path?: string;
    regex?: RegExp,
    cacheUrl?: (url: URL) => string,
}

const ROUTES: Route[] = [
    {
        strategy: "cache-first",
        host: "raw.githubusercontent.com",
        cacheName: "github",
    },
    {
        strategy: "cache-first",
        host: "maps.googleapis.com",
        path: "/maps/vt",
        cacheName: "google/maps",
    },
    {
        strategy: "cache-first",
        host: "maps.gstatic.com",
        cacheName: "google/static",
    },
    {
        strategy: "cache-first",
        host: "maps.googleapis.com",
        regex: /PhotoService/,
        cacheName: "google/photos",
    },
    {
        strategy: "network-first",
        host: "maps.googleapis.com",
        path: "maps/api/js",
        cacheName: "google/maps/api",
    },
    {
        strategy: "network-first",
        host: "maps.googleapis.com",
        regex: /ViewportInfoService|AuthenticationService/,
        cacheName: "google/maps/api",
    },
];

for (const route of ROUTES)
    route.cacheUrl = cacheUrlTransform;

function cacheUrlTransform(url: URL): string {
    const {searchParams} = url;

    // google
    searchParams.delete("key");
    searchParams.delete("token");
    searchParams.delete("callback");

    // commons
    searchParams.delete("v");
    searchParams.delete("client_id");
    searchParams.delete("client_secret");

    return url.toString();
}

const sw = self as ServiceWorkerGlobalScope;
const assets: Set<string> = new Set([...serviceWorkerOption.assets, "./"].map(localHref));
function localHref(path: string) { return new URL(path, location).href;}

// when the service worker is first added
sw.oninstall = function (event: ExtendableEvent) {
    const promise = $install([...assets], ASSETS_CACHE);
    event.waitUntil(promise);
};

// after the install event.
sw.onactivate = function (event: ExtendableEvent) {
    debug("activate event");
    const promise = $cleanCache.apply(null, CACHES);
    event.waitUntil(promise);
};

sw.onmessage = function (event: ExtendableMessageEvent) {
    const {data} = event;
    const {action} = data;
    switch (action) {
        case "skipWaiting":
            if (sw.skipWaiting) {
                sw.skipWaiting();
                sw.clients.claim();
            }
            break;
        default:
            break;
    }
};

sw.onfetch = async function (event: FetchEvent) {
    const {request} = event;
    const strategy = $fetchStrategyOf(request);
    if (strategy) {
        debug(strategy.type, ":", request.url);
        const promise = $fetch(request, strategy);
        event.respondWith(promise);
    }
    else {
        debug("ignore", ":", request.url);
    }
};

type FetchStrategyType =
    | "cache-only"
    | "cache-first"
    | "network-only"
    | "network-first"
    | "fastest"

async function $install(requests: (Request | string)[], cacheName: string) {
    const cache = await caches.open(cacheName);
    try {
        debug("installing assets: ", requests);
        await cache.addAll(requests);
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}

interface FetchStrategy extends CacheQueryOptions {
    type: FetchStrategyType,
    cacheUrl?: string,
}

function $fetchStrategyOf(request: Request): FetchStrategy {
    // only GET requests
    if (request.method !== "GET")
        return;

    const url = new URL(request.url);

    // local asset?
    if (assets.has(url.href))
        return {
            type: ASSETS_STRATEGY,
            cacheUrl: url.href,
            cacheName: ASSETS_CACHE,
        };

    // route?
    for (const route of ROUTES) {
        const {strategy, href, host, path, regex, cacheUrl, cacheName} = route;
        if (host && url.host != host) continue;
        if (href && url.href != href) continue;
        if (path && url.pathname != path) continue;
        if (regex && !url.href.match(regex)) continue;

        let $url = new URL("", url);
        return {
            type: strategy,
            cacheUrl: cacheUrl && cacheUrl($url) || void 0,
            cacheName,
        };
    }
}

async function $fetch(request: Request, strategy: FetchStrategy): Promise<Response> {
    let error: Error;
    let response: Response;
    try {
        switch (strategy.type) {
            case "cache-only":
                response = await $cacheOnly(strategy.cacheUrl || request, strategy);
                break;
            case "network-only":
                response = await $networkOnly(request);
                break;
            case "cache-first":
                response = await $cacheFirst(request, strategy.cacheUrl, strategy);
                break;
            case "network-first":
                response = await $networkFirst(request, strategy.cacheUrl, strategy);
                break;
            case "fastest":
                response = await $fastest(request, strategy.cacheUrl, strategy);
                break;
            default:
                error = Error(`unknown strategy type: ${strategy}`);
                break;
        }
    }
    catch (e) {
        error = e;
    }

    // check result
    if ($ok(response))
        return response;

    // return error response
    return new Response(null, {
        status: 404,
        statusText: error.message || void 0,
    });
}

/**
 * Only checks the cache.
 * Returns null if cache does not have a match.
 * @param request - request to fetch.
 * @param options - cache query options.
 */
async function $cacheOnly(request: Request | string, options: CacheQueryOptions): Promise<Response> {
    const url = (request as Request).url || request;
    const response: Response = await caches.match(request, options);
    if ($ok(response)) debug(`from cache:`, url);
    return response;
}

/**
 * Only checks the network.
 * There is no going to the cache for data.
 * If the network fails, then the request fails.
 * @param request - request to fetch.
 */
async function $networkOnly(request: Request | string): Promise<Response> {
    const url = (request as Request).url || request;
    const response: Response = await fetch(request);
    if ($ok(response)) debug(`from network:`, url);
    else debug(`error '${response.statusText}' while fetching`, url, response);
    return response;
}

/**
 * Loads the local HTML and JavaScript first, if possible, bypassing the network.
 * If cached content is not available, then the service worker returns a response from the network instead and caches the network response.
 * @param request - request to fetch.
 * @param cacheRequest - request to run against the cache.
 * @param cacheOptions - cache query options.
 */
async function $cacheFirst(request: Request, cacheRequest: Request | string, cacheOptions: CacheQueryOptions) {
    // fallback cache request
    if (!cacheRequest)
        cacheRequest = request;

    // try cache
    const fromCache: Response = await $cacheOnly(cacheRequest, cacheOptions);
    if ($ok(fromCache))
        return fromCache;

    // try network
    const fromNetwork = await $networkOnly(request);
    if ($ok(fromNetwork)) {
        $save(cacheRequest, fromNetwork.clone(), cacheOptions.cacheName);
        return fromNetwork;
    }
}

/**
 * Checks the network first for a response and, if successful, returns current data to the page.
 * If the network request fails, then the service worker returns the cached entry instead.
 * @param request - request to fetch.
 * @param cacheRequest - request to run against the cache.
 * @param cacheOptions - cache query options.
 */
async function $networkFirst(request: Request, cacheRequest: Request | string, cacheOptions: CacheQueryOptions) {
    // fallback cache request
    if (!cacheRequest)
        cacheRequest = request;

    // try network
    let networkError: Error;
    try {
        const fromNetwork = await $networkOnly(request);
        if ($ok(fromNetwork)) {
            $save(cacheRequest, fromNetwork.clone(), cacheOptions.cacheName);
            return fromNetwork;
        }
    }
    catch (e) {
        networkError = e;
    }

    // try cache
    const fromCache: Response = await $cacheOnly(cacheRequest, cacheOptions);
    if ($ok(fromCache))
        return fromCache;

    // notify network error
    if (networkError)
        throw networkError;
}

/**
 * Fires the same request to the network and the cache simultaneously.
 * In most cases, the cached data loads first and that is returned directly to the page.
 * Meanwhile, the network response updates the previously cached entry.
 * @param request - request to fetch.
 * @param cacheRequest - request to run against the cache.
 * @param cacheOptions - cache query options.
 */
async function $fastest(request: Request, cacheRequest: Request | string, cacheOptions: CacheQueryOptions): Promise<Response> {
    // fallback cache request
    if (!cacheRequest)
        cacheRequest = request;

    // initiate requests
    const promises: Array<Promise<Response>> = [
        $cacheOnly(cacheRequest, cacheOptions),
        $networkOnly(request),
    ];

    // check fastest
    try {
        // in most cases the cached data loads first, so check if there's match
        const response = await Promise.race(promises);
        if (response && response.ok)
            return response;
    }
    catch (e) {
        // will figure out later who threw an error
    }

    // check network
    let fromNetwork: Response;
    let networkError: Error;
    try {
        fromNetwork = await promises[1];
        if ($ok(fromNetwork)) {
            $save(cacheRequest, fromNetwork.clone(), cacheOptions.cacheName);
            return fromNetwork;
        }
    }
    catch (e) {
        networkError = e;
    }

    // check cache
    let cacheError: Error;
    try {
        const fromCache = await promises[0];
        if ($ok(fromCache))
            return fromCache;
    }
    catch (e) {
        // just for safety, this should not happen
        console.error("cache error", e);
        cacheError = e;
    }

    // use network response if any
    if (fromNetwork)
        return fromNetwork;

    // network fault?
    if (networkError)
        throw networkError;

    // cache fault?
    if (cacheError)
        throw cacheError;

    throw new Error("unknown error");
}

async function $save(request: Request | string, response: Response, cacheName: string): Promise<void> {
    const url = (request as Request).url || request;
    debug("saving [%s]: %s", cacheName, url);
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
}

async function $cleanCache(...except: string[]): Promise<any> {
    let names = await caches.keys();
    names = names && names.filter(exclude, except);
    if (names && names.length) {
        debug("deleting caches:", names);
        const promises = names.map(caches.delete, caches);
        return Promise.all(promises);
    }
}

function exclude(this: string[], value: string) {
    return !this.includes(value);
}

/**
 * Checking if response is successful.
 * NOTE: returns true for opaque responses.
 * @see https://developers.google.com/web/tools/workbox/guides/handle-third-party-requests#force_caching_of_opaque_responses
 */
function $ok(response: Response) {
    if (response) {
        const {ok, status, type} = response;
        if (ok || type === "opaque" && status === 0)
            return true;
    }
}

function debug(...tokens: any[]): void {
    if (!DEBUG) return;
    if (tokens.length < 1) return;
    tokens[0] = `[SW]: ${tokens[0]}`;
    console.log.apply(console, tokens);
}
