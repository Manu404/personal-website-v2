function animateTitle(){
    jQuery('.ml13').each(function(){
        jQuery(this).html($(this).text().replace(/([^\s])/g, "<span class='letter'>$&</span>"));
    });

    anime.timeline({loop: true})
        .add({
            targets: '.ml13 .letter',
            translateX: [40,0],
            translateZ: 0,
            opacity: [0,1],
            easing: "easeOutExpo",
            duration: 1200,
            delay: function(el, i) {
                return 500 + 30 * i;
            }
        }).add({
        targets: '.ml13 .letter',
        translateX: [0,-30],
        opacity: [1,0],
        easing: "easeInExpo",
        duration: 1100,
        delay: function(el, i) {
            return 100 + 30 * i;
        }
    });
}

var needLoading = false;
var playRequested = false;
var currentTitle = 0;
var firstLoad = true;
var isLoading = false;

var playlist = [
    {title : "My Funny Valentine - Demo excerpt", url : "valentine"},
    {title : "Lazy - Demo excerp", url : "Lazy"},
    {title : "Summertime Demo excerpt", url : "summertime"},
    {title : "All the things you are - Demo excerpt", url : "all"},
    {title : "Misty - Demo excerpt", url : "misty"},

];

var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    responsive: true,
    waveColor: '#fefefe',
    progressColor: '#4a4b4a',
    barWidth: 2,
    cursorWidth: 0,
    barHeight: 1,
    height: 60,
    barGap: null
});

function getUrl(index) {
    if(index > playlist.count || index < 0) index = 0;
    return "audio/" + playlist[index].url + ".mp3";
}

function getPeakUrl(index) {
    if(index > playlist.count || index < 0) index = 0;
    return "audio/peaks/" + playlist[index].url + ".json";
}

function getName(index) {
    if(index > playlist.count || index < 0) index = 0;
    return playlist[index].title;
}

function updateButtons() {
    if(wavesurfer.isPlaying()){
        $("#play").css('visibility', "hidden");
        $("#pause").css('visibility', "visible");
    }
    else {
        $("#play").css('visibility', "visible");
        $("#pause").css('visibility', "hidden");
    }
}

function loadTitle(index) {
    showLoading();
    drawPeaks([]);
    wavesurfer.load(getUrl(index));
}

function playPause() {
    if(isLoading) return;
    if(firstLoad == true) {
        playRequested = true;
        loadTitle(0);
        firstLoad = false;
    }
    else if(needLoading == true){
        wavesurfer.play();
        needLoading = false;
        updateButtons();
    }
    else {
        wavesurfer.playPause();
        updateButtons();
    }
}

function loadNextTitle() {
    if(isLoading) return;

    currentTitle += 1;
    if(currentTitle > playlist.count) currentTitle = 0;
    playRequested = true;
    loadTitle(currentTitle);
}

function showLoading(){
    isLoading = true;
    $("#waveform").css('visibility', 'hidden');
    $("#current_title").text("Loading...");
    animateTitle();
}

function hideLoading() {
    isLoading = false;
    $("#waveform").css('visibility', 'visible');
    $("#ctrl").css('visibility', 'visible', "important");
    $("#current_title").text(getName(currentTitle));
    animateTitle();
}

wavesurfer.on('ready', function() {
    wavesurfer.setVolume(0.2);
    hideLoading();
    loadPeaks(currentTitle);
    if(playRequested) {
        wavesurfer.play();
        playRequested = false;
    }
    updateButtons();
});

wavesurfer.on('error', function(err) {
    console.log(err);
});

wavesurfer.on('finish', function() {
    loadNextTitle();
    playRequested = true;
});

$(document).ready(function () {
    loadPeaks(currentTitle);

    $("#volume").slider({
        min: 0,
        max: 100,
        value: 60,
        range: "min",
        slide: function(event, ui) {
            if(ui.val < 0 || ui.val > 100) return;
            var logVol = (linearToLog(ui.value)/100).toFixed(2);
            if(logVol < 0 || logVol > 100) return;
            if(logVol <= 0.01) logVol = 0;
            wavesurfer.setVolume(logVol);
        }
    });
});

function linearToLog(value) {
    var minp = 0;
    var maxp = 100;
    var minv = Math.log(1);
    var maxv = Math.log(100);
    var scale = (maxv-minv) / (maxp-minp);
    return Math.exp(minv + scale*(value-minp));
}

function drawPeaks(peaks){
    wavesurfer.backend.setPeaks(peaks);
    wavesurfer.drawBuffer();
}

function loadPeaks(index){
    showLoading();
    fetch(getPeakUrl(index))
        .then(function(response) {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(function (peaks) {
            drawPeaks(peaks);
            hideLoading();
        })
        .catch(function (e) {
            console.error('error', e);
        });
}