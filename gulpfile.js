"use strict";

const gulp = require("gulp");
const requireDir = require('require-dir');

requireDir('./build');

gulp.task('watchFiles', function () {
    gulp.watch("./scss/**/*.scss", build);
    gulp.watch(["./js/**/*.js","!./js/**/*.min.js","!./js/**all.js"], build);
});

const build = gulp.series('clean',
    gulp.parallel('glyph', 'modules', 'scss'),
    gulp.parallel('mergeCss', 'mergeJs'),
    gulp.parallel('minifyCss', 'minifyJs'));


const fav = gulp.series('cleanFav', 'check-for-favicon-update', 'generate-favicon');
const inject = gulp.series(fav, 'inject-favicon-markups');
const peaks = gulp.series('cleanPeaks', 'downloadAudiowaveform', 'buildPeaks');

const watch = gulp.series(build, 'watchFiles');
//const init = gulp.series(gulp.parallel(peaks, fav), build);
const init = gulp.series(fav, build);
const release = gulp.series(build, 'release');
const pack = gulp.series(release, 'mkZip');

exports.default = build;
exports.watch = watch;
exports.init = init;
exports.peaks = peaks;
exports.fav = fav;
exports.inject = inject;
exports.build = build;
exports.pack = pack;
exports.release = release;