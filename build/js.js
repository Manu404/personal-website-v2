const gulp = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const concat = require('gulp-concat');

gulp.task('minifyJs', function () {
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
});

gulp.task('mergeJs', function () {
    return gulp
        .src([
            './js/*.js',
            '!./js/*.min.js',
            '!./js/*all*.js'
        ])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./js/'));
});