import Swiper, {SwiperOptions} from "swiper";
import {Html, SwiperCommons} from "../common";

export let projectGalleryLightbox: ProjectGalleryLightbox;

export class ProjectGalleryLightbox {

    public readonly swiper: Swiper;
    public readonly root: HTMLElement;

    private source: Swiper;
    private memory: SwiperMemory;

    constructor(swiper: Swiper) {
        const self = this;
        this.swiper = swiper;
        this.swiper.controller.control = [];
        this.root = Html.querySelectorInParents<HTMLElement>(this.swiper.el, ".project-gallery-lightbox");

        // do not close when clicking on slide content
        this.swiper.wrapperEl.addEventListener("click", function (e: MouseEvent) {
            if (!e.toElement.classList.contains("swiper-slide"))
                e.stopPropagation();
        });

        // do not close when clicking on navigation
        this.swiper.navigation.nextEl.addEventListener("click", e => e.stopPropagation());
        this.swiper.navigation.prevEl.addEventListener("click", e => e.stopPropagation());

        // do not close when clicking on pagination
        this.swiper.pagination.el.addEventListener("click", e => e.stopPropagation());

        // close when any other type of click appears
        this.root.addEventListener("click", function (e: MouseEvent) {
            self.close();
        });

        // avoid site scroll when lightbox is open
        this.root.addEventListener("wheel", function (e: Event) {
            e.preventDefault();
        }, false)
        this.root.addEventListener("touchmove", function (e: Event) {
            e.preventDefault();
        }, false)
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

interface SwiperMemory {
    keyboard: {
        enabled: boolean;
    }
}

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
    this.on('slideChange', SwiperCommons.onSlideChange);
    this.params.pagination.el = Html.querySelectorWithParents<HTMLElement>(this.el, ".swiper-pagination");
    this.pagination.init();
});
swiper.init();
projectGalleryLightbox = new ProjectGalleryLightbox(swiper);
