import Swiper, {SwiperOptions} from "swiper";
import {HtmlUtil, SwiperUtil} from "../common";
import {projectGalleryLightbox} from "../project-gallery-lightbox";

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
    for (const swiper of swipers) {
        swiper.once('init', function (this: Swiper) {
            // activate swiping and navigation when more than one slide
            if (this.slides.length > 1) {
                this.allowSlidePrev = true;
                this.allowSlideNext = true;
                this.allowTouchMove = true;

                // show navigation
                this.navigation.nextEl.classList.remove(this.params.navigation.hiddenClass);
                this.navigation.prevEl.classList.remove(this.params.navigation.hiddenClass);

                // setup pagination
                this.params.pagination.el = HtmlUtil.querySelectorInParents<HTMLElement>(this.el, ".swiper-pagination");
                this.params.pagination.el.classList.remove(this.params.pagination.hiddenClass);
                this.pagination.init();

                // render pagination
                this.pagination.render();
                this.pagination.bullets[this.activeIndex].classList.add(this.params.pagination.bulletActiveClass);

                // open lightbox on click
                this.on('click', function (this: Swiper) {
                    projectGalleryLightbox.open(this);
                });
            }
        });

        swiper.on('slideChange', SwiperUtil.onSlideChange);
        swiper.init();
    }
})();
