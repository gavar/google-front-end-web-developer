import Swiper from "swiper";
import {VideoUtil} from "./html";

export class SwiperUtil {
    static onSlideChange(this: Swiper) {
        VideoUtil.stop(this.slides[this.previousIndex]);
    }
}
