import Swiper, {SwiperOptions} from "swiper";
import {HtmlUtil, SwiperUtil} from "../common";

export let projectGalleryLightbox: ProjectGalleryLightbox;

export class ProjectGalleryLightbox {

    private source: Swiper;
    private memory: SwiperMemory;

    public readonly swiper: Swiper;
    public readonly root: HTMLElement;

    constructor(swiper: Swiper) {
        this.swiper = swiper;
        this.swiper.controller.control = [];
        this.root = HtmlUtil.querySelectorInParents<HTMLElement>(this.swiper.el, ".project-gallery-lightbox");
        this.root.querySelector<HTMLElement>(".project-gallery-lightbox-bg").addEventListener("click", this.close.bind(this));
    }

    public open(source: Swiper) {

        // set active source
        this.setSource(source);

        // avoid controlling source via keyboard
        source.keyboard.disable();

        // populate slides
        this.swiper.removeAllSlides();
        for (let i = 0; i < source.slides.length; i++)
            this.swiper.appendSlide(source.slides[i].cloneNode(true));

        this.swiper.activeIndex = source.activeIndex;
        this.swiper.controller.control = source;

        this.root.classList.add("show");
        this.swiper.update();
    }

    public close() {
        this.setSource(void 0);
        delete this.swiper.controller.control;
        this.root.classList.remove("show");
    }

    private setSource(next: Swiper) {

        // restore setting of currently active swiper
        if (this.source && this.source != next)
            ProjectGalleryLightbox.restore(this.source, this.memory);

        // save setting of next swiper
        this.source = next;
        this.memory = ProjectGalleryLightbox.memoize(next);
    }

    private static memoize(swiper: Swiper): SwiperMemory {
        return swiper && {
            keyboard: {
                enabled: swiper.keyboard.enabled,
            }
        }
    }

    private static restore(value: Swiper, memory: SwiperMemory) {
        if (!value || !memory)
            return;

        value.keyboard.enabled = memory.keyboard.enabled;
    }
}

(function () {
    const options: SwiperOptions = {
        init: false,
        direction: "horizontal",
        roundLengths: true,
        allowTouchMove: true,
        navigation: {
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next",
        },
        pagination: {
            clickable: true,
        },
        keyboard: {
            enabled: true,
        }
    };

    const swiper = new Swiper(".project-gallery-lightbox .swiper-container", options);
    swiper.on('init', function (this: Swiper) {
        this.on('slideChange', SwiperUtil.onSlideChange);
        this.params.pagination.el = HtmlUtil.querySelectorWithPararents<HTMLElement>(this.el, ".swiper-pagination");
        this.pagination.init();
    });
    swiper.init();
    projectGalleryLightbox = new ProjectGalleryLightbox(swiper);
})();


interface SwiperMemory {
    keyboard: {
        enabled: boolean;
    }
}
