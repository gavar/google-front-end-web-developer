export class HtmlUtil {

    static querySelectorWithPararents<E extends Element = Element>(element: Element, selector: string): E | null {
        return element && element.querySelector<E>(selector) ||
            HtmlUtil.querySelectorInParents<E>(element, selector);
    }

    static querySelectorInParents<E extends Element = Element>(element: Element, selector: string): E | null {
        // while has parent
        for (; element; element = element.parentElement) {
            const query = element.querySelector<E>(selector);
            if (query) return query;
        }
    }
}

export class VideoUtil {

    static stop(element: Element, recursive: boolean = true) {
        VideoUtil.pause(element, recursive, true);
    }

    static pause(element: Element, recursive: boolean = true, stop: boolean = false) {

        if (!element)
            return;

        const videos = recursive
            ? element.querySelectorAll<HTMLVideoElement>("video")
            : [element.querySelector<HTMLVideoElement>("video")];

        for (const video of videos) {
            video.pause();
            if (stop) video.currentTime = 0;
        }
    }
}
