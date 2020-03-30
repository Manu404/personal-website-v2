const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const zip = require('gulp-zip');
const fontello = require('gulp-fontello');
const pkg = require('../package.json');

gulp.task('clean', function () {
    return del(["./vendor/", "./release/", "./*.zip"]);
});

gulp.task('modules', function () {
    var bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*.min.*').pipe(gulp.dest('./vendor/bootstrap'));
    var jquery = gulp.src([
        './node_modules/jquery/dist/*.min.js',
        '!./node_modules/jquery/dist/core.min.js',
        './node_modules/jquery-ui-dist/*.min.js',
        './node_modules/jquery-ui-touch-punch/*.min.js',
        './node_modules/jquery.easing/*.min.js'
    ]).pipe(gulp.dest('./vendor/jquery'));
    var jquery_css = gulp.src('./node_modules/jquery-ui-dist/**/*.min.css').pipe(gulp.dest('./vendor/jquery/css'));
    var ws = gulp.src('./node_modules/wavesurfer/dist/**/*.min.js').pipe(gulp.dest('./vendor/wavesurfer/'));
    var animejs = gulp.src('./node_modules/animejs/lib/*.min.js').pipe(gulp.dest('./vendor/animejs'));
    return merge(bootstrap, jquery, ws, jquery_css, animejs);
});

gulp.task('release', function () {
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
});

gulp.task('mkZip', function () {
    return gulp.src('./release/**/*')
        .pipe(zip(pkg.title + '_' + pkg.version + '.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('glyph', function () {
    return gulp.src('glyph.json')
        .pipe(fontello({
            css: "css",
            font: "font"
        }))
        .pipe(gulp.dest('./'));
});