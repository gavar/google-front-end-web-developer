import * as del from "del";
import * as gulp from "gulp";
import {parallel, series} from "gulp";
import * as sass from "gulp-sass";
import * as Handlebars from 'handlebars';
import * as layouts from 'handlebars-layouts';
import * as registrar from "handlebars-registrar";
import * as path from "path";
import {isString} from "util";
import {TaskCallback} from "./core";
import {HandlebarsRendererStream} from "./tools";

/** Clean previous compilation files. */
function clean(done: TaskCallback) {
    del("./dist").then(x => done(void 0, x), done);
}
gulp.task(clean);

/** Compile page styles */
function style(): NodeJS.ReadWriteStream {
    return gulp.src('./src/app/**/*.scss')
        .pipe(sass({
            includePaths: [
                "./src",
            ],
        }))
        .pipe(gulp.dest('./dist'));
}
gulp.task(style);

/** Render page templates. */
function pages() {

    // BUG: handlebars-layouts doesnt work if creating instance of handlebars using Handlebars.create()
    const handlebars = Handlebars;

    // handlebars setup
    handlebars.registerHelper(layouts(handlebars));
    registrar(handlebars, {
        cwd: "./src",
        partials: [
            'pages/**/*.hbs',
            'layouts/**/*.hbs',
            'components/**/*.hbs',
        ],
        bustCache: true,
        parsePartialName: function (file) {
            const extension = path.extname(file.path);

            // remove extension name
            let name = file.path.slice(0, -extension.length);

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
        .pipe(new HandlebarsRendererStream({handlebars: handlebars}))
        .pipe(gulp.dest('./dist'));
}
gulp.task(pages);

/** Compile assets. */
function images() {
    return gulp.src(["./src/app/img/**/*"])
        .pipe(gulp.dest("./dist/img"));
}
gulp.task(images);

/** All tasks sequence. */
gulp.task("default", series(
    clean,
    parallel(
        pages,
        style,
        images,
    )
));

// watch for changes
function watch() {
    gulp.watch("./src/**/*.hbs", pages);
    gulp.watch("./src/**/*.scss", style);
    gulp.watch("./src/img/*", images);
}
gulp.task("watch", gulp.series("default", watch));
