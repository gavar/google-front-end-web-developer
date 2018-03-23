declare module "swiper" {

    /** {@link Swiper} Parameters. */
    export interface SwiperOptions {

        /* PROPERTIES */

        /**
         * Whether Swiper should be initialised automatically when you create an instance.
         * If disabled, then you need to init it manually by calling {@link Swiper#init}.
         * @default true
         */
        init?: boolean;

        /**
         * Index number of initial slide.
         * @default 0
         */
        initialSlide?: number;

        /**
         * Could be 'horizontal' or 'vertical' (for vertical slider).
         * @default 'horizontal'.
         */
        direction?: 'horizontal' | 'vertical';

        /**
         * Set to <code>true</code> and slider wrapper will adopt its height to the height of the currently active slide.
         * @default false.
         */
        autoHeight?: boolean;

        /**
         * Set to <code>true</code> to round values of slides width and height to prevent blurry texts on usual resolution screens (if you have such).
         * @default false.
         */
        roundLengths?: boolean;

        /**
         * Fire [ Transition / SlideChange] [ Start / End] events on swiper initialization.
         * Such events will be fired on initialization in case of your {@link initialSlide} is not 0, or you use {@link loop} mode.
         */
        runCallbacksOnInit?: boolean;

        /* TOUCHES */

        /**
         * If <code>false</code>, then the only way to switch the slide is use of external API functions like {@link slidePrev} or {@link slideNext}.
         * @default true
         */
        allowTouchMove?: boolean

        /** Pagination Parameters. */
        pagination?: {
            /**
             * String with CSS selector or HTML element of the container with pagination.
             * @default null
             */
            el?: string | HTMLElement;

            /**
             * String with type of pagination.
             * @default 'bullets'
             */
            type?: "bullets" | "fraction" | "progressbar" | "custom";

            /**
             * If <code>true</code> then clicking on pagination button will cause transition to appropriate slide.
             * Only for <code>"bullets"</code> pagination type.
             * @default true
             */
            clickable?: boolean;

            /**
             * CSS class name of currently active pagination bullet.
             * @default 'swiper-pagination-bullet-active'
             */
            bulletActiveClass?: string;

            /**
             * CSS class name of pagination when it becomes inactive.
             * @default 'swiper-pagination-hidden'
             */
            hiddenClass?: string;
        }

        /** Navigation Parameters */
        navigation?: {
            /**
             * String with CSS selector or HTML element of the element that will work like "next" button after click on it.
             * @default null
             */
            nextEl?: string | HTMLElement,

            /**
             * String with CSS selector or HTML element of the element that will work like "prev" button after click on it.
             * @default null
             */
            prevEl?: string | HTMLElement,

            /**
             * Toggle navigation buttons visibility after click on Slider's container.
             * @default false
             */
            hideOnClick?: boolean,

            /**
             * CSS class name added to navigation button when it becomes disabled.
             * @default 'swiper-button-disabled'
             */
            disabledClass?: string;

            /**
             * CSS class name added to navigation button when it becomes hidden.
             * @default 'swiper-button-hidden'
             */
            hiddenClass?: string;
        }

        /* LOOP */

        /**
         * Set to <code>true</code> to enable continuous loop mode.
         * @warning If you use it along with <b>{@link slidesPerView}: 'auto'</b>,
         * then you need to specify {@link loopedSlides} parameter with amount of slides to loop (duplicate).
         * @default false
         */
        loop?: boolean;

        /**
         * If you use {@link slidesPerView}:'auto' with loop mode you should tell
         * how many slides it should loop (duplicate) using this parameter
         * @default 0
         */
        loopedSlides?: number;

        /* SLIDES GRID */

        /**
         * Number of slides per view (slides visible at the same time on slider's container).
         * @warning If you use it with <b>'auto'</b> value and along with <b>{@link loop}: true</b>
         * then you need to specify {@link loopedSlides} parameter with amount of slides to loop (duplicate)
         * @default 1
         */
        slidesPerView?: number | 'auto';


        /* SWIPING / NO SWIPING */

        /**
         * Set to <code>false</code> to disable swiping to previous slide direction (to left or top).
         * @default true
         */
        allowSlidePrev?: boolean;

        /**
         * Set to <code>false</code> to disable swiping to next slide direction (to right or bottom).
         * @default true
         */
        allowSlideNext?: boolean;
    }

    export interface SwiperSlide extends HTMLElement {
        /** @inheritDoc */
        cloneNode(deep?: boolean): this;
    }

    export default class Swiper {
        constructor(container: string | Element, options?: SwiperOptions);

        /** Object with passed initialization parameters. */
        params: SwiperOptions;

        /** HTML element with slider container. */
        el: HTMLElement;

        /** HTML element with slider wrapper. */
        wrapperEl: HTMLElement;

        /** Array-like collection of slides HTML elements. **/
        slides: SwiperSlide[];

        /** Width of container. */
        width: number;

        /** Height of container. */
        height: number;

        /** Current value of wrapper translate. */
        translate: number;

        /** Current progress of wrapper translate (from 0 to 1). */
        progress: number;

        /**
         * Index number of currently active slide.
         * @warning Note, that in {@link SwiperOptions#loop} mode active
         * index value will be always shifted on a number of looped / duplicated slides.
         */
        activeIndex: number;

        /** Index number of currently active slide considering duplicated slides in {@link SwiperOptions#loop} mode */
        realIndex: number;

        /** Index number of previously active slide. */
        previousIndex: number;

        /**
         * Disable / enable ability to slide to the next slides
         * by assigning <code>false</code>/<code>true</code> to this property.
         */
        allowSlideNext: boolean;

        /**
         * Disable / enable ability to slide to the previous slides
         * by assigning <code>false</code>/<code>true</code> to this property.
         */
        allowSlidePrev: boolean;

        /**
         * Disable / enable ability move slider by grabbing it with mouse or by touching it with finger (on touch screens)
         * by assigning <code>false</code>/<code>true</code> to this property.
         */
        allowTouchMove: boolean;

        /** Navigation Methods & Properties */
        navigation: {
            /** HTML element of "prev" navigation button. */
            prevEl: HTMLElement,

            /** HTML element of "next" navigation button. */
            nextEl: HTMLElement,
        };

        /** Pagination Methods & Properties */
        pagination: {
            /** Pagination container element HTML element. */
            el: HTMLElement;

            /** Array-like collection of pagination bullets HTML elements. **/
            bullets: ArrayLike<HTMLElement>;

            /** no documentation available. */
            init(): void;

            /** Render pagination layout. */
            render(): void;

            /** Update pagination state (enabled/disabled/active). */
            update(): void;
        };

        /** Keyboard Methods & Properties. */
        keyboard: {
            /** Whether the keyboard control is enabled. */
            enabled: boolean;

            /** Enable keyboard control. */
            enable(): void;

            /** Disable keyboard control. */
            disable(): void;
        };

        /** no documentation available. */
        init(): void;

        /**
         * Run transition to next slide.
         * @param {number} speed - transition duration (in ms).
         * @param {boolean} runCallbacks - set it to <code>false</code> (by default it is <code>true</code>)
         * and transition will not produce transition events.
         */
        slideNext(speed?: number, runCallbacks?: boolean): void;

        /**
         * Run transition to previous slide.
         * @param {number} speed - transition duration (in ms).
         * @param {boolean} runCallbacks - set it to <code>false</code> (by default it is <code>true</code>)
         * and transition will not produce transition events.
         */
        slidePrev(speed?: number, runCallbacks?: boolean): void;

        /**
         * Run transition to the slide with index number equal to {@param index} parameter for the duration equal to {@param speed} parameter.
         * @param {number} index - index number of slide.
         * @param {number} speed -  transition duration (in ms).
         * @param {boolean} runCallbacks - set it to <code>false</code> (by default it is <code>true</code>)
         * and transition will not produce transition events.
         */
        slideTo(index: number, speed?: number, runCallbacks?: boolean): void;

        /**
         * Does the same as {@see slideTo} but for the case when used with enabled {@see loop}.
         * So this method will slide to slides with {@see realIndex} matching to passed {@param index}.
         * @param {number} index - index number of slide.
         * @param {number} speed -  transition duration (in ms).
         * @param {boolean} runCallbacks - set it to <code>false</code> (by default it is <code>true</code>)
         * and transition will not produce transition events.
         */
        slideToLoop(index: number, speed?: number, runCallbacks?: boolean): void;

        /**
         * You should call it after you add/remove slides manually, or after you hide/show it, or do any custom DOM modifications with Swiper.
         */
        update(): void;

        /**
         * Add new slides to the end
         * @param slides - slide or array of slides to add.
         */
        appendSlide(slides: string | ArrayLike<string> | HTMLElement | ArrayLike<HTMLElement>);

        /** Remove all slides. */
        removeAllSlides(): void;

        /**
         * Add event listener.
         * @param {string} event - event to listen for.
         * @param handler - event handler to invoke when event occurs.
         */
        on(event: string, handler: (this: Swiper) => void): void;

        /**
         * Add event listener that will be executed only once.
         * @param {string} event - event to listen for.
         * @param handler - event handler to invoke when event occurs.
         */
        once(event: string, handler: (this: Swiper) => void): void;

        /**
         * Remove event listener for specified event.
         * @param {string} event - event to remove.
         * @param handler - event handler to remove.
         */
        off(event: string, handler: (this: Swiper) => void): void;

        /**
         * Remove all listeners for specified event.
         * @param {string} event - event to remove.
         */
        off(event: string): void;
    }
}
