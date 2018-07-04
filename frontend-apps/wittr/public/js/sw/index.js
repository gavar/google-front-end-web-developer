self.addEventListener("install", function (event) {
    const urlsToCache = [
        "/",
        "js/main.js",
        "css/main.css",
        "imgs/icon.png",
        "https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff",
        "https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff",
    ];

    event.waitUntil(
        // Add cache the urls from urlsToCache
        caches.open("wittr-static-v1")
            .then(cache => cache.addAll(urlsToCache)),
    );
});

self.addEventListener("fetch", function (event) {
    // Leave this blank for now.
    // We'll get to this in the next task.
});
