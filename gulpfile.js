"use strict";

const gulp = require("gulp");
const requireDir = require('require-dir');

requireDir('./build');

gulp.task('watchFiles', function () {
    gulp.watch("./scss/**/*.scss", build);
    gulp.watch(["./js/**/*.js","!./js/**/*.min.js","!./js/**all.js"], build);
});

const build = gulp.series('clean', 'glyph',
    gulp.parallel('modules', 'scss'),
    gulp.parallel('mergeCss', 'mergeJs'),
    gulp.parallel('minifyCss', 'minifyJs'));

const peaks = gulp.series('cleanPeaks', 'downloadAudiowaveform', 'buildPeaks');
const prod = gulp.series(build, 'release');
const watch = gulp.series(build, 'watchFiles');
const pack = gulp.series(prod, 'mkZip');
const fav = gulp.series('cleanFav', 'check-for-favicon-update', 'generate-favicon');
const inject = gulp.series(fav, 'inject-favicon-markups');
const init = gulp.series(gulp.parallel(peaks, fav), build);

exports.default = build;
exports.watch = watch;
exports.init = init;
exports.peaks = peaks;
exports.fav = fav;
exports.inject = inject;
exports.build = build;
exports.pack = pack;