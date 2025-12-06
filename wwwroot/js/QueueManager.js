"use strict";

/* ================= Queue Manager  ==================

    Contains functions to manage the queue within the app; utilzed in
    MainDOMManip

   ================= Queue Manager ================== */ 

export class QueueManager {
    #queue;
    #currentIndex;
    #player;
    #isPlayerReady;
    #queueContainer; // DOM element where queue is rendered

    constructor(queueContainer) {
        this.#queue = [];
        this.#currentIndex = -1;
        this.#player = null;
        this.#isPlayerReady = false;
        this.#queueContainer = queueContainer;

        this.loadFromSession();
        this.renderQueue();
    }

    // Assign the YouTube player instance
    setPlayer(player) {
        this.#player = player;
        this.#isPlayerReady = true;
        console.log('Player set in QueueManager');
    }

    addToQueue(song) {
        this.#queue.push(song);
        this.saveToSession();
        this.renderQueue();
        console.log('Added to queue:', song.songTitle);
        return this.#queue.length - 1;
    }

    addMultipleToQueue(songs) {
        this.#queue.push(...songs);
        this.saveToSession();
        this.renderQueue();
    }

    playFromQueue(index) {
        if (!this.#isPlayerReady || !this.#player) {
            console.error('Player not ready');
            return null;
        }

        if (index < 0 || index >= this.#queue.length) {
            console.error('Invalid index:', index);
            return null;
        }

        const song = this.#queue[index];
        if (!song.videoId) {
            console.error('No videoId for song:', song);
            return null;
        }

        try {
            this.#player.loadVideoById(song.videoId);
            this.#currentIndex = index;
            this.saveToSession();
            this.renderQueue();
            return song;
        } catch (error) {
            console.error('Error loading video:', error);
            return null;
        }
    }

    shuffleQueue() {
        if (this.#queue.length <= 1) return;

        const currentSong = this.getCurrentSong();
        const songsToShuffle = this.#queue.filter((_, i) => i !== this.#currentIndex);

        for (let i = songsToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [songsToShuffle[i], songsToShuffle[j]] = [songsToShuffle[j], songsToShuffle[i]];
        }

        this.#queue = [currentSong, ...songsToShuffle];
        this.#currentIndex = 0;
        this.saveToSession();
        this.renderQueue();
    }

    playNext() {
        return this.hasNext() ? this.playFromQueue(this.#currentIndex + 1) : null;
    }

    playPrevious() {
        return this.hasPrevious() ? this.playFromQueue(this.#currentIndex - 1) : null;
    }

    removeFromQueue(index) {
        if (index < 0 || index >= this.#queue.length) return null;

        const removed = this.#queue.splice(index, 1)[0];
        if (index < this.#currentIndex) this.#currentIndex--;
        else if (index === this.#currentIndex) this.#currentIndex = -1;

        this.saveToSession();
        this.renderQueue();
        return removed;
    }

    clearQueue() {
        this.#queue = [];
        this.#currentIndex = -1;
        this.saveToSession();
        this.renderQueue();
    }

    getQueue() {
        return [...this.#queue];
    }

    getCurrentSong() {
        return (this.#currentIndex >= 0 && this.#currentIndex < this.#queue.length)
            ? this.#queue[this.#currentIndex]
            : null;
    }

    getCurrentIndex() {
        return this.#currentIndex;
    }

    hasNext() {
        return this.#currentIndex < this.#queue.length - 1;
    }

    hasPrevious() {
        return this.#currentIndex > 0;
    }

    saveToSession() {
        sessionStorage.setItem('musicQueue', JSON.stringify({
            queue: this.#queue,
            currentIndex: this.#currentIndex
        }));
    }

    loadFromSession() {
        const stored = sessionStorage.getItem('musicQueue');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.#queue = data.queue || [];
                this.#currentIndex = data.currentIndex || -1;
            } catch (e) {
                console.error('Error loading queue from session:', e);
                this.#queue = [];
                this.#currentIndex = -1;
            }
        }
    }

    moveItem(oldIndex, newIndex) {
        if (oldIndex === newIndex) return;

        const item = this.#queue.splice(oldIndex, 1)[0];
        this.#queue.splice(newIndex, 0, item);

        if (this.#currentIndex === oldIndex) this.#currentIndex = newIndex;
        else if (oldIndex < this.#currentIndex && newIndex >= this.#currentIndex) this.#currentIndex--;
        else if (oldIndex > this.#currentIndex && newIndex <= this.#currentIndex) this.#currentIndex++;

        this.saveToSession();
        this.renderQueue();
    }

    // Render the queue to the DOM container without using innerHTML
    renderQueue() {
        if (!this.#queueContainer) return;

        // Clear existing content
        while (this.#queueContainer.firstChild) {
            this.#queueContainer.removeChild(this.#queueContainer.firstChild);
        }

        // Build new elements
        this.#queue.forEach((song, index) => {
            const item = document.createElement('div');
            item.classList.add('queue-item');
            if (index === this.#currentIndex) item.classList.add('current-song');

            const title = document.createElement('span');
            title.textContent = song.songTitle;

            const controls = document.createElement('div');
            controls.classList.add('queue-controls');

            const playBtn = document.createElement('button');
            playBtn.textContent = 'Play';
            playBtn.addEventListener('click', () => this.playFromQueue(index));

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => this.removeFromQueue(index));

            controls.appendChild(playBtn);
            controls.appendChild(removeBtn);

            item.appendChild(title);
            item.appendChild(controls);

            this.#queueContainer.appendChild(item);
        });
    }
}
