import gulp from "gulp";
import {watchify} from "./watchify";

interface Gulp {
    watchify: typeof watchify;
}

const enhance: Gulp & typeof gulp = gulp as any;
enhance.watchify = watchify;
export default enhance;
