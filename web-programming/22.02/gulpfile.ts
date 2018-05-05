import * as bs from "@browser-sync";
import {args} from "@cli";
import {Action} from "@syntax";
import {spawn} from "child_process";
import * as del from "del";
import * as gulp from "gulp";
import {parallel, series, task} from "gulp";

function clean() {
    return del(["./dist"]);
}

function sync() {
    const glob = ["./src/**/*.{css,html}"];

    if (args.watch)
        gulp.watch(glob, sync);

    return gulp.src(glob)
        .pipe(gulp.dest("./dist"));
}

function compile() {
    const params = [...args.flags];
    const exe = require.resolve(".bin/webpack");
    return spawn(exe, params, {shell: true, stdio: "inherit"});
}

function serve() {
    return bs.serve({server: "./dist"});
}

function serveFlags(done: Action) {
    args.flags.push("-w", "--watch");
    done();
}

task(clean);
task(sync);
task(compile);

task("default", series(
    clean,
    parallel(
        sync,
        compile,
    )),
);

task("serve", series(
    serveFlags,
    parallel(
        "default",
        serve,
    ),
));
