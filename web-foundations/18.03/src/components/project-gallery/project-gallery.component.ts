import Swiper from "swiper";
import {SwiperOptions} from "swiper";

// initialize project gallery swipers
(function () {
    const options: SwiperOptions = {
        init: false,
        direction: "horizontal",
        runCallbacksOnInit: true,
        navigation: {
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next",
        },
        pagination: {
            clickable: true,
        },
        // will be enabled if contains more than one slide
        allowSlidePrev: false,
        allowSlideNext: false,
        allowTouchMove: false,
    };
    const swipers: Swiper[] = new Swiper(".project-gallery .swiper-container", options) as any;

    for (let i = 0; i < swipers.length; i++) {
        const swiper = swipers[i];
        swiper.once('init', function (this: Swiper) {
            // activate swiping and navigation
            if (this.slides.length > 1) {
                this.keyboard.enable();
                this.allowSlidePrev = true;
                this.allowSlideNext = true;
                this.allowTouchMove = true;

                // show navigation
                this.navigation.nextEl.classList.remove(this.params.navigation.hiddenClass);
                this.navigation.prevEl.classList.remove(this.params.navigation.hiddenClass);

                // setup pagination
                this.params.pagination.el = querySelectorInParents<HTMLElement>(this.el, ".swiper-pagination");
                this.params.pagination.el.classList.remove(this.params.pagination.hiddenClass);
                this.pagination.init();

                // render pagination
                this.pagination.render();
                this.pagination.bullets[this.activeIndex].classList.add(this.params.pagination.bulletActiveClass);
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

    function querySelectorInParents<E extends Element = Element>(element: Element, selector: string): E | null {
        // while has parent
        for (; element; element = element.parentElement) {
            const query = element.querySelector<E>(selector);
            if (query) return query;
        }
    }
})();
