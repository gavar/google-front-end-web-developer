require("../../grunt-patch");

/*
 After you have changed the settings at "Your code goes here",
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = function (grunt) {

    const SIZES = [
        {width: 400},
        {width: 800, quality: 70},
        {width: 1600, quality: 60},
    ];

    grunt.initConfig({
        responsive_images: {
            images: {
                options: {
                    engine: "im",
                    sizes: SIZES,
                },

                /*
                You don't need to change this part if you don't change
                the directory structure.
                */
                files: [{
                    expand: true,
                    cwd: "src",
                    src: ["images/*.{gif,jpg,png}"],
                    custom_dest: "./dist/images/{%= width %}",
                }],
            },
        },

        /* Clear the destination directory if it exists */
        clean: {
            out: {
                src: ["./dist"],
            },
        },

        copy: {
            // copy CSS to destination directory
            css: {
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: "**/*.css",
                        dest: "./dist/",
                    },
                ],
            },

            /* Copy the "fixed" images that don't go through processing into the images/directory */
            fixed: {
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: "images/fixed/*.{gif,jpg,png}",
                        dest: "./dist/",
                    },
                ],
            },
        },

        replace: {
            picture: {
                options: {
                    patterns: [
                        {
                            match: /(<img src=")(.*)\/(\w+.\w+)(.*>)/g,
                            replacement: function (match, prefix, directory, filename, suffix) {

                                const sources = [];
                                for (let i = SIZES.length - 2; i >= 0; i--) {
                                    const size = SIZES[i];
                                    const size2x = SIZES[i + 1];
                                    const media = `(min-width: ${size.width}px)`;
                                    const src = `${directory}/${size.width}/${filename}`;
                                    const src2x = `${directory}/${size2x.width}/${filename}`;
                                    const source = `<source media="${media}" srcset="${src2x} 2x, ${src}">`;
                                    sources.push(source);
                                }

                                const min = SIZES[0];
                                const src = `${directory}/${min.width}/${filename}`;
                                const img = prefix + src + suffix;

                                const html = [];
                                html.push(`<picture>`);
                                html.push(sources.join("\n"));
                                html.push(img);
                                html.push(`</picture>`);
                                return html.join("\n");
                            },
                        },
                    ],
                },
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: "**/*.html",
                        dest: "./dist/",
                    },
                ],
            },
        },

        watch: {
            css: {
                files: ["src/**/*css"],
                tasks: ["copy:css"],
            },
            fixed: {
                files: ["src/images/fixed/*"],
                tasks: ["copy:fixed"],
            },
            html: {
                files: ["src/**/*html"],
                tasks: ["replace:html"],
            },
            images: {
                files: ["src/images/*"],
                tasks: ["responsive_images"],
            },
        },
    });

    grunt.loadNpmTasks("grunt-responsive-images");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-replace");
    grunt.loadNpmTasks("grunt-mkdir");
    grunt.registerTask("default", ["clean", "copy", "responsive_images", "replace"]);
};
