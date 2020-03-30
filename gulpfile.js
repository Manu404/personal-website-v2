"use strict";

const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const zip = require('gulp-zip');
const pkg = require('./package.json');
const concat = require('gulp-concat');
const fontello = require('gulp-fontello');
const fav = require('./build/gulp-fav');
const peakbuilder = require('gulp-wavesurfer-peakbuilder');
const download = require('gulp-download-files');
const decompress = require('gulp-decompress');
const fs = require('fs');

function clean() {
    return del(["./vendor/", "./release/", "./*.zip"]);
}

function modules() {
  var bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*.min.*').pipe(gulp.dest('./vendor/bootstrap'));
  var jquery = gulp.src([
      './node_modules/jquery/dist/*.min.js',
      '!./node_modules/jquery/dist/core.min.js',
      './node_modules/jquery-ui-dist/*.min.js',
      './node_modules/jquery-ui-touch-punch/*.min.js',
      './node_modules/jquery.easing/*.min.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));
  var jquery_css = gulp.src('./node_modules/jquery-ui-dist/**/*.min.css').pipe(gulp.dest('./vendor/jquery/css'));
  var ws = gulp.src('./node_modules/wavesurfer/dist/**/*.min.js').pipe(gulp.dest('./vendor/wavesurfer/'));
  var animejs = gulp.src('./node_modules/animejs/lib/*.min.js').pipe(gulp.dest('./vendor/animejs'));
  return merge(bootstrap, jquery, ws, jquery_css, animejs);
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
        .pipe(gulp.dest("./css"));
}

function mergeCSS() {
    return gulp
        .src([
            './css/*.css',
            '!./css/*.min.css',
            '!./css/*all*.css'
        ])
        .pipe(concat('all.css'))
        .pipe(gulp.dest('./css/'));
}

function minifyCss () {
    return gulp.src([
        './css/*.css',
        '!./css/*.min.css',
    ])
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest('./css/'));
}

function minifyJs() {
    return gulp
        .src([
            './js/*.js',
            '!./js/*.min.js',
        ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./js'));
}

function mergeJs() {
    return gulp
        .src([
            './js/*.js',
            '!./js/*.min.js',
            '!./js/*all*.js'
        ])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./js/'));
}

function watchFiles() {
    gulp.watch("./scss/**/*.scss", build);
    gulp.watch(["./js/**/*.js","!./js/**/*.min.js","!./js/**all.js"], build);
}

function release() {
  var css = gulp.src(['./css/all.min.css',])
      .pipe(gulp.dest('./release/css/'));
  var img = gulp.src(['./img/**/*'], {allowEmpty: true})
      .pipe(gulp.dest('./release/img/'));
  var js = gulp.src(['./js/all.min.js',])
      .pipe(gulp.dest('./release/js/'));
  var audio = gulp.src('./audio/**/*')
        .pipe(gulp.dest('./release/audio/'));
  var vendor = gulp.src(['./vendor/**/*',
    '!./vendor/**/*.js', './vendor/**/*.min.js',
    '!./vendor/**/*.css', '!./vendor/**/*.map', './vendor/**/*.min.css',
    './vendor/**/aos.css', './vendor/**/aos.js'])
      .pipe(gulp.dest('./release/vendor/'));
  var font = gulp.src(['./font/**/*',])
        .pipe(gulp.dest('./release/font/'));
  var index = gulp.src(['./index.html'])
      .pipe(gulp.dest('./release/'));
  return merge(css, img, js, vendor, index, audio, font);
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

function glyph () {
    return gulp.src('glyph.json')
        .pipe(fontello({
            css: "css",
            font: "font"
        }))
        .pipe(gulp.dest('./'));
}

function buildPeaks () {
    return gulp.src('./audio/*.mp3')
        .pipe(peakbuilder())
        .pipe(gulp.dest('./audio/peaks'));
}

function downloadAudioWaveForm(cb) {
    fs.access('audiowaveform.exe', (err) => {
        if (err) {
            return download("https://github.com/bbc/audiowaveform/releases/download/1.4.1/audiowaveform-1.4.1-win64.zip")
                .pipe(decompress({strip: 1}))
                .pipe(gulp.dest("./"));
        }
        return cb();
    });
}

// Define complex tasks
const build = gulp.series(clean, glyph,
    gulp.parallel(modules, scss),
    gulp.parallel(mergeCSS, mergeJs),
    gulp.parallel(minifyCss, minifyJs));

const peaks = gulp.series(downloadAudioWaveForm, buildPeaks);
const prod = gulp.series(build, release);
const watch = gulp.series(build, watchFiles);
const pack = gulp.series(prod, mkZip);

// Export tasks
exports.scss = scss;
exports.glyph = glyph;
exports.clean = clean;
exports.prod = prod;
exports.build = build;
exports.watch = watch;
exports.default = prod;
exports.pack = pack;
exports.peaks = peaks;
exports.fav = fav.build();