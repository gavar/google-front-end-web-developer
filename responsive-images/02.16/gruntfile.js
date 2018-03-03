/*
 After you have changed the settings at "Your code goes here",
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = function (grunt) {

    const SIZES = [
        {width: 320},
        {width: 640},
        {width: 1024, quality: 60},
    ];

    grunt.initConfig({
        responsive_images: {
            dev: {
                options: {
                    engine: 'im',
                    sizes: SIZES
                },

                /*
                You don't need to change this part if you don't change
                the directory structure.
                */
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['images/*.{gif,jpg,png}'],
                    custom_dest: 'out/images/{%= width %}'
                }]
            }
        },

        /* Clear the destination directory if it exists */
        clean: {
            dev: {
                src: ['out'],
            },
        },

        copy: {
            dev: {
                files: [
                    // copy CSS to destination directory
                    {
                        expand: true,
                        cwd: "src",
                        src: "**/*.css",
                        dest: "./out/"
                    },
                    /* Copy the "fixed" images that don't go through processing into the images/directory */
                    {
                        expand: true,
                        cwd: 'src',
                        src: 'images/fixed/*.{gif,jpg,png}',
                        dest: './out/'
                    }
                ]
            },
        },

        replace: {
            dev: {
                options: {
                    patterns: [
                        {
                            match: /srcset="(.*)\/(\w+.\w+)"/g,
                            replacement: function (match, directory, filename) {
                                const files = [];
                                for (const size of SIZES) {
                                    const file = `${directory}/${size.width}/${filename} ${size.width}w`;
                                    files.push(file);
                                }
                                return `srcset="\n` + files.join(",\n") + `\n"`;
                            }
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: "**/*.html",
                        dest: "./out/"
                    }
                ]
            }
        },
    });

    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.registerTask('default', ['clean', 'copy', 'responsive_images', 'replace']);

};
