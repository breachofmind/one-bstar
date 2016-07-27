"use strict";
var gulp   = require('gulp');
var concat = require('gulp-concat');
var sass   = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var minJs  = require('gulp-minify');
var minCss = require('gulp-clean-css');

var BUILDPATH = "./public/static";
var LIBPATH = "./node_modules/";
var SRCPATH = "./js/";

var LIB = [
    LIBPATH + 'angular/angular.min.js',
    LIBPATH + 'bluebird/js/browser/bluebird.min.js',
    LIBPATH + 'd3/build/d3.min.js',
    LIBPATH + 'scrollmagic/scrollmagic/minified/ScrollMagic.min.js',
    //LIBPATH + 'gsap/src/minified/TimelineLite.min.js',
    LIBPATH + 'gsap/src/minified/TweenLite.min.js',
    LIBPATH + 'gsap/src/minified/easing/EasePack.min.js',
    LIBPATH + 'gsap/src/minified/plugins/ScrollToPlugin.min.js'
];

var SRC = [
    SRCPATH + 'main.js',
    SRCPATH + 'services/pos.svc.js',
    SRCPATH + 'services/mousewheel.svc.js',
    SRCPATH + 'controllers/app.c.js',
    SRCPATH + 'directives/svg.dir.js',
    SRCPATH + 'directives/slide.dir.js',
];

var SCSS = [
    './scss/lib.scss',
    './scss/app.scss'
];


gulp.task('scripts', function()
{
    gulp.src(SRC)
        .pipe(concat('src.js'))
        .pipe(gulp.dest(BUILDPATH));
});

gulp.task('scripts:lib', function(){
    gulp.src(LIB)
        .pipe(concat('lib.js'))
        .pipe(gulp.dest(BUILDPATH));
});


gulp.task('sass', function()
{
    var options = {outputStyle:"compressed"};

    return gulp.src(SCSS)
        .pipe(sass(options)
            .on('error', sass.logError))
        .pipe(prefix())
        .pipe(gulp.dest(BUILDPATH));
});

gulp.task('minify:scripts', function(){
    var fileOpts = {
        src:'.min.js',
        min:'.js'
    };
    gulp.src([
        BUILDPATH + 'lib.js',
        BUILDPATH + 'src.js'
    ])
        .pipe(minJs({ext: fileOpts}))
        .pipe(gulp.dest(BUILDPATH));
});

gulp.task('minify:styles', function(){
    gulp.src([
            BUILDPATH + 'app.css',
            BUILDPATH + 'lib.css'
        ])
        .pipe(concat('styles.min.css', {newLine:"\n"}))
        .pipe(minCss())
        .pipe(gulp.dest(BUILDPATH));
});

gulp.task('package', ['default', 'minify:scripts','minify:styles']);

gulp.task('watch', function()
{
    gulp.watch('./scss/**/*.scss', ['sass']);
    gulp.watch('./js/**/*.js', ['scripts']);
});

gulp.task('default', ['scripts','scripts:lib','sass']);