declare module "swiper" {
    interface SwiperOptions {
        init?: boolean;
        initialSlide?: number;
        direction?: string;
        speed?: number;
        setWrapperSize?: boolean;
        virtualTranslate?: boolean;
        width?: number;
        height?: number;
        autoHeight?: boolean;
        roundLengths?: boolean;
        nested?: boolean;

        // Autoplay
        autoplay?: number;
        autoplayStopOnLast?: boolean;
        autoplayDisableOnInteraction?: boolean;

        // Progress
        watchSlidesProgress?: boolean;
        watchSlidesVisibility?: boolean;

        // Freemode
        freeMode?: boolean;
        freeModeMomentum?: boolean;
        freeModeMomentumRatio?: number;
        freeModeMomentumVelocityRatio?: number;
        freeModeMomentumBounce?: boolean;
        freeModeMomentumBounceRatio?: number;
        freeModeMinimumVelocity?: number;
        freeModeSticky?: boolean;

        // Effects
        effect?: string;
        fade?: {};
        cube?: {};
        coverflow?: {};
        flip?: {};

        // Parallax
        parallax?: boolean;

        // Slides grid
        spaceBetween?: number;
        slidesPerView?: number | string;
        slidesPerColumn?: number;
        slidesPerColumnFill?: string;
        slidesPerGroup?: number;
        centeredSlides?: boolean;
        slidesOffsetBefore?: number;
        slidesOffsetAfter?: number;

        // Grab Cursor
        grabCursor?: boolean;

        // Touches
        allowTouchMove?: boolean;
        touchEventsTarget?: string;
        touchRatio?: number;
        touchAngle?: number;
        simulateTouch?: boolean;
        shortSwipes?: boolean;
        longSwipes?: boolean;
        longSwipesRatio?: number;
        longSwipesMs?: number;
        followFinger?: boolean;
        onlyExternal?: boolean;
        threshold?: number;
        touchMoveStopPropagation?: boolean;
        iOSEdgeSwipeDetection?: boolean;
        iOSEdgeSwipeThreshold?: number;

        // Touch Resistance
        resistance?: boolean;
        resistanceRatio?: number;

        // Clicks
        preventClicks?: boolean;
        preventClicksPropagation?: boolean;
        slideToClickedSlide?: boolean;

        // Swiping / No swiping
        allowSwipeToPrev?: boolean;
        allowSwipeToNext?: boolean;
        noSwiping?: boolean;
        noSwipingClass?: string;
        swipeHandler?: string | Element;

        // Navigation Controls
        uniqueNavElements?: boolean;
        navigation?: {
            hideOnClick: boolean,
            prevEl: string,
            nextEl: string,
        }

        // Pagination
        pagination?: string | Element;
        paginationType?: string;
        paginationHide?: boolean;
        paginationClickable?: boolean;
        paginationElement?: string;
        // Navigation Buttons
        nextButton?: string | Element;
        prevButton?: string | Element;
        // Scollbar
        scrollbar?: string | Element | SwiperScrollbarOptions;
        scrollbarHide?: boolean;
        scrollbarDraggable?: boolean;
        scrollbarSnapOnRelease?: boolean;
        // Accessibility
        a11y?: boolean;
        prevSlideMessage?: string;
        nextSlideMessage?: string;
        firstSlideMessage?: string;
        lastSlideMessage?: string;
        paginationBulletMessage?: string;
        // Keyboard / Mousewheel
        keyboardControl?: boolean;
        mousewheelControl?: boolean;
        mousewheelForceToAxis?: boolean;
        mousewheelReleaseOnEdges?: boolean;
        mousewheelInvert?: boolean;
        mousewheelSensitivity?: number;
        // Hash Navigation
        hashnav?: boolean;
        hashnavWatchState?: boolean;
        history?: string;
        // Images
        preloadImages?: boolean;
        updateOnImagesReady?: boolean;
        lazyLoading?: boolean;
        lazyLoadingInPrevNext?: boolean;
        lazyLoadingInPrevNextAmount?: number;
        lazyLoadingOnTransitionStart?: boolean;
        // Loop
        loop?: boolean;
        loopAdditionalSlides?: number;
        loopedSlides?: number;
        zoom?: boolean;
        // Controller
        control?: Swiper;
        controlInverse?: boolean;
        controlBy?: string;
        // Observer
        observer?: boolean;
        observeParents?: boolean;
        // Breakpoints
        breakpoints?: {};
        // Callbacks
        runCallbacksOnInit?: boolean;
        // Namespace
        slideClass?: string;
        slideActiveClass?: string;
        slideVisibleClass?: string;
        slideDuplicateClass?: string;
        slideNextClass?: string;
        slidePrevClass?: string;
        wrapperClass?: string;
        bulletClass?: string;
        bulletActiveClass?: string;
        paginationHiddenClass?: string;
        paginationCurrentClass?: string;
        paginationTotalClass?: string;
        paginationProgressbarClass?: string;
        buttonDisabledClass?: string;
        paginationBulletRender?(swiper: Swiper, index: number, className: string): void;
        paginationFractionRender?(swiper: Swiper, currentClassName: string, totalClassName: string): void;
        paginationProgressRender?(swiper: Swiper, progressbarClass: string): void;
        paginationCustomRender?(swiper: Swiper, current: number, total: number): void;
        onInit?(swiper: Swiper): void;
        onSlideChangeStart?(swiper: Swiper): void;
        onSlideChangeEnd?(swiper: Swiper): void;
        onSlideNextStart?(swiper: Swiper): void;
        onSlideNextEnd?(swiper: Swiper): void;
        onSlidePrevStart?(swiper: Swiper): void;
        onSlidePrevEnd?(swiper: Swiper): void;
        onTransitionStart?(swiper: Swiper): void;
        onTransitionEnd?(swiper: Swiper): void;
        onTouchStart?(swiper: Swiper, event: Event): void;
        onTouchMove?(swiper: Swiper, event: Event): void;
        onTouchMoveOpposite?(swiper: Swiper, event: Event): void;
        onSliderMove?(swiper: Swiper, event: Event): void;
        onTouchEnd?(swiper: Swiper, event: Event): void;
        onClick?(swiper: Swiper, event: Event): void;
        onTap?(swiper: Swiper, event: Event): void;
        onDoubleTap?(swiper: Swiper, event: Event): void;
        onImagesReady?(swiper: Swiper): void;
        onProgress?(swiper: Swiper, progress: number): void;
        onReachBeginning?(swiper: Swiper): void;
        onReachEnd?(swiper: Swiper): void;
        onDestroy?(swiper: Swiper): void;
        onSetTranslate?(swiper: Swiper, translate: any): void;
        onSetTransition?(swiper: Swiper, transition: any): void;
        onAutoplay?(swiper: Swiper): void;
        onAutoplayStart?(swiper: Swiper): void;
        onAutoplayStop?(swiper: Swiper): void;
        onLazyImageLoad?(swiper: Swiper, slide: any, image: any): void;
        onLazyImageReady?(swiper: Swiper, slide: any, image: any): void;
        onPaginationRendered?(swiper: Swiper, paginationContainer: any): void;
        onScroll?(swiper: Swiper, event: Event): void;
        onBeforeResize?(swiper: Swiper): void;
        onAfterResize?(swiper: Swiper): void;
        onKeyPress?(swiper: Swiper, kc: any): void;
    }

