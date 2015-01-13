'use strict';
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  var test, s3folderPrefix, pkg, folderPath, aws;
  pkg = grunt.file.readJSON('package.json');
  test = grunt.option('test') || false;
    if (test) {
        folderPath = 'resrcjs/test/'
    } else {
        folderPath = 'resrcjs/'
    }
    aws = grunt.file.readJSON('aws-keys.json');
	
  
  
  grunt.initConfig({
	clean: ['.dist', '.tmp'],	
    pkg : pkg,
    version : pkg.version,
    srcPath : 'src/resrc.js',
    distPath : 'dist/resrc-<%= version %>.min.js',
	
	
    jshint : {
      options : {
        jshintrc : ".jshintrc"
      },
      all : ["<%= srcPath %>"]
    },
    uglify : {
      options : {
        banner : grunt.file.read("header.txt"),
        compress : true,
        mangle : true,
        preserveComments : false,
        report : 'gzip'
      },
      build : {
        files : {
          '<%= distPath %>' : ['<%= srcPath %>']
        }
      }
    },
    watch : {
      scripts : {
        files : ['<%= srcPath %>'],
        tasks : ['jshint', 'uglify']
      }
	  
    },
	release: {
        options: {
             npm: false
        }
    },
	aws_s3: {
		options: {
			accessKeyId: aws.AWSAccessKeyId,
			secretAccessKey: aws.AWSSecretKey,
			bucket: 'agoraa-global-js-libraries',
			region: 'eu-west-1',
			params: {
				// 30 days (60 * 60 * 24 * 30)
				CacheControl: 'public, max-age=2592000',
				Expires: new Date(Date.now() + 2592000 * 1000)
			}
		},
		dist: {
			files: [{
					params: {
						ContentType: 'application/javascript',
						ContentEncoding: 'gzip',
					},
					expand: true,
					cwd: '.dist/',
					src: '<%= distPath %>',
					dest: folderPath
				}
			]
		}
	}	
  });
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['clean', 'jshint', 'uglify']);
  grunt.registerTask('push', ['build', 'aws_s3']);
  grunt.loadNpmTasks('grunt-release');
};