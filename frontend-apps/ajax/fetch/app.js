(function () {
    const form = document.querySelector("#search-form");
    const searchField = document.querySelector("#search-keyword");
    let searchedForText;
    const responseContainer = document.querySelector("#response-container");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        responseContainer.innerHTML = "";
        searchedForText = searchField.value;

        // images
        fetch(`https://api.unsplash.com/search/photos?page=1&query=${searchedForText}`, {
            headers: {Authorization: `Client-ID 2acbcbf1a1639b8d3af2915f3bf412a2a8bf588627750709fb25d2d96ab8d164`},
        })
            .then(res => res.json())
            .then(addImage);

        // articles
        fetch(`http://api.nytimes.com/svc/search/v2/articlesearch.json?q=${searchedForText}&api-key=118f320ef2b64ef7b616e36572866f5b`)
            .then(res => res.json())
            .then(addArticles);
    });

    function addImage(data) {
        const firstImage = data.results[0];
        const html = `<figure>
          <img src="${firstImage.urls.small}" alt="${searchedForText}">
          <figcaption>${searchedForText} by ${firstImage.user.name}</figcaption>
        </figure>`;
        responseContainer.insertAdjacentHTML("afterbegin", html);
    }

    function addArticles(articles) {
        const data = articles;
        const html = data.response.docs.map(article =>
            `<li>
                <h2><a href="${article.web_url}">${article.headline.main}</a><h2>
                <p>${article.snippet}</p>
            </li>`,
        );
        responseContainer.insertAdjacentHTML("beforeend", `<ul>${html.join("")}</ul>`);
    }
})();
