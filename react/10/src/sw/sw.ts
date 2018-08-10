declare const serviceWorkerOption: {
    assets: string[];
};

const DEBUG = false;
const CACHE_NAME = new Date().toISOString();

const ORIGINS: Set<string> = new Set([
    location.origin,
]);

const HOSTS: Set<string> = new Set([
    "maps.gstatic.com",
    "maps.googleapis.com",
    "fonts.gstatic.com",
    "fonts.googleapis.com",
    "cdnjs.cloudflare.com",
    "raw.githubusercontent.com",
]);

const sw = self as ServiceWorkerGlobalScope;

// when the service worker is first added
sw.oninstall = function (event: ExtendableEvent) {
    // When the user navigates to your site,
    // the browser tries to re-download the script file that defined the service
    // worker in the background.
    // If there is even a byte's difference in the service worker file compared
    // to what it currently has, it considers it 'new'.
    const {assets} = serviceWorkerOption;

    const assetsToCache = [...assets, "./"]
        .map(path => new URL(path, location).toString());

    // add core website files to cache during service worker installation
    const promise = $install(assetsToCache, CACHE_NAME);
    event.waitUntil(promise);
};

// after the install event.
sw.onactivate = function (event: ExtendableEvent) {
    debug("activate event");
    const promise = $clean(CACHE_NAME);
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
    const {method} = request;

    // ignore other than GET request
    if (method !== "GET") {
        debug("ignoring request method:", method);
        return;
    }

    // ignore different origin
    const url = new URL(request.url);
    if (!$canFetchUrl(url)) {
        debug("ignoring:", url);
        return;
    }

    const promise = $fetch(request, url, CACHE_NAME);
    event.respondWith(promise);
};

function $canFetchUrl(url: URL): boolean {
    const {origin, hostname, href} = url;
    if (ORIGINS.has(origin)) return true;
    if (HOSTS.has(hostname)) return true;
    return false;
}

async function $install(requests: (Request | string)[], cacheName: string) {
    const cache = await caches.open(cacheName);
    try {
        await cache.addAll(requests);
        debug("install assets: ", requests);
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}

async function $fetch(request: Request, url: URL, cacheName: string): Promise<Response> {
    const {href} = url;
    const {mode} = request;

    // try to load request from cache
    let response: Response = await caches.match(request);
    if (response) {
        debug(`from cache:`, href);
        return response;
    }

    try {
        // load and cache known assets
        response = await fetch(request);
        const {ok, type, statusText} = response;
        if (ok) {
            debug(`fetch:`, href);
            $cache(request, response.clone(), cacheName);
        }
        else if (type !== "opaque") {
            debug(`error '${statusText}' while fetching`, url, response);
        }
        return response;
    }
    catch (e) {
        // user is landing on our page.
        if (mode === "navigate")
            response = await caches.match("./");

        return response || new Response(null, {
            status: 404,
            statusText: e.message,
        });
    }
}

async function $cache(request: Request, response: Response, cacheName: string): Promise<void> {
    debug("cache:", request.url);
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
}

async function $clean(except: string): Promise<void> {
    const names = await caches.keys();
    await Promise.all(names.map($delete, except));
}

async function $delete(this: string, cacheName: string): Promise<void> {
    // delete the caches that are not the current one
    if (!this || cacheName.indexOf(this) !== 0)
        await caches.delete(cacheName);
}

function debug(message: string, ...params: any[]): void {
    if (!DEBUG) return;
    console.log("[SW]: " + message, ...params);
}
