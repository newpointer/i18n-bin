//
module.exports = function(grunt) {

    grunt.initConfig({
        clean: ['node_modules'],

        jshint: {
            options: {
                force: true,
                node: true,
		'-W054': true,
                '-W069': true
            },
            src: ['src/**/*.js']
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*test.js']
            }
        },

        copy: {
            dist: {
                expand: true,
                cwd: 'src/',
                src: ['**/*.js', '**/*.po'],
                dest: 'lib/'
            },
            docs: {
                src: 'src/build.md',
                dest: 'docs/build.md'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', ['jshint:src', 'test']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('dist', ['build', 'copy:dist', 'copy:docs']);
};
