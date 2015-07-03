module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt);  // concurrent
	grunt.initConfig({
		compass: {
			app: {
				options: {
					//config: 'config/config.rb',  // css_dir = 'dev/css'
					cssDir: 'css',
					sassDir: 'sass',
					imagesDir : 'img',
					//outputStyle: 'compressed',
					environment: 'development'
				}
			}
		},
		coffee: {
			options : {
				_sourceMap : true
			},
      app: {
        expand: true,
        cwd: 'coffee',
        src: ['**/*.coffee'],
        dest: 'js',
        ext: '.js'
      }
    },
		uglify:{
			app :{
				files:{
					'js/app.js':['js/app.js']
				}
			}
		},
    watch: {
      js: {
        files: '**/*.coffee',
        tasks: ['coffee']
      },
			compass: {
				files: ['**/*.scss'],
				tasks: ['compass']
			}
    },
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			app: {
				files: {
					'css/app.css': ['css/app.css']
				}
			}

		},
		concurrent: {
			options: {
    		logConcurrentOutput: true
  		},
			task1:['watch:js','watch:compass']
		}

	});
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.registerTask('default',['coffee:app','compass:app']);
	grunt.registerTask('listen',['concurrent:task1']);
	grunt.registerTask('production',['coffee:app','compass:app','uglify:app','cssmin:app']);

}
