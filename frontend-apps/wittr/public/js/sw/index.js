self.addEventListener("fetch", function (event) {
    event.respondWith(
        fetch(event.request).then(function (response) {
            if (response.status === 404)
                return fetch("/img/dr-evil.gif");

            return response;
        }).catch(function () {
            return new Response("Uh oh, that totally failed!");
        }),
    );
});
