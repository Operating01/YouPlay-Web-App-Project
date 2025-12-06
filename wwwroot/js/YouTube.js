"use strict";

/* ================= YouTube Manager  ==================

    This is what handles many of the YouTube Player playback elements.

   ================= YouTube Manager ================== */ 

let player;
let isPlayerReady = false;

// Loads the YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


// Creates the player on a global scope, which is useful for other scripts.
window.onYouTubeIframeAPIReady = function() {
    console.log('✅ onYouTubeIframeAPIReady called!');
    
    const playerDiv = document.getElementById('player');
    console.log('Player div exists?', playerDiv);
    
    // If (somehow) the player div element is removed from _layout
    if (!playerDiv) {
        console.error('No <div id="player"></div> found on page!');
        return;
    }
    
    // The player gets made invisible, so height and width don't matter
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: '',
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    
    console.log('Player initialization started');
};

function onPlayerReady(event) {
    console.log('onPlayerReady called!');
    window.youtubePlayer = player;
    isPlayerReady = true;
    console.log('window.youtubePlayer set:', window.youtubePlayer);
    
    // Dispatch custom event so other code knows player is ready
    window.dispatchEvent(new CustomEvent('youtubePlayerReady', { detail: { player } }));
}

function onPlayerStateChange(event) {
    console.log('Player state changed:', event.data);
    
    // Dispatch custom event for state changes
    window.dispatchEvent(new CustomEvent('youtubePlayerStateChange', { detail: { state: event.data } }));
}

// Helper to check if player is ready
window.isYouTubePlayerReady = function() {
    return isPlayerReady && window.youtubePlayer;
};

console.log('YouTube.js setup complete');