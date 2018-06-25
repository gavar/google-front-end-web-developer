import cli from "@cli";
import {Action} from "@syntax";
import gulp, {Globs, WatchOptions} from "gulp";
import {Task} from "undertaker";

export interface Watch {
    glob: Globs;
    options?: WatchOptions;
    task?: Task | Task[]
}

export function watcher(active: boolean | "auto" = "auto") {
    return function watch(done: Action) {
        if (isActive(active)) flushWatches();
        done();
    };
}

export namespace watcher {
    export function watch(done: Action) {
        if (isActive()) flushWatches();
        done();
    }

    export function add(glob: Globs, task: Task | Task[]): typeof watcher {
        watches.push({glob, task});
        return this;
    }
}

function isActive(active: boolean | "auto" = "auto") {
    switch (active) {
        case true:
            return true;
        case false:
            return false;
        case "auto":
            return cli.options.common().parse().watch;
    }
}

const watches: Watch[] = [];
function flushWatches() {
    const array = [...watches];
    watches.length = 0;
    for (const watch of array)
        gulp.watch(watch.glob, watch.options, watch.task as any);
}
