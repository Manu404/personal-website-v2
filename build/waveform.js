const gulp = require("gulp");
const peakbuilder = require('gulp-wavesurfer-peakbuilder');
const download = require('gulp-download-files');
const decompress = require('gulp-decompress');
const fs = require('fs');
const del = require("del");

gulp.task('cleanPeaks', function () {
    return del(["./audio/peaks"]);
});

gulp.task('buildPeaks', function() {
    return gulp.src('./audio/*.mp3')
        .pipe(peakbuilder())
        .pipe(gulp.dest('./audio/peaks'));
});

gulp.task('downloadAudiowaveform', function(cb) {
    fs.access('audiowaveform.exe', (err) => {
        if (err) {
            return download("https://github.com/bbc/audiowaveform/releases/download/1.4.1/audiowaveform-1.4.1-win64.zip")
                .pipe(decompress({strip: 1}))
                .pipe(gulp.dest("./"));
        }
        return cb();
    });
});