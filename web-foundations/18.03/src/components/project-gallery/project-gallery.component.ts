import Swiper from "swiper";

// initialize project gallery swipers
(function () {
    const swipers: Swiper[] = new Swiper(".project-gallery .swiper-container", {
        init: false,
        direction: "horizontal",
        runCallbacksOnInit: true,
        navigation: {
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next",
        },
        // will be enabled if contains more than one slide
        allowSlidePrev: false,
        allowSlideNext: false,
        allowTouchMove: false,
    }) as any;

    for (const swiper of swipers) {
        swiper.on('init', function (this: Swiper) {
            // activate swiping and navigation
            if (this.slides.length > 1) {
                this.keyboard.enable();
                this.allowSlidePrev = true;
                this.allowSlideNext = true;
                this.allowTouchMove = true;

                // show navigation
                this.navigation.nextEl.classList.remove("hidden");
                this.navigation.prevEl.classList.remove("hidden");
            }
        });
        swiper.init();
    }
})();
