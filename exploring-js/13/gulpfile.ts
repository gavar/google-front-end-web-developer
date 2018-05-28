import cli from "@cli";
import gulp from "@gulp";
import {Action, ErrorCallback} from "@syntax";
import {spawn} from "child_process";
import del from "del";
import {TaskFunction} from "gulp";
import rollup from "gulp-better-rollup";
import replace from "gulp-replace";
import ts from "gulp-typescript";
import {InputOptions, OutputOptions} from "rollup";

function clean() {
    return del([
        "./tmp",
        "./dist",
    ]);
}

function html() {
    const glob = [
        "./src/**/*.html",
    ];
    return gulp.watchify(glob)
        .pipe(replace(".ts", ".js"))
        .pipe(gulp.dest("./dist"));
}

function assets() {
    const glob = [
        "./src/images/**/*",
    ];
    return gulp.watchify(glob)
        .pipe(gulp.dest("./dist/assets"));
}

function css() {
    const argv = [
        "-r", "ts-node/register",
        "-r", "tsconfig-paths/register",
        "--config", "webpack/webpack-sass.config.ts",
        ...cli.options.webpack.argv(),
    ];

    if (cli.options.udacity().parse().udacity) {
        argv.push("--mode", "development");
        argv.push("--devtool", "false");
        argv.push("--env.url-loader.limit", "1");
    }

    const exe = require.resolve(".bin/webpack");
    console.log([exe, ...argv].join(" "));
    return spawn(exe, argv, {shell: true, stdio: "inherit"});
}

function compile(done: ErrorCallback) {
    const args = cli.options.udacity().parse();
    args.udacity ? es6.task()(done) : webpack;
}

gulp.name("compile-ts", webpack);
function webpack() {
    const argv = [
        "-r", "ts-node/register",
        "-r", "tsconfig-paths/register",
        "--config", "webpack/webpack-ts.config.ts",
        ...cli.options.webpack.argv(),
    ];

    const exe = require.resolve(".bin/webpack");
    console.log([exe, ...argv].join(" "));
    return spawn(exe, argv, {shell: true, stdio: "inherit"});
}

gulp.name("dev-server", devServer);
function devServer() {
    const argv = [
        "-r", "ts-node/register",
        "-r", "tsconfig-paths/register",
        ...cli.options.webpack.argv(),
        "--no-inline",
    ];
    const exe = require.resolve(".bin/webpack-dev-server");
    console.log([exe, ...argv].join(" "));
    return spawn(exe, argv, {shell: true, stdio: "inherit"});
}

namespace es6 {
    export let _task: TaskFunction;
    export const tsProject = ts.createProject("tsconfig.json", {
        module: "esnext",
    });

    export function task(): TaskFunction {

        if (_task)
            return _task;

        const glob = [
            "src/ts/**/*.ts",
            "src/js/**/*.js",
        ];

        _task = gulp.series(
            stageJS,
            stageTS,
            compile,
        );

        _task.name = "es6";
        gulp.watcher.add(glob, _task);
        return _task;
    }

    gulp.name("es6:stage-ts", stageTS);
    export function stageTS() {
        return gulp.src("./src/ts/**/*.ts")
            .pipe(tsProject())
            .pipe(replace("export class", "class")) // do not export classes
            .pipe(replace(/import .*\n/g, "")) // remove imports
            .pipe(gulp.dest("./tmp/ts"));
    }

    gulp.name("es6:stage-js", stageJS);
    export function stageJS() {
        return gulp.src("./src/js/**/*.js")
            .pipe(gulp.dest("./tmp/js"));
    }

    gulp.name("es6:compile", compile);
    export function compile() {
        const input: Partial<InputOptions> = {
            treeshake: false,
        };

        const output: OutputOptions = {
            indent: true,
            strict: false,
            format: "cjs",
        };

        return gulp.src("./tmp/js/*.js")
            .pipe(rollup(input, output) as NodeJS.ReadWriteStream)
            .pipe(replace(/let (.*)\$(.) = /g, "")) // for some reason rollup may assign class to variable
            .pipe(replace(/(.*)\$(\d)/g, "$1")) // for some reason rollup may assign class to variable
            .pipe(gulp.dest("./dist/js"));
    }

}

function watch(done: Action) {
    process.argv.push("--watch");
    done();
}

function udacity(done: Action) {
    process.argv.push("--udacity");
    done();
}

gulp.task(css);
gulp.task(html);
gulp.task(assets);
gulp.task(clean);
gulp.task("es6", es6.task());
gulp.task(compile);
gulp.task(devServer);

gulp.task("default", gulp.series(
    clean,
    gulp.parallel(
        css,
        html,
        assets,
        compile,
        gulp.watcher.watch,
    ),
));

gulp.task("serve", gulp.series(
    clean,
    watch,
    gulp.parallel(
        html,
        assets,
        devServer,
        gulp.watcher.watch,
    ),
));

gulp.task("udacity", gulp.series(
    udacity,
    "default",
));