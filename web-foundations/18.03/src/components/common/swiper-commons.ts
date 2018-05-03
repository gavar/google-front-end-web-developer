import Swiper from "swiper";
import HtmlVideo from "./html-video";

export function onSlideChange(this: Swiper) {
    HtmlVideo.stop(this.slides[this.previousIndex]);
}

export default {
    onSlideChange,
};
