import gulp from "gulp";
import {displayName} from "./display-name";
import {watcher} from "./watcher";
import {watchify} from "./watchify";

export * from "./watcher";
export * from "./watchify";
export * from "./display-name";
export * from "./transform-stream";

type Gulp = typeof gulp & {
    watcher: typeof watcher
    watchify: typeof watchify
    name: typeof displayName
}

const enhance: Gulp = Object.create(gulp);
enhance.watcher = watcher;
enhance.watchify = watchify;
enhance.name = displayName;
export default enhance;
