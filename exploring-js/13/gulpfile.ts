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
        "-r ts-node/register",
        "-r tsconfig-paths/register",
        ...process.argv.slice(2),
    ];

    if (!cli.options.webpack().parse().config)
        argv.push("--config webpack/webpack-sass.config.ts");

    if (cli.options.udacity().parse().udacity) {
        argv.push("--mode development");
        argv.push("--devtool false");
        argv.push("--env.url-loader.limit 1");
    }

    const exe = require.resolve(".bin/webpack");
    return spawn(exe, argv, {shell: true, stdio: "inherit"});
}

function compile() {
    const args = cli.options.udacity().parse();
    return args.udacity ? es6() : webpack();
}

function webpack() {
    const argv = [
        "-r ts-node/register",
        "-r tsconfig-paths/register",
        ...process.argv.slice(2),
    ];

    if (!cli.options.webpack().parse().config)
        argv.push("--config webpack/webpack-ts.config.ts");

    const exe = require.resolve(".bin/webpack");
    return spawn(exe, argv, {shell: true, stdio: "inherit"});
}

function es6() {
    const glob = [
        "src/js/classes.ts",
    ];

    const input: Partial<Rollup.InputOptions> = {
        treeshake: false,
        plugins: [
            typescript({
                clean: true,
                typescript: require("typescript"),
                tsconfig: require.resolve("./tsconfig.json"),
            }) as any,
        ],
    };

    const output: Rollup.OutputOptions = {
        indent: true,
        strict: false,
        format: "cjs",
    };

    return gulp.watchify(glob)
        .pipe(rollup(input, output) as NodeJS.ReadWriteStream)
        .pipe(rename((path) => path.extname = ".js"))
        .pipe(gulp.dest("./dist/js"));
}

function udacity(done: Action) {
    process.argv.push("--env.udacity");
    done();
}

gulp.task("default", gulp.series(
    clean,
    gulp.parallel(
        html,
        css,
        compile,
    ),
));

gulp.task("udacity", gulp.series(
    udacity,
    "default",
));
