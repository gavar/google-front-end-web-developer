/* feedreader.js
 *
 * This is the spec file that Jasmine will read and contains
 * all of the tests that will be run against your application.
 */

/* We're placing all of our tests within the $() function,
 * since some of these tests may require DOM elements. We want
 * to ensure they don't run until the DOM is ready.
 */
$(function () {

    /**
     * Promise which resolves after given timeout.
     * @param timeout - timeout in milliseconds
     */
    function delay(timeout) {
        return new Promise(resolve => window.setTimeout(resolve, timeout));
    }

    /**
     * Check whether given HTML element is within screen rect.
     * @param element - HTML element to test.
     */
    function isRectWithinWindow(element) {
        const rect = element.getBoundingClientRect();
        return rect.x >= 0
            && rect.x < window.innerWidth
            && rect.y >= 0
            && rect.y < window.innerHeight
            ;
    }

    /**
     * Converts function having callback as last argument to a function that returns promise.
     * @param func - function to convert.
     */
    function promisify(func) {
        return function (...args) {
            return new Promise(function (resolve, reject) {
                func.call(null, ...args, function (err, value) {
                    if (err) reject(err);
                    else if (value) resolve(value);
                    else resolve();
                });
            });
        };
    }

    /* This is our first test suite - a test suite just contains
    * a related set of tests. This suite is all about the RSS
    * feeds definitions, the allFeeds variable in our application.
    */
    describe("RSS Feeds", function () {
        /* This is our first test - it tests to make sure that the
         * allFeeds variable has been defined and that it is not
         * empty. Experiment with this before you get started on
         * the rest of this project. What happens when you change
         * allFeeds in app.js to be an empty array and refresh the
         * page?
         */
        it("are defined", function () {
            expect(allFeeds).toBeDefined();
            expect(allFeeds.length).not.toBe(0);
        });

        /* Test that loops through each feed
         * in the allFeeds object and ensures it has a URL defined
         * and that the URL is not empty.
         */
        it("have not empty URL", function () {
            for (const feed of allFeeds) {
                expect(feed.url).toBeTruthy("url should not be empty");
                expect(feed.url.trim()).toBeTruthy("url should not be blank");
            }
        });

        /* Test that loops through each feed
         * in the allFeeds object and ensures it has a name defined
         * and that the name is not empty.
         */
        it("have not empty name", function () {
            for (const feed of allFeeds) {
                expect(feed.name).toBeTruthy("name should not be empty");
                expect(feed.name.trim()).toBeTruthy("name should not be blank");
            }
        });
    });

    /* Test suite named "The menu" */
    describe("The menu", function () {
        /* Test that ensures the menu element is
         * hidden by default. You'll have to analyze the HTML and
         * the CSS to determine how we're performing the
         * hiding/showing of the menu element.
         */
        it("hidden by default", function () {
            const body = document.body;
            const menu = document.querySelector(".slide-menu");
            expect(body.classList.contains("menu-hidden")).toBeTruthy("body should have 'menu-hidden' class");
            expect(isRectWithinWindow(menu)).toBeFalsy("should be off-screen");
        });

        /* Test that ensures the menu changes
         * visibility when the menu icon is clicked. This test
         * should have two expectations: does the menu display when
         * clicked and does it hide when clicked again.
         */
        it("change state on click", async function (done) {
            const body = document.body;
            const menu = document.querySelector(".slide-menu");
            const icon = document.querySelector(".menu-icon-link");
            const token = "menu-hidden";

            // check become visible after first click
            icon.click();
            await delay(1000);
            expect(body.classList.contains(token)).toBeFalsy(`body should not have '${token}' class`);
            expect(isRectWithinWindow(menu)).toBeTruthy("should be on screen");

            // check become invisible after second click
            icon.click();
            await delay(1000);
            expect(body.classList.contains(token)).toBeTruthy(`body should have '${token}' class`);
            expect(isRectWithinWindow(menu)).toBeFalsy("should be off-screen");

            // complete
            done();
        });
    });

    /* Test suite named "Initial Entries" */
    describe("Initial Entries", function () {

        let index = 0;
        beforeEach(function (done) {
            $(".feed").empty();
            loadFeed(index, done);
        });

        /* Test that ensures when the loadFeed
         * function is called and completes its work, there is at least
         * a single .entry element within the .feed container.
         * Remember, loadFeed() is asynchronous so this test will require
         * the use of Jasmine's beforeEach and asynchronous done() function.
         */
        for (const feed of allFeeds)
            it(`has new entries after loading feed '${feed.name}'`, function (done) {
                const size = $(".feed .entry").length;
                expect(size).toBeGreaterThan(0, "should fetch at least one new entry from the feed");
                index++;
                done();
            });
    });

    /* Test suite named "New Feed Selection" */
    describe("New Feed Selection", function () {

        beforeEach(function (done) {
            $(".feed").empty();
            loadFeed(0, done);
        });

        /* Test that ensures when a new feed is loaded
         * by the loadFeed function that the content actually changes.
         * Remember, loadFeed() is asynchronous.
         */
        it("content changes after loading new feed", async function (done) {
            const prev = $(".feed").html();
            await promisify(loadFeed)(1);
            expect($(".feed").html()).not.toBe(prev);
            done();
        });
    });
}());
