const activeCacheName = "restaurants-reviews-v1";

function install(cache) {
    return cache.addAll(["/"]);
}

function shouldDeleteCache(cacheName) {
    return cacheName.startsWith("restaurants-reviews-")
        && cacheName !== activeCacheName;
}

function deleteCache(cacheName) {
    return caches.delete(cacheName);
}

function deletePrevCaches(cacheNames) {
    return Promise.all(cacheNames.filter(shouldDeleteCache).map(deleteCache));
}

self.addEventListener("install", function (event) {
    const promise = caches.open(activeCacheName).then(install);
    event.waitUntil(promise);
});

self.addEventListener("activate", function (event) {
    const promise = caches.keys().then(deletePrevCaches);
    event.waitUntil(promise);
});

self.addEventListener("fetch", function (event) {
    const req = event.request;
    const url = new URL(req.url);
    switch (url.protocol) {
        case "chrome-extension:":
            return;
    }

    event.respondWith(
        caches.match(req).then(async function (res) {
            if (res) return res; // do not fetch if found in cache
            res = await fetch(req); // wait until fetch completes
            if (res) {
                const clone = res.clone(); // save clone to cache (since using body several times throwing an error)
                caches.open(activeCacheName)
                    .then(cache => cache.put(req, clone))
                    .catch(e => {
                        console.error(req);
                        console.error(e);
                    });
            }
            return res;
        }),
    );
});

self.addEventListener("message", function (event) {
    if (event.data.action === "skipWaiting")
        self.skipWaiting();
});
