var TEMPLATES = __dirname + '/../templates';
var STATIC    = __dirname + '/../static';

var gulp     = require('gulp'),
    pug      = require('gulp-pug'), 
    stylus   = require('gulp-stylus'),
    bower    = require('gulp-bower'),
    imagemin = require('gulp-imagemin'),
    del      = require('del'); 

gulp.task('build', function() {
	gulp.src(__dirname + '/pug/parser.pug')
	    .pipe(pug()).on('error', console.log)
	    .pipe(gulp.dest(TEMPLATES)); 

	gulp.src(__dirname + '/stylus/parser.styl')
	    .pipe(stylus({compress: true})).on('error', console.log)
	    .pipe(gulp.dest(STATIC)); 

	gulp.src(__dirname + '/img/**/*.{png,jpg,jpeg,svg}')
	    .pipe(imagemin())
	    .pipe(gulp.dest(STATIC + '/img'));

	gulp.src(__dirname + '/js/**/*.js')
		.pipe(gulp.dest(STATIC))

	bower()
		.pipe(gulp.dest(STATIC + '/components'));
});	

gulp.task('clean', function() {
	del.sync([TEMPLATES, STATIC], {force: true});
});

gulp.task('rebuild', ['clean', 'build']);