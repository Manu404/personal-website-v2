"use strict";
const gulp = require("gulp");

const requireDir = require('require-dir');
requireDir('./build');

const build = gulp.series('clean', 'glyph',
    gulp.parallel('modules', 'scss'),
    gulp.parallel('mergeCss', 'mergeJs'),
    gulp.parallel('minifyCss', 'minifyJs'));

const peaks = gulp.series('downloadAudiowaveform', 'buildPeaks');
const prod = gulp.series(build, 'release');
const watch = gulp.series(build, 'watchFiles');
const pack = gulp.series(prod, 'mkZip');
const fav = gulp.series('check-for-favicon-update', 'generate-favicon',  'inject-favicon-markups');

exports.prod = prod;
exports.build = build;
exports.watch = watch;
exports.default = prod;
exports.pack = pack;
exports.peaks = peaks;
exports.favicon = fav;