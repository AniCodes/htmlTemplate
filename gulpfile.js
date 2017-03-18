/*global require, exports*/

(function () {
	'use strict';

	var gulp = require('gulp'),
		sass = require('gulp-sass'),
		browserSync = require('browser-sync'),
		sourcemaps = require('gulp-sourcemaps'),
		autoprefixer = require('gulp-autoprefixer'),
		gulpIf = require('gulp-if'),
		useref = require('gulp-useref'),
		uglify = require('gulp-uglify'),
		rename = require('gulp-rename'),
		//concat = require('gulp-concat'),
		del = require('del'),
		spritesmith = require('gulp.spritesmith'),

	//===========ПЕРЕМЕННАЯ С ПУТЯМИ===========
		path = {
			build: {
				html: 'build/',
				js: 'src/js/',
				img: 'build/img/',
				fonts: 'build/fonts/'
			},
			src: {
				html: 'src/*.html',
				js: 'src/js/scripts.js',
				sass: 'src/sass/styles.sass',
				img: 'src/img/**/*.*',
				fonts: 'src/fonts/**/*.*'
			},
			watch: {
				html: 'src/**/*.html',
				js: 'src/js/scripts.js',
				sass: 'src/sass/**/*.sass',
				img: 'src/img/**/*.*',
				fonts: 'src/fonts/**/*.*'
			},
			clean: './build'
		};
	
	gulp.task('sass:dev', function () {
		return gulp.src(path.src.sass)
			.pipe(sourcemaps.init())
			.pipe(sass().on('error', sass.logError))
			.pipe(autoprefixer({
				browsers: ['last 3 versions', '> 5%'],
				cascade: false
			}))
				.pipe(sourcemaps.write())
				.pipe(gulp.dest('src/css'))
				.pipe(browserSync.reload({
				stream: true
			}));
	});

	gulp.task('sass:prod', function () {
		return gulp.src(path.src.sass)
			.pipe(sass({outputStyle: 'compressed'}))
			.pipe(autoprefixer({
				browsers: ['last 3 versions', '> 5%'],
				cascade: false
			}))
			.pipe(gulp.dest('src/css'));
	});

	gulp.task('browserSync', function () {
		browserSync({
			server: {baseDir: 'src'}
		});
	});

	gulp.task('browserSync:prod', function () {
		browserSync({
			server: {baseDir: 'build'},
			tunnel: true
		});
	});

	gulp.task('scripts', function () {
		return gulp.src(path.src.js)
			//.pipe(concat('scripts.min.js'))
			.pipe(uglify())
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest(path.build.js));
	});

	gulp.task('useref', ['sass:prod', 'scripts'], function () {
		return gulp.src(path.src.html)
			.pipe(useref())
			.pipe(gulp.dest(path.build.html));
	});

	gulp.task('clean', function () {
		return del.sync(path.clean);
	});
	
	gulp.task('sprite', function () {
		var spriteData = gulp.src('img/sprite/*.png')
				.pipe(spritesmith({
					imgName: '../img/sprite.png',
					cssName: 'sprite.css'
				}));
		spriteData.img.pipe(gulp.dest('img'));
		spriteData.css.pipe(gulp.dest('css'));
	});

	//===========DEVELOP TASK=========

	gulp.task('default', ['browserSync', 'sass:dev'], function () {
		gulp.watch(path.watch.sass, ['sass:dev']);
		gulp.watch(path.watch.html, browserSync.reload);
		gulp.watch(path.watch.js, browserSync.reload);
	});

	//===========PRODUCTION TASK=========

	gulp.task('prod', ['clean', 'browserSync:prod', 'useref'], function () {
		del.sync('src/js/scripts.min.js');
		return gulp.src([path.src.fonts, path.src.img], {base: 'src'})
			.pipe(gulp.dest(path.build.html));
	});
}());