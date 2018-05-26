import gulp from "gulp";
import {watcher} from "./watcher";
import {watchify} from "./watchify";

export * from "./watcher";
export * from "./watchify";

type Gulp = typeof gulp & {
    watcher: typeof watcher
    watchify: typeof watchify
}

const enhance: Gulp = Object.create(gulp);
enhance.watcher = watcher;
enhance.watchify = watchify;
export default enhance;
