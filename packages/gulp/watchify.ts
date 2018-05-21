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

export function watchify(glob: string | string[], options?: boolean | Partial<WatchifyOptions>): NodeJS.ReadWriteStream {
    options = parse(options);
    if (!options.watch)
        return gulp.src(glob);

    const watchOptions = {ignoreInitial: false};
    const callbacks = [logFileEvent];
    if (options.callback)
        callbacks.push(options.callback);

    const files: Set<string> = new Set();
    return watch(glob, watchOptions, function (file) {
        if (files.has(file.path)) {
            for (const callback of callbacks) {
                try {
                    callback(file);
                } catch (error) {
                    logger.error(new PluginError("watchify", error));
                }
            }
        } else {
            files.add(file.path);
        }
    });
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
