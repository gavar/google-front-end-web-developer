import * as del from "del";
import * as gulp from "gulp";
import {parallel, series} from "gulp";
import * as autoprefixer from "gulp-autoprefixer";
import * as sass from "gulp-sass";
import * as ts from "gulp-typescript";
import * as Handlebars from 'handlebars';
import * as HandlebarsHelpers from 'handlebars-helpers';
import * as HandlebarsIntl from 'handlebars-intl';
import * as layouts from 'handlebars-layouts';
import * as registrar from "handlebars-registrar";
import * as path from "path";
import {isString} from "util";
import {TaskCallback} from "./core";
import {TaskInfo} from "./core/types";
import {beautify, render, rollupify} from "./tools";

/** Clean previous compilation files. */
function clean(done: TaskCallback) {
    del(["./dist", "./temp"]).then(x => done(void 0, x), done);
}
gulp.task(clean);

/** Compile page styles */
function style(): NodeJS.ReadWriteStream {
    return gulp.src('./src/app/**/*.+(css|scss)')
        .pipe(sass({
            includePaths: [
                "./src",
            ],
        }))
        .pipe(autoprefixer())
        .pipe(beautify.css())
        .pipe(gulp.dest('./dist'));
}
gulp.task(style);

/** Render page templates. */
function pages() {

    // BUG: handlebars-layouts doesnt work if creating instance of handlebars using Handlebars.create()
    const handlebars = Handlebars;

    // handlebars setup
    handlebars.registerHelper(layouts(handlebars));
    HandlebarsIntl.registerWith(handlebars);
    HandlebarsHelpers.comparison({handlebars: handlebars});
    HandlebarsHelpers.date({handlebars: handlebars});

    registrar(handlebars, {
        cwd: "./src",
        partials: [
            'pages/**/*.hbs',
            'layouts/**/*.hbs',
            'components/**/*.hbs',
        ],
        bustCache: true,
        parsePartialName: function (file) {
            let name = file.path;

            // remove extension / category name
            const index = name.indexOf(".");
            if (index > 0)
                name = name.substring(0, index);

            // use 'node style' by removing '.../index'
            if (name.endsWith("/index"))
                name = name.slice(0, -"/index".length);

            // use directory name if component is represented as a directory
            const directory = path.dirname(name);
            const filename = path.basename(name);
            if (directory.endsWith("/" + filename))
                name = name.slice(0, -(filename.length + 1));

            return name;
        },
    });

    return gulp.src("./src/app/**/*.hbs")
        .pipe(render.handlebars({handlebars: handlebars}))
        .pipe(gulp.dest('./dist'));
}
gulp.task(pages);

/** Clears NodeJS modules cache. */
function clearNodeCache(done: TaskCallback) {
    const cache = require.cache;
    for (const key of Object.getOwnPropertyNames(cache))
        delete cache[key];

    done();
}
(clearNodeCache as TaskInfo).displayName = "clear-node-cache";

/** Compile scripts. */
const tsProject = ts.createProject('tsconfig.json');
function scripts() {
    return gulp.src('./src/**/*.+(ts|js)')
        .pipe(tsProject())
        .pipe(gulp.dest('./temp'))
}
gulp.task(scripts);

/** Rollup scripts. */
function roll() {
    return gulp.src('./temp/app/js/**/*')
        .pipe(rollupify())
        .pipe(gulp.dest('./dist/js'));
}
gulp.task(roll);

/** Copy images. */
function images() {
    return gulp.src("./src/app/img/**/*")
        .pipe(gulp.dest("./dist/img"));
}
gulp.task(images);

/** Copy assets. */
function assets() {
    return gulp.src("./src/app/assets/**/*")
        .pipe(gulp.dest("./dist/assets"));
}
gulp.task(assets);

/** Copy vendor files. */
function vendor() {
    return gulp.src("./src/app/vendor/**/*")
        .pipe(gulp.dest("./dist/vendor"));
}
gulp.task(vendor);

/** All tasks sequence. */
gulp.task("default", series(
    clean,
    parallel(
        pages,
        style,
        series(
            scripts,
            roll,
        ),
        images,
        assets,
    )
));

// watch for changes
function watch() {
    gulp.watch("./src/**/*.hbs", pages);
    gulp.watch("./src/**/*.+(css|scss)", style);
    gulp.watch("./src/**/*.+(ts|js)", series(clearNodeCache, scripts, roll));
    gulp.watch("./src/app/img/**/*", images);
    gulp.watch("./src/app/assets/**/*", assets);
    gulp.watch("./src/data/**/*", series(clearNodeCache, pages));
}
gulp.task("watch", gulp.series("default", watch));
