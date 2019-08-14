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

function checkAutoPlay(){
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    var context = new AudioContext();
    autoplayFailed = (context.state === 'suspended');
}

function isPlayingSafe() {
    return !autoplayFailed && wavesurfer.isPlaying();
}

function updatePlayPauseButton() {
    if(isPlayingSafe()){
        $("#play").css('visibility', "hidden");
        $("#pause").css('visibility', "visible");
    }
    else {
        $("#play").css('visibility', "visible");
        $("#pause").css('visibility', "hidden");
    }
}

function playPause() {
    if(autoplayFailed){
        wavesurfer.play();
        autoplayFailed = false;
    }
    else {
        wavesurfer.playPause();
    }
    updatePlayPauseButton();
}

function getUrl(index) {
    if(index > playlist.count || index < 0) index = 0;
    return "audio/" + playlist[index].url;
}

function getName(index) {
    if(index > playlist.count || index < 0) index = 0;
    return playlist[index].title;
}

function loadTitle(index) {
    showLoading();
    wavesurfer.load(getUrl(index));
}

function loadNextTitle() {
    currentTitle += 1;
    if(currentTitle > playlist.count) currentTitle = 0;
    loadTitle(currentTitle);
}

function showLoading(){
    $("#waveform").css('visibility', 'hidden');
    $("#current_title").text("Loading...");
    animateTitle();
}

function hideLoading() {
    $("#waveform").css('visibility', 'visible');
    $("#current_title").text(getName(currentTitle));
    animateTitle();
}

function linearToLog(value) {
    var minp = 0;
    var maxp = 100;
    var minv = Math.log(1);
    var maxv = Math.log(100);
    var scale = (maxv-minv) / (maxp-minp);
    return Math.exp(minv + scale*(value-minp));
}

var autoplayFailed = false;

var playlist = [
    {title : "Misty - Demo excerpt", url : "03 - Misty - For Her - Erroll Garner - Emmanuel Istace - Mai 2019.mp3"},
    {title : "My Funny Valentine - Demo excerpt", url : "02 - My Funny Valentine - For Her - Richard Rodgers & Lorenz Hart - Emmanuel Istace - Mai 2019.mp3"},
    {title : "Summertime Demo excerpt", url : "04 - Summertime - For Her - Geroge Gerwhin - Emmanuel Istace - Mai 2019.mp3"},
    {title : "All the things you are - Demo excerpt", url : "01 - All The Things You Are - For Her - Oscar Hammerstein II - Emmanuel Istace - Mai 2019.mp3"},
    {title : "Lazy - Demo excerp", url : "Lazy.mp3"},

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
var currentTitle = 0;

wavesurfer.on('ready', function() {
    wavesurfer.setVolume(0.2);
    wavesurfer.play();
    hideLoading();
});

wavesurfer.on('finish', function() {
    loadNextTitle();
});

$(document).ready(function () {
    checkAutoPlay();
    loadTitle(0);

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