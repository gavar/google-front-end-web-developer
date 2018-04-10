const path = require("path");
const grunt = require("grunt");

// patch for grunt to be capable with yarn modules-folder setting
const loadNpmTasks = grunt.loadNpmTasks;
grunt.loadNpmTasks = function (name) {
    const relative = path.relative(".", __dirname);
    arguments[0] = `..\\${relative}\\node_modules\\${name}`;
    return loadNpmTasks.apply(this, arguments);
};
