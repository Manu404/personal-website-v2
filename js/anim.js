$(document).ready(function () {
    console.log("animage");

    var tl = anime.timeline({
        easing: 'linear'
      });

    tl.add({
        targets: '#name-tile',
        opacity: 1,
        duration: 1000
    }).add({
        targets: '#location',
        opacity: 1,
        duration: 600
    }).add({
        targets: '#job',
        opacity: 1,
        duration: 600
    }).add({
        targets: '#jobicon',
        opacity: 1,
        duration: 1000
    });

});
