const DEBUG = false;

declare const serviceWorkerOption: any;
const sw = self as ServiceWorkerGlobalScope;

// When the user navigates to your site,
// the browser tries to redownload the script file that defined the service
// worker in the background.
// If there is even a byte's difference in the service worker file compared
// to what it currently has, it considers it 'new'.
const {assets} = serviceWorkerOption;

const CACHE_NAME = new Date().toISOString();

let assetsToCache = [...assets, "./"];

assetsToCache = assetsToCache.map(path => {
    return new URL(path, location).toString();
});

// When the service worker is first added to a computer.
sw.addEventListener("install", (event: ExtendableEvent) => {
    // Perform install steps.
    debug("[SW] Install event");

    // Add core website files to cache during serviceworker installation.
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(assetsToCache);
            })
            .then(() => {
                debug("Cached assets: main", assetsToCache);
            })
            .catch(error => {
                console.error(error);
                throw error;
            }),
    );
});

// After the install event.
sw.addEventListener("activate", (event: ExtendableEvent) => {
    debug("[SW] Activate event");

    // Clean the caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete the caches that are not the current one.
                    if (cacheName.indexOf(CACHE_NAME) === 0) {
                        return null;
                    }

                    return caches.delete(cacheName);
                }),
            );
        }),
    );
});

sw.addEventListener("message", (event: ExtendableMessageEvent) => {
    switch (event.data.action) {
        case "skipWaiting":
            if (sw.skipWaiting) {
                sw.skipWaiting();
                sw.clients.claim();
            }
            break;
        default:
            break;
    }
});

sw.addEventListener("fetch", (event: FetchEvent) => {
    const request = event.request;

    // Ignore not GET request.
    if (request.method !== "GET") {
        debug(`[SW] Ignore non GET request ${request.method}`);
        return;
    }

    const requestUrl = new URL(request.url);

    // Ignore difference origin.
    if (requestUrl.origin !== location.origin) {
        debug(`[SW] Ignore difference origin ${requestUrl.origin}`);
        return;
    }

    const resource = caches.match(request).then(response => {
        if (response) {
            debug(`[SW] fetch URL ${requestUrl.href} from cache`);
            return response;
        }

        // Load and cache known assets.
        return fetch(request)
            .then(responseNetwork => {
                if (!responseNetwork || !responseNetwork.ok) {
                    debug(`[SW] URL [${requestUrl.toString()}] wrong responseNetwork: ${
                        responseNetwork.status
                        } ${responseNetwork.type}`,
                    );

                    return responseNetwork;
                }

                debug(`[SW] URL ${requestUrl.href} fetched`);

                const responseCache = responseNetwork.clone();

                caches
                    .open(CACHE_NAME)
                    .then(cache => {
                        return cache.put(request, responseCache);
                    })
                    .then(() => {
                        debug(`[SW] Cache asset: ${requestUrl.href}`);
                    });

                return responseNetwork;
            })
            .catch(() => {
                // User is landing on our page.
                if (event.request.mode === "navigate") {
                    return caches.match("./");
                }

                return null;
            });
    });

    event.respondWith(resource);
});

function debug(message: string, ...params: any[]) {
    if (!DEBUG) return;
    console.log(message, params);
}
