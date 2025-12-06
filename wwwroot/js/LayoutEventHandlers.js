"use strict";

/*

    The following code is now defunct and handled in MainDOMManip;
    It is left in for preservation purposes

*/

/*
export class LayoutEventHandlers{
    #player;
    constructor(player){
        this.#player = player;
         this.setUpEventListeners();
    }

    setUpEventListeners(){
        document.body.addEventListener('click', function(e) {
        if (e.target.matches('#playButton')) {
                console.log("button pressed!");
                const playButtonElement = e.target;
                if (playButtonElement.classList.contains('bi-play-fill')) {
                    playButtonElement.classList.remove('bi-play-fill');
                    playButtonElement.classList.add('bi-pause-fill');
                } else {
                    playButtonElement.classList.remove('bi-pause-fill');
                    playButtonElement.classList.add('bi-play-fill');
                }
            }
            else{
                console.log("button not hit :(");
            }
        });
    }
}
*/