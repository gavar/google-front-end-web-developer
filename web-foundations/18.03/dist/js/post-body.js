(function (Swiper) {
    'use strict';

    Swiper = Swiper && Swiper.hasOwnProperty('default') ? Swiper['default'] : Swiper;

    function querySelectorWithParents(element, selector) {
        return element && element.querySelector(selector) ||
            querySelectorInParents(element, selector);
    }
    function querySelectorInParents(element, selector) {
        // while has parent
        for (; element; element = element.parentElement) {
            var query = element.querySelector(selector);
            if (query)
                { return query; }
        }
    }
    var Html = {
        querySelectorWithParents: querySelectorWithParents,
        querySelectorInParents: querySelectorInParents,
    };

    function stop(element, recursive) {
        if ( recursive === void 0 ) recursive = true;

        pause(element, recursive, true);
    }
    function pause(element, recursive, stop) {
        if ( recursive === void 0 ) recursive = true;
        if ( stop === void 0 ) stop = false;

        if (!element)
            { return; }
        var videos = recursive
            ? element.querySelectorAll("video")
            : [element.querySelector("video")];
        for (var i = 0, list = videos; i < list.length; i += 1) {
            var video = list[i];

            video.pause();
            if (stop)
                { video.currentTime = 0; }
        }
    }
    function toggle(video) {
        if (playing(video))
            { video.pause(); }
        else
            { video.play(); }
    }
    function playing(video) {
        return video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
    }
    var HtmlVideo = {
        stop: stop,
        pause: pause,
        toggle: toggle,
        playing: playing,
    };

    function onSlideChange() {
        HtmlVideo.stop(this.slides[this.previousIndex]);
    }
    var SwiperCommons = {
        onSlideChange: onSlideChange,
    };

    function windowHeight() {
        // devices have tiny bar at the top which shows charge level, we assume its height is 20px
        var size = window.innerHeight >= window.innerWidth ? screen.height : screen.width;
        if (window.innerHeight < size)
            { size -= 20; }
        return size;
    }
    var VHChromeFix = function VHChromeFix() {
        var this$1 = this;

        this.styleables = [];
        var userAgent = navigator.userAgent;
        var androidChrome = /chrome/i.test(userAgent) && /android/i.test(userAgent);
        var iOSChrome = /crios/i.test(userAgent);
        // HACK: devtools doesn't have menu bar
        var fullscreen = window.innerHeight == screen.height || window.innerHeight == screen.width;
        this.active = !fullscreen && androidChrome || iOSChrome;
        if (this.active) {
            // BUG: do not change to .bind(this)
            var update = function () { return this$1.update(); };
            window.addEventListener('resize', update);
            window.addEventListener('orientationchange', update);
        }
    };
    VHChromeFix.prototype.setStyleBySelector = function setStyleBySelector (selector, style, onResize) {
        this.setStyle(document.querySelectorAll(selector), style, onResize);
    };
    VHChromeFix.prototype.setStyle = function setStyle (elements, style, onResize) {
        var explicitStyle = new ExplicitStyle();
        Object.assign(explicitStyle, style);
        explicitStyle.elements = elements;
        explicitStyle.onResize = onResize;
        var height = windowHeight();
        if (this.active)
            { explicitStyle.apply(height); }
        this.styleables.push(explicitStyle);
    };
    VHChromeFix.prototype.usePrefixStyle = function usePrefixStyle (elements, onResize) {
        var prefixStyle = new PrefixStyle();
        prefixStyle.elements = elements;
        prefixStyle.onResize = onResize;
        var height = windowHeight();
        if (this.active)
            { prefixStyle.apply(height); }
        this.styleables.push(prefixStyle);
    };
    VHChromeFix.prototype.update = function update () {
            var this$1 = this;

        var height = windowHeight();
        for (var i = 0; i < this.styleables.length; i++)
            { this$1.styleables[i].apply(height); }
    };
    var ExplicitStyle = function ExplicitStyle () {};

    ExplicitStyle.prototype.apply = function apply (height) {
            var this$1 = this;

        var style;
        for (var i = 0; i < this.elements.length; i++) {
            style = this$1.elements[i].style;
            style.height = this$1.height && ((height * this$1.height / 100) + "px");
            style.minHeight = this$1.minHeight && ((height * this$1.minHeight / 100) + "px");
            style.maxHeight = this$1.maxHeight && ((height * this$1.maxHeight / 100) + "px");
        }
        if (this.onResize)
            { this.onResize(); }
    };
    var PrefixStyle = function PrefixStyle () {};

    PrefixStyle.prototype.apply = function apply (height) {
            var this$1 = this;

        var value;
        var style;
        var computedStyle;
        for (var i = 0; i < this.elements.length; i++) {
            style = this$1.elements[i].style;
            computedStyle = window.getComputedStyle(this$1.elements[i]);
            value = computedStyle.getPropertyValue("--chrome-height");
            style.height = value && ((height * value / 100) + "px");
            value = computedStyle.getPropertyValue("--chrome-min-height");
            style.minHeight = value && ((height * value / 100) + "px");
            value = computedStyle.getPropertyValue("--chrome-max-height");
            style.maxHeight = value && ((height * value / 100) + "px");
        }
        if (this.onResize)
            { this.onResize(); }
    };

    function memoize(swiper) {
        return swiper && {
            keyboard: {
                enabled: swiper.keyboard.enabled,
            }
        };
    }
    function restore(value, memory) {
        if (!value || !memory)
            { return; }
        value.keyboard.enabled = memory.keyboard.enabled;
    }
    var projectGalleryLightbox;
    var ProjectGalleryLightbox = function ProjectGalleryLightbox(swiper) {
        var this$1 = this;

        var self = this;
        this.swiper = swiper;
        this.swiper.controller.control = [];
        this.root = Html.querySelectorInParents(this.swiper.el, ".project-gallery-lightbox");
        this.swiper.wrapperEl.addEventListener("click", function (e) {
            // toggle play state on video
            if (e.target instanceof HTMLVideoElement)
                { HtmlVideo.toggle(e.target); }
            // do not close when clicking on slide content
            if (!e.toElement.classList.contains("swiper-slide"))
                { e.stopPropagation(); }
        });
        // do not close when clicking on navigation
        this.swiper.navigation.nextEl.addEventListener("click", function (e) { return e.stopPropagation(); });
        this.swiper.navigation.prevEl.addEventListener("click", function (e) { return e.stopPropagation(); });
        // do not close when clicking on pagination
        this.swiper.pagination.el.addEventListener("click", function (e) { return e.stopPropagation(); });
        // close when any other type of click appears
        this.root.addEventListener("click", function (e) {
            self.close();
        });
        // avoid site scroll when lightbox is open
        this.root.addEventListener("wheel", function (e) {
            e.preventDefault();
        }, false);
        this.root.addEventListener("touchmove", function (e) {
            e.preventDefault();
        }, false);
        var update = function () { this$1.swiper.update(); };
        window.addEventListener('resize', update);
        window.addEventListener('resize', function () { return setTimeout(update, 100); }); // chrome fix
        window.addEventListener('resize', function () { return setTimeout(update, 150); }); // chrome fix
    };
    ProjectGalleryLightbox.prototype.open = function open (source) {
            var this$1 = this;

        // set active source
        this.setSource(source);
        // avoid controlling source via keyboard
        source.keyboard.disable();
        // populate slides
        this.swiper.removeAllSlides();
        for (var i = 0; i < source.slides.length; i++)
            { this$1.swiper.appendSlide(source.slides[i].cloneNode(true)); }
        this.swiper.activeIndex = source.activeIndex;
        // this.swiper.controller.control = source;
        this.root.classList.add("show");
        this.swiper.update();
    };
    ProjectGalleryLightbox.prototype.close = function close () {
        this.setSource(void 0);
        delete this.swiper.controller.control;
        this.root.classList.remove("show");
    };
    ProjectGalleryLightbox.prototype.setSource = function setSource (next) {
        // restore setting of currently active swiper
        if (this.source && this.source != next)
            { restore(this.source, this.memory); }
        // save setting of next swiper
        this.source = next;
        this.memory = memoize(next);
    };
    var options = {
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
        lazy: {
            loadOnTransitionStart: true,
            preloaderClass: "lazy-preloader",
        },
        keyboard: {
            enabled: true,
        }
    };
    var swiper = new Swiper(".project-gallery-lightbox .swiper-container", options);
    swiper.on('init', function () {
        this.on('slideChange', SwiperCommons.onSlideChange);
        this.params.pagination.el = Html.querySelectorWithParents(this.el, ".swiper-pagination");
        this.pagination.init();
    });
    swiper.init();
    projectGalleryLightbox = new ProjectGalleryLightbox(swiper);

    var options$1 = {
        init: false,
        direction: "horizontal",
        runCallbacksOnInit: true,
        spaceBetween: "1.5%",
        preloadImages: false,
        navigation: {
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next",
        },
        pagination: {
            clickable: true,
        },
        lazy: {
            loadOnTransitionStart: true,
            preloaderClass: "lazy-preloader",
        },
        // will be enabled if contains more than one slide
        allowSlidePrev: false,
        allowSlideNext: false,
        allowTouchMove: false,
    };
    // fix chrome viewport height (vh) on mobiles
    var vhFix = new VHChromeFix();
    var swipers = new Swiper(".project-gallery .swiper-container", options$1);
    for (var i = 0, list = swipers; i < list.length; i += 1) {
        var swiper$1 = list[i];

        swiper$1.once('init', function () {
            var this$1 = this;

            var self = this;
            // activate swiping and navigation when more than one slide
            if (this.slides.length > 1) {
                this.allowSlidePrev = true;
                this.allowSlideNext = true;
                this.allowTouchMove = true;
                // show navigation
                this.navigation.nextEl.classList.remove(this.params.navigation.hiddenClass);
                this.navigation.prevEl.classList.remove(this.params.navigation.hiddenClass);
                // setup pagination
                this.params.pagination.el = Html.querySelectorWithParents(this.el, ".swiper-pagination");
                this.params.pagination.el.classList.remove(this.params.pagination.hiddenClass);
                this.pagination.init();
                // render pagination
                this.pagination.render();
                this.pagination.bullets[this.activeIndex].classList.add(this.params.pagination.bulletActiveClass);
                // open lightbox on click
                this.wrapperEl.addEventListener('click', function (e) {
                    // play video instead of opening lightbox
                    if (e.target instanceof HTMLVideoElement) {
                        HtmlVideo.toggle(e.target);
                    }
                    else {
                        projectGalleryLightbox.open(self);
                    }
                });
            }
            var update = function () { return this$1.update(); };
            // update when orientation changes
            window.addEventListener("orientationchange", update);
            // update when changing size of images
            vhFix.usePrefixStyle([this.wrapperEl], update);
        });
        swiper$1.on('slideChange', SwiperCommons.onSlideChange);
        swiper$1.on('lazyImageReady', function (slide, image) {
            image.alt = image.getAttribute('data-alt');
        });
        swiper$1.init();
    }

}(Swiper));