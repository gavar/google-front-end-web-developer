/*
 After you have changed the settings at "Your code goes here",
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = function (grunt) {

    grunt.initConfig({
        responsive_images: {
            dev: {
                options: {
                    engine: 'im',
                    sizes: [
                        {
                            name: "small",
                            width: 320,
                            height: 240,
                        },
                        {
                            name: "medium",
                            width: 640,
                        },
                        {
                            name: "large",
                            width: 1024,
                        }
                    ]
                },

                /*
                You don't need to change this part if you don't change
                the directory structure.
                */
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['images/*.{gif,jpg,png}'],
                    custom_dest: 'out/images/{%= name %}'
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
                    // copy HTML to destination directory
                    {
                        expand: true,
                        cwd: "src",
                        src: "**/*.html",
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
    });

    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.registerTask('default', ['clean', 'copy', 'responsive_images']);

};
