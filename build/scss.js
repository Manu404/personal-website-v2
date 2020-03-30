const cleanCSS = require("gulp-clean-css");
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const concat = require('gulp-concat');

gulp.task('scss', function () {
    return gulp
        .src(["./scss/**/*.scss"])
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: "./node_modules",
        }))
        .on("error", sass.logError)
        .pipe(gulp.dest("./css"));
});

gulp.task('mergeCss', function () {
    return gulp
        .src([
            './css/*.css',
            '!./css/*.min.css',
            '!./css/*all*.css'
        ])
        .pipe(concat('all.css'))
        .pipe(gulp.dest('./css/'));
});


gulp.task('minifyCss', function () {
    return gulp.src([
        './css/*.css',
        '!./css/*.min.css',
    ])
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest('./css/'));
});