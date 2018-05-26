import cli from "@cli";
import chalk from "chalk";
import logger from "fancy-log";
import gulp from "gulp";
import watch from "gulp-watch";
import path from "path";
import PluginError from "plugin-error";
import File from "vinyl";

export interface WatchifyOptions extends Object {
    watch: boolean;
    callback?: (file: WatchFile) => any;
}

/** CLI arguments */
const args = cli.options.common().parse();

export function watchify(glob: string | string[], watch: boolean): NodeJS.ReadWriteStream;
export function watchify(glob: string | string[], options: Partial<WatchifyOptions>): NodeJS.ReadWriteStream;
export function watchify(glob: string | string[], options: boolean | Partial<WatchifyOptions>): NodeJS.ReadWriteStream {
    let stream = gulp.src(glob);
    options = parse(options);
    if (options.watch) {
        const callbacks = [logFileEvent];
        if (options.callback)
            callbacks.push(options.callback);

        function onModify(file: WatchFile) {
            for (const callback of callbacks) {
                try {
                    callback(file);
                } catch (error) {
                    logger.error(new PluginError("watchify", error));
                }
            }
        }
        stream = stream.pipe(watch(glob, {ignoreInitial: true}, onModify));
    }
    return stream;
}

function parse(options: boolean | Partial<WatchifyOptions>): WatchifyOptions {
    switch (typeof options) {
        case "object":
            options = {...options as WatchifyOptions};
            if (!options.hasOwnProperty("watch"))
                options.watch = args.watch;
            return options as WatchifyOptions;

        case "boolean":
            return {watch: options as boolean};

        default:
            return {watch: args.watch};
    }
}

type FileEvent = "add" | "change" | "unlink";
type WatchFile = File & { event: FileEvent };

function logFileEvent(file: WatchFile) {
    if (!file.event) return;
    const chalk = colors[file.event] || colors.default;
    const action = actions[file.event] || file.event;
    const relativePath = path.relative(file.cwd, file.path);
    logger.info(chalk(`${action}: ${relativePath}`));
}

const colors = {
    "default": chalk.white,
    "add": chalk.green,
    "change": chalk.yellow,
    "unlink": chalk.red,
};

const actions = {
    "add": "added",
    "change": "changed",
    "unlink": "unlinked",
};
