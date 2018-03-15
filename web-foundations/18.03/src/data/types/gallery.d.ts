import {Media} from "./media";

export interface Gallery {
    orientation?: string;
    boxType?: string;
    items: Media[];
}