    interface SwiperScrollbarOptions {
        container: string;          // Default: '.swiper-scrollbar'
        draggable?: boolean;        // Default: true
        hide?: boolean;             // Default: true
        snapOnRelease?: boolean;    // Default: false
    }

    interface SwiperSlide extends HTMLElement {
        cloneNode(deep?: boolean): this;
    }

    class Swiper {
        constructor(container: string | Element, options?: SwiperOptions);

        // Properties
        width: number;
        height: number;
        params: any;
        positions: any;
        wrapper: any;
        virtualSize: number;
        el: HTMLElement;

        // Feature detection
        support: {
            touch: boolean;
            transforms: boolean;
            transforms3d: boolean;
            transitions: boolean;
        };

        // Browser detection
        browser: {
            ie8: boolean;
            ie10: boolean;
        };

        // Keyboard Control
        keyboard: {
            enabled: boolean;
            enable(): void;
            disable(): void;
        };

        // Navigation
        allowSlidePrev: boolean;
        allowSlideNext: boolean;
        allowTouchMove: boolean;
        activeIndex: number;
        activeLoopIndex: number;
        activeLoaderIndex: number;
        previousIndex: number;
        swipeNext(internal?: boolean): boolean;
        swipePrev(internal?: boolean): boolean;
        swipeReset(): boolean;
        swipeTo(index: number, speed?: number, runCallbacks?: boolean): boolean;
        activeSlide(): SwiperSlide;
        updateActiveSlide(index: number): void;

        // Controller
        controller: {
            control: Swiper[];
            inverse: boolean;
            by: string;
        };

        // Events
        touches: any;
        isTouched: boolean;
        clickedSlideIndex: number;
        clickedSlide: SwiperSlide;
        wrapperTransitionEnd(callback: () => void, permanent: boolean): void;
        on(event: string, callback: (this: Swiper) => void);

        // Init/reset
        init();
        destroy(deleteInstance: boolean, cleanupStyles: boolean): void;
        reInit(forceCalcSlides?: boolean): void;
        resizeFix(reInit?: boolean): void;


        // Autoplaying
        autoplay: boolean;
        startAutoplay(): void;
        stopAutoplay(): void;

        // Other methods
        getWrapperTranslate(axis: string): number;  // 'x' or 'y'
        setWrapperTranslate(x: number, y: number, z: number): void;
        setWrapperTransition(duration: any): void;

        // Slides API

        slides: SwiperSlide[];

        slidePrev(runCallbacks?: boolean, speed?: number): void;
        slideNext(runCallbacks?: boolean, speed?: number): void;
        slideTo(index: number, speed?: number, runCallbacks?: boolean): void;
        update(updateTranslate?: boolean): void;
        onResize(): void;
        detachEvents(): void;
        attachEvents(): void;

        appendSlide(slides: HTMLElement | string | string[]): void;
        prependSlide(slides: HTMLElement | string | string[]): void;
        removeSlide(slideIndex: number): void;
        removeAllSlides(): void;

        lockSwipeToNext(): void;
        unlockSwipeToNext(): void;
        lockSwipeToPrev(): void;
        unlockSwipeToPrev(): void;
        lockSwipes(): void;
        unlockSwipes(): void;
        disableMousewheelControl(): void;
        enableMousewheelControl(): void;
        disableKeyboardControl(): void;
        enableKeyboardControl(): void;
        disableTouchControl(): void;
        enableTouchControl(): void;
        unsetGrabCursor(): void;
        setGrabCursor(): void;

        plugins?: {
            debugger?(swiper: any, params: any): void;
        };
    }

    export = Swiper;
}



