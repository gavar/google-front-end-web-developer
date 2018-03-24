export function stop(element: Element, recursive: boolean = true) {
    pause(element, recursive, true);
}

export function pause(element: Element, recursive: boolean = true, stop: boolean = false) {
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

export default {
    stop,
    pause,
}
