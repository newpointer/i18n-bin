//
module.exports = function(grunt) {

    grunt.initConfig({
        clean: ['node_modules'],

        jshint: {
            options: {
                force: true,
                node: true,
                '-W069': true
            },
            src: ['src/**/*.js']
        },

        copy: {
            dist: {
            },
            docs: {
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', ['jshint:src']);
    grunt.registerTask('test', []);
    grunt.registerTask('dist', ['build', 'copy:dist', 'copy:docs']);
};
