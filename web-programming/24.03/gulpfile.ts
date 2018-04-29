import * as bs from "@browser-sync";
import {args} from "@cli";
import {spawn} from "child_process";
import * as del from "del";
import * as gulp from "gulp";
import * as postcss from "gulp-postcss";
import * as autoprefixer from "autoprefixer";
import {parallel, series, task} from "gulp";

function clean() {
    return del(["./dist"]);
}

const syncGlob = ["./src/**/*.{html,img,png}"];
function sync() {
    return gulp.src(syncGlob)
        .pipe(gulp.dest("./dist"));
}

const cssGlob = ["./src/**/*.css"];
function css() {
    return gulp.src(cssGlob)
        .pipe(postcss([autoprefixer()]))
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

function watch() {
    if (!args.watch) return;
    gulp.watch(cssGlob, css);
    gulp.watch(syncGlob, sync);
}

function enableWatch(done: Function) {
    args.flags.push("-w", "--watch");
    args.watch = true;
    done();
}

task(clean);
task(sync);
task(compile);

task("default", series(
    clean,
    parallel(
        sync,
        css,
        compile,
        watch,
    ),
));

task("serve", series(
    enableWatch,
    parallel(
        "default",
        serve,
    ),
));
