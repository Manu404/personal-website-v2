"use strict";

const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const header = require("gulp-header");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const zip = require('gulp-zip');
var addsrc = require('gulp-add-src');
const pkg = require('./package.json');
const concat = require('gulp-concat');

function clean() {
    return del(["./vendor/", "./release/", "./*.zip"]);
}

function modules() {
  var bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*').pipe(gulp.dest('./vendor/bootstrap'));
  var jquery = gulp.src([
      './node_modules/jquery/dist/*.min.js',
      '!./node_modules/jquery/dist/core.min.js',
      './node_modules/jquery-ui-dist/*.min.js',
      './node_modules/jquery-ui-touch-punch/*.min.js',
      './node_modules/jquery.easing/*.min.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));
  var jquery_css = gulp.src('./node_modules/jquery-ui-dist/**/*.css').pipe(gulp.dest('./vendor/jquery/css'));
  var faw = gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/**/*').pipe(gulp.dest('./vendor/fontawesome-free/webfonts'));
  var fac = gulp.src('./node_modules/@fortawesome/fontawesome-free/css/all.min.css').pipe(gulp.dest('./vendor/fontawesome-free/css'));
  var ws = gulp.src('./node_modules/wavesurfer/dist/**/*').pipe(gulp.dest('./vendor/wavesurfer/'));
  var animejs = gulp.src('./node_modules/animejs/lib/*.js').pipe(gulp.dest('./vendor/animejs'));
  return merge(bootstrap, jquery, faw, fac, ws, jquery_css, animejs);
}

function css() {
  return gulp
      .src(["./css/**/*.css", "!./css/**/*.min.css"])
      .pipe(plumber())
      .pipe(gulp.dest("./css"))
      .pipe(rename({
        suffix: ".min"
      }))
      .pipe(cleanCSS())
      .pipe(gulp.dest("./css"));
}

function scss() {
    return gulp
        .src(["./scss/**/*.scss"])
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: "./node_modules",
        }))
        .on("error", sass.logError)
        .pipe(gulp.dest("./css"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest("./css"));
}


function js() {
  return gulp
      .src([
        './js/*.js',
        '!./js/*.min.js',
      ])
      .pipe(uglify())
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(gulp.dest('./js'))
}

function watchFiles() {
    gulp.watch("./scss/**/*.scss", build);
    gulp.watch(["./js/**/*.js","!./js/**/*.min.js","!./js/**all.js"], build);
}

function release() {
  var css = gulp.src(['./css/**/*', '!./css/*.css', './css/*.min.css',])
      .pipe(gulp.dest('./release/css/'));
  var img = gulp.src(['./img/**/*'], {allowEmpty: true})
      .pipe(gulp.dest('./release/img/'));
  var js = gulp.src(['./js/**/*', '!./js/*.js', './js/*.min.js',])
      .pipe(gulp.dest('./release/js/'));
  var audio = gulp.src('./audio/**/*')
        .pipe(gulp.dest('./release/audio/'));
  var vendor = gulp.src(['./vendor/**/*',
    '!./vendor/**/*.js', './vendor/**/*.min.js',
    '!./vendor/**/*.css', '!./vendor/**/*.map', './vendor/**/*.min.css',
    './vendor/**/aos.css', './vendor/**/aos.js'])
      .pipe(gulp.dest('./release/vendor/'));
  var index = gulp.src(['./index.html'])
      .pipe(gulp.dest('./release/'));
  return merge(css, img, js, vendor, index, audio);
}

function mkZip() {
    return gulp.src('./release/**/*')
        .pipe(zip(pkg.title + '_' + pkg.version + '.zip'))
        .pipe(gulp.dest('./'));
}

function mergeJs(){
    return gulp
        .src([
            './js/*.js',
            '!./js/*.min.js',
            '!./js/*all*.js'
        ])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./js/'));
}

// Define complex tasks
const build = gulp.series(clean, mergeJs, gulp.parallel(modules, scss, js));
const prod = gulp.series(build, release);
const watch = gulp.series(build, watchFiles);
const pack = gulp.series(prod, mkZip);

// Export tasks
exports.css = css;
exports.scss = scss;
exports.js = js;
exports.clean = clean;
exports.prod = prod;
exports.build = build;
exports.watch = watch;
exports.default = prod;
exports.pack = pack;
