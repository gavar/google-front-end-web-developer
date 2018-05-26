import cli from "@cli";
import gulp from "@gulp";
import {Action} from "@syntax";
import {spawn} from "child_process";
import del from "del";
import rollup from "gulp-better-rollup";
import rename from "gulp-rename";
import replace from "gulp-replace";
import ts from "gulp-typescript";
import Rollup from "rollup";
import typescript from "rollup-plugin-typescript2";

function clean() {
    return del([
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

function compile() {
    const args = cli.options.udacity().parse();
    return args.udacity ? es6() : webpack();
}

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

function es6() {
    gulp.watcher.add([
        "src/ts/**/*.ts",
        "src/js/**/*.js",
    ], compile);

    const input: Partial<Rollup.InputOptions> = {
        treeshake: false,
        plugins: [
            es6.ts as any,
        ],
    };

    const output: Rollup.OutputOptions = {
        indent: true,
        strict: false,
        format: "cjs",
    };

    return gulp.src("src/js/**/*.js") // sources
        .pipe(rollup(input, output))
        .pipe(rename(path => path.extname = ".js"))
        .pipe(gulp.dest("./dist/js"));
}

namespace es6 {
    export const ts = typescript({
        clean: true,
        abortOnError: !cli.options.common().parse().watch,
        typescript: require("typescript"),
        tsconfig: require.resolve("./tsconfig.json"),
    });
}

function udacity(done: Action) {
    process.argv.push("--udacity");
    done();
}

gulp.task(css);
gulp.task(html);
gulp.task(clean);
gulp.task(compile);

gulp.task("default", gulp.series(
    clean,
    gulp.parallel(
        css,
        html,
        compile,
        gulp.watcher.watch,
    ),
));

gulp.task("udacity", gulp.series(
    udacity,
    "default",
));
