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
        swiper.once('init', function (this: Swiper) {
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

        swiper.on('slideChange', function (this: Swiper) {
            const prev = this.slides[this.previousIndex];

            // pause video when change slide
            const video = prev.querySelector("video");
            if (video instanceof HTMLVideoElement) {
                video.pause();
            }
        });

        swiper.init();
    }
})();
