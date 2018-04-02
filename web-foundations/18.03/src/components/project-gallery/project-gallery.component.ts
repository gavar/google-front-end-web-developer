import Swiper, {SwiperOptions} from "swiper";
import {Html, SwiperCommons, VHChromeFix} from "../common";
import {projectGalleryLightbox} from "../project-gallery-lightbox";

const options: SwiperOptions = {
    init: false,
    direction: "horizontal",
    runCallbacksOnInit: true,
    spaceBetween: "1.5%" as any,
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

// fix chrome viewport height (vh) on mobiles
const vhFix = new VHChromeFix();

const swipers: Swiper[] = new Swiper(".project-gallery .swiper-container", options) as any;
for (const swiper of swipers) {
    swiper.once('init', function (this: Swiper) {
        const self = this;

        // activate swiping and navigation when more than one slide
        if (this.slides.length > 1) {
            this.allowSlidePrev = true;
            this.allowSlideNext = true;
            this.allowTouchMove = true;

            // show navigation
            this.navigation.nextEl.classList.remove(this.params.navigation.hiddenClass);
            this.navigation.prevEl.classList.remove(this.params.navigation.hiddenClass);

            // setup pagination
            this.params.pagination.el = Html.querySelectorWithParents<HTMLElement>(this.el, ".swiper-pagination");
            this.params.pagination.el.classList.remove(this.params.pagination.hiddenClass);
            this.pagination.init();

            // render pagination
            this.pagination.render();
            this.pagination.bullets[this.activeIndex].classList.add(this.params.pagination.bulletActiveClass);

            // open lightbox on click
            this.wrapperEl.addEventListener('click', function (e: MouseEvent) {
                projectGalleryLightbox.open(self);
            });
        }

        const update = () => this.update();

        // update when orientation changes
        window.addEventListener("orientationchange", update);

        // update when changing size of images
        vhFix.usePrefixStyle([this.wrapperEl], update);
    });

    swiper.on('slideChange', SwiperCommons.onSlideChange);
    swiper.init();
}
