"use strict";
import { YouTubeSearch } from "./YouTubeSearch.js";
import { QueueManager } from "./QueueManager.js";

/* ================= DOM Manipulator  ==================

    This code is the main functionality of the webapp; it includes functionality for
    actions such as:
        - Searches for songs in the top bar and playlists in the sidebar
        - Queue management using QueueManager
        - Playing, pausing, forwarding and rewinding tracks
        - Populating the sidebar and adding it's functionality
        - Adding functionality to the Details page
        - Creating song and playlist elements
        - Toast notifications
        - Modal management
        - Making requests to the API

   ================= DOM Manipulator ================== */ 

export class MainDOMManip {
    #player;
    #searcher;
    #queueManager;
    #eventListenersSetUp;

    constructor() {
        // core services and state
        this.#player = null;
        this.#searcher = new YouTubeSearch('/api/youtube');
        this.#queueManager = new QueueManager();
        this.#eventListenersSetUp = false;

        // make queue manager available globally for debugging/other scripts
        window.queueManager = this.#queueManager;

        // Sets up the important services that either need to be ran on startup or just need to be always listening
        this.waitForPlayer();
        this.initializePlaylistSongClicks();
        this.initializePlaylistEdit();
        this.initializePlaylistSearch();
        this.loadSidebarPlaylists();
        this.loadFeaturedPlaylists();

        // restore last song in queue if present
        const lastSong = this.#queueManager.getCurrentSong();
        if (lastSong) {
            console.log('Restoring last song from queue:', lastSong.songTitle);
            this.#queueManager.playFromQueue(this.#queueManager.getCurrentIndex());
            this.updateNowPlaying(lastSong);
        }
    }

    /* -------------------------
       Waits and sets up the YouTube Player
       ------------------------- */
    waitForPlayer() {
        console.log('Waiting for YouTube player...');
        if (window.youtubePlayer && window.isYouTubePlayerReady && window.isYouTubePlayerReady()) {
            console.log("Player is ready");
            this.#player = window.youtubePlayer;
            this.#queueManager.setPlayer(this.#player);

            if (!this.#eventListenersSetUp) {
                this.setUpEventListeners();
                this.setupYouTubePlayerEvents();
                this.#eventListenersSetUp = true;
            }
        } else {
            setTimeout(() => this.waitForPlayer(), 100);
        }
    }

    /* -------------------------
       Finishes setup for the player
       ------------------------- */
    setupYouTubePlayerEvents() {
        // Subscribe to custom state-change events from your YouTube wrapper
        window.addEventListener('youtubePlayerStateChange', (e) => {
            const state = e.detail.state;
            console.log('YouTube player state:', state);

            // 0 = ended
            if (state === 0) {
                console.log('Video ended — play next');
                const nextSong = this.#queueManager.playNext();
                if (nextSong) this.updateNowPlaying(nextSong);
                else console.log('End of queue');
            }

            // update play/pause button visuals
            const playButton = document.getElementById('playButton');
            if (playButton) {
                if (state === 1) {
                    playButton.classList.remove('bi-play-fill');
                    playButton.classList.add('bi-pause-fill');
                } else if (state === 2) {
                    playButton.classList.remove('bi-pause-fill');
                    playButton.classList.add('bi-play-fill');
                }
            }
        });
    }

    /* =========================
                    HELPER DOM TOOLS
       ========================= */

    // Clears children from an element
    clearElement(el) {
        if (!el) return;
        while (el.firstChild) el.removeChild(el.firstChild);
    }

    // Create spinner container (used in playlist search)
    createSpinnerElement() {
        const wrap = document.createElement('div');
        wrap.className = 'text-center py-3';
        const spinner = document.createElement('div');
        spinner.className = 'spinner-border';
        spinner.setAttribute('role', 'status');
        wrap.appendChild(spinner);
        return wrap;
    }

    /* -------------------------
       Global UI event setup
       ------------------------- */
    setUpEventListeners() {
        console.log('Setting up event listeners...');

        //  Song search input: Enter triggers search 
        const SongSearchElement = document.querySelector('#SongSearch');
        if (SongSearchElement) {
            SongSearchElement.addEventListener('keydown', async (e) => {
                if (e.key !== 'Enter') return;
                const searchResultContainer = document.querySelector("#searchResults");
                if (!searchResultContainer) return;

                // Clears results
                this.clearElement(searchResultContainer);

                try {
                    const results = await this.#searcher.searchVideos(SongSearchElement.value);
                    results.forEach(song => searchResultContainer.appendChild(this.createSongCard(song)));
                } catch (err) {
                    console.error('Search failed', err);
                    const errDiv = document.createElement('div');
                    errDiv.className = 'text-danger';
                    errDiv.textContent = 'Search error';
                    searchResultContainer.appendChild(errDiv);
                }
            });
        }

        // New playlist button 
        const newPlaylistBtn = document.querySelector('#newPlaylistBtn');
        if (newPlaylistBtn) {
            console.log('New Playlist button found');
            newPlaylistBtn.addEventListener('click', async () => {
                const isLoggedIn = await this.checkAuth();
                if (!isLoggedIn) {
                    alert('Please log in to create a playlist');
                    window.location.href = '/Identity/Account/Login';
                    return;
                }
                const modalEl = document.getElementById('createPlaylistModal');
                if (modalEl) new bootstrap.Modal(modalEl).show();
            });
        } else {
            console.log('New Playlist button not found');
        }

        // Events for playlist modal
        const savePlaylistBtn = document.querySelector('#savePlaylistBtn');
        if (savePlaylistBtn) {
            console.log('Save Playlist button found');
            savePlaylistBtn.addEventListener('click', async () => {
                await this.createPlaylist();
            });
        }

        // Multiple playback control events
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.addEventListener('click', () => {
                if (!this.#player) {
                    console.error('Player not available');
                    return;
                }
                const playerState = this.#player.getPlayerState();
                if (playerState === 1) this.#player.pauseVideo();
                else this.#player.playVideo();
            });
        }

        const nextButton = document.getElementById('nextButton');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const nextSong = this.#queueManager.playNext();
                if (nextSong) this.updateNowPlaying(nextSong);
                else this.showToast('No next song in queue', 'info');
            });
        }

        const prevButton = document.getElementById('prevButton');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                const prevSong = this.#queueManager.playPrevious();
                if (prevSong) this.updateNowPlaying(prevSong);
                else this.showToast('No previous song in queue', 'info');
            });
        }

        const queueButton = document.getElementById('queueButton');
        if (queueButton) queueButton.addEventListener('click', () => this.showQueueModal());

        const shuffleBtn = document.getElementById('shuffleQueueBtn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                this.#queueManager.shuffleQueue();
                const currentSong = this.#queueManager.getCurrentSong();
                if (currentSong) this.updateNowPlaying(currentSong);
                this.showQueueModal();
                this.showToast('Queue shuffled!', 'success');
            });
        }

        const clearBtn = document.getElementById('clearQueueBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.#queueManager.clearQueue();
                this.showQueueModal();
                this.showToast('Queue cleared!', 'info');
            });
        }
    }

    /* -------------------------
       Song card builder 
       ------------------------- */
    createSongCard(song) {
        // wrapper card
        const songCardContainer = document.createElement("div");
        songCardContainer.classList.add("card", "mb-2");
        songCardContainer.setAttribute("play-id", song.videoId);
        songCardContainer.style.cursor = "pointer";
        songCardContainer.style.minWidth = "300px";
        songCardContainer.style.maxWidth = "400px";

        // card body
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body", "d-flex", "align-items-center", "p-2");

        // thumbnail area
        const thumbnailContainer = document.createElement("div");
        thumbnailContainer.classList.add("me-3");
        thumbnailContainer.style.width = "80px";
        thumbnailContainer.style.height = "60px";

        if (song.albumArt) {
            const thumbnail = document.createElement("img");
            thumbnail.src = song.albumArt;
            thumbnail.alt = "Thumbnail";
            thumbnail.style.width = "100%";
            thumbnail.style.height = "100%";
            thumbnail.style.objectFit = "cover";
            thumbnail.style.borderRadius = "4px";
            thumbnailContainer.appendChild(thumbnail);
        } else {
            thumbnailContainer.style.backgroundColor = "#e9ecef";
            thumbnailContainer.style.borderRadius = "4px";
            thumbnailContainer.style.display = "flex";
            thumbnailContainer.style.alignItems = "center";
            thumbnailContainer.style.justifyContent = "center";

            const placeholder = document.createElement("span");
            placeholder.className = "text-muted";

            const line1 = document.createTextNode("Add");
            const br = document.createElement("br");
            const line2 = document.createTextNode("Thumbnail");
            placeholder.appendChild(line1);
            placeholder.appendChild(br);
            placeholder.appendChild(line2);

            thumbnailContainer.appendChild(placeholder);
        }

        // text container: title + artist
        const textContainer = document.createElement("div");
        textContainer.style.flex = "1";
        textContainer.style.minWidth = "0";

        const titleElement = document.createElement("h6");
        titleElement.classList.add("card-title", "mb-1");
        titleElement.style.fontSize = "14px";
        titleElement.style.fontWeight = "600";
        titleElement.style.overflow = "hidden";
        titleElement.style.textOverflow = "ellipsis";
        titleElement.style.whiteSpace = "nowrap";
        titleElement.innerText = song.songTitle || song.title || 'Unknown Title';

        const artistElement = document.createElement("p");
        artistElement.classList.add("card-text", "text-muted", "mb-0");
        artistElement.style.fontSize = "12px";
        artistElement.style.overflow = "hidden";
        artistElement.style.textOverflow = "ellipsis";
        artistElement.style.whiteSpace = "nowrap";
        artistElement.innerText = song.artists || 'Unknown Artist';

        textContainer.append(titleElement, artistElement);
        cardBody.append(thumbnailContainer, textContainer);

        // add-to-queue small button
        const addToQueueBtn = document.createElement("button");
        addToQueueBtn.className = "btn btn-sm btn-outline-primary me-2";
        addToQueueBtn.title = "Add to Queue";
        const queueIcon = document.createElement("i");
        queueIcon.className = "bi bi-plus-circle";
        addToQueueBtn.appendChild(queueIcon);
        addToQueueBtn.onclick = (e) => {
            e.stopPropagation();
            this.#queueManager.addToQueue(song);
            this.showToast(`Added "${song.songTitle}" to queue`, 'success');
        };

        // add to playlist button
        const addBtn = document.createElement("button");
        addBtn.className = "btn btn-success";
        const plusBtn = document.createElement("i");
        plusBtn.className = "bi bi-plus";
        addBtn.appendChild(plusBtn);
        addBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.openPlaylistSelector(song);
        });

        // place buttons and body into card
        cardBody.appendChild(addBtn);
        songCardContainer.appendChild(cardBody);

        // clicking card enqueues and plays
        songCardContainer.addEventListener('click', () => {
            this.#queueManager.addToQueue(song);
            const index = this.#queueManager.getQueue().length - 1;
            this.#queueManager.playFromQueue(index);
            this.updateNowPlaying(song);
        });

        return songCardContainer;
    }

    /* -------------------------
       Now playing (placeholder UI hook)
       ------------------------- */
    updateNowPlaying(song) {
        // Update any "now playing" UI elements — left as hooks for your UI
        console.log('Now playing:', song.songTitle, 'by', song.artists);
        // e.g., update footer or header with song info
    }

    /* -------------------------
       Sidebar playlists (user)
       ------------------------- */
    async loadSidebarPlaylists() {
        const sidebarContainer = document.querySelector('.playlist-list .list-group');
        if (!sidebarContainer) return;

        const isLoggedIn = await this.checkAuth();
        if (!isLoggedIn) return;

        try {
            const response = await fetch('/Playlist/MyPlaylists');
            if (!response.ok) throw new Error("Could not load playlists");

            const playlists = await response.json();
            if (!Array.isArray(playlists)) return;

            // remove existing user-playlist nodes
            sidebarContainer.querySelectorAll('.user-playlist').forEach(el => el.remove());

            // append playlists
            playlists.forEach(pl => {
                const a = document.createElement('a');
                a.classList.add("list-group-item", "list-group-item-action", "playlist-item", "user-playlist");
                a.href = `/Playlist/Details/${pl.playlistId}`;

                const icon = document.createElement('i');
                icon.className = 'bi bi-music-note-list me-2';
                a.appendChild(icon);
                a.appendChild(document.createTextNode(pl.playlistTitle));

                sidebarContainer.appendChild(a);
            });
        } catch (err) {
            console.error("Error loading sidebar playlists:", err);
        }
    }

    /* -------------------------
       Authentication check
       ------------------------- */
    async checkAuth() {
        try {
            const response = await fetch('/api/account/check-auth');
            const data = await response.json();
            return data.isAuthenticated;
        } catch (error) {
            console.error('Error checking auth:', error);
            return false;
        }
    }

    /* -------------------------
       Playlist creation
       ------------------------- */
    async createPlaylist() {
        const titleInput = document.querySelector('#playlistTitle');
        const descriptionInput = document.querySelector('#playlistDescription');
        const artUrlInput = document.querySelector('#playlistArtUrl');

        const playlistTitle = (titleInput?.value || '').trim();
        if (!playlistTitle) {
            alert('Please enter a playlist name');
            return;
        }

        try {
            const response = await fetch('/Playlist/Create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playlistTitle: playlistTitle,
                    playlistDescription: descriptionInput?.value || '',
                    playlistArtUrl: artUrlInput?.value.trim() || null
                })
            });

            if (response.ok) {
                const result = await response.json();
                const modal = bootstrap.Modal.getInstance(document.getElementById('createPlaylistModal'));
                if (modal) modal.hide();

                if (titleInput) titleInput.value = '';
                if (descriptionInput) descriptionInput.value = '';
                if (artUrlInput) artUrlInput.value = '';
                const artPreview = document.getElementById('artPreview');
                if (artPreview) artPreview.style.display = 'none';

                window.location.href = `/Playlist/Details/${result.playlistId}`;
            } else {
                const error = await response.json();
                alert('Failed to create playlist: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            alert('Error creating playlist');
        }
    }

    /* -------------------------
       Featured playlists area
       ------------------------- */
    async loadFeaturedPlaylists() {
        const container = document.getElementById('featuredPlaylistsContainer');
        if (!container) return;

        try {
            const response = await fetch('/api/playlist/featured');
            if (!response.ok) throw new Error('Failed to load playlists');

            const playlists = await response.json();

            // clear
            this.clearElement(container);

            if (!playlists || playlists.length === 0) {
                const noPlaylistsCol = document.createElement('div');
                noPlaylistsCol.className = 'col-12 text-center text-muted';
                noPlaylistsCol.textContent = 'No playlists available yet. Create one!';
                container.appendChild(noPlaylistsCol);
                return;
            }

            playlists.forEach(playlist => {
                const col = document.createElement('div');
                col.className = 'col-md-4 col-sm-6';
                const card = this.createPlaylistCard(playlist);
                col.appendChild(card);
                container.appendChild(col);
            });
        } catch (error) {
            console.error('Error loading featured playlists:', error);
            this.clearElement(container);

            const col = document.createElement('div');
            col.className = 'col-12';
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';

            const icon = document.createElement('i');
            icon.className = 'bi bi-exclamation-triangle me-2';
            alertDiv.appendChild(icon);
            alertDiv.appendChild(document.createTextNode('Failed to load featured playlists'));
            col.appendChild(alertDiv);
            container.appendChild(col);
        }
    }

    /* -------------------------
       Playlist card builder
       ------------------------- */
    createPlaylistCard(playlist) {
        const card = document.createElement('div');
        card.className = 'card h-100 playlist-card';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.2s, box-shadow 0.2s';

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });

        // art
        const img = document.createElement('img');
        img.className = 'card-img-top';
        img.alt = playlist.playlistTitle || 'Playlist Art';
        img.style.height = '200px';
        img.style.objectFit = 'cover';

        const hasArt = Boolean(playlist.playlistArt);
        img.src = hasArt
            ? playlist.playlistArt
            : "placeholder.jpg";

        img.onerror = () => {
            img.src = "placeholder.jpg";
        };

        card.appendChild(img);

        // body only if art exists (as original intended)
        if (hasArt) {
            const body = document.createElement('div');
            body.className = 'card-body';

            const title = document.createElement('h5');
            title.className = 'card-title';
            title.style.overflow = 'hidden';
            title.style.whiteSpace = 'nowrap';
            title.style.textOverflow = 'ellipsis';
            title.textContent = playlist.playlistTitle || 'Untitled';

            const songCount = document.createElement('p');
            songCount.className = 'card-text text-muted small';
            const musicIcon = document.createElement('i');
            musicIcon.className = 'bi bi-music-note me-1';
            songCount.appendChild(musicIcon);
            songCount.appendChild(document.createTextNode(`${playlist.songCount || 0} songs`));

            body.appendChild(title);
            body.appendChild(songCount);
            card.appendChild(body);
        }

        card.addEventListener('click', () => {
            window.location.href = `/Playlist/Details/${playlist.playlistId}`;
        });

        return card;
    }

    /* -------------------------
       Add song to server playlist
       ------------------------- */
    async addSongToPlaylist(playlistId, song) {
        try {
            const response = await fetch(`/AddSong/${playlistId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoId: song.videoId,
                    songTitle: song.songTitle || song.title || "Unknown Title",
                    artists: song.artists || "Unknown Artist",
                    albumArt: song.albumArt || null,
                    songLength: song.songLength || 0,
                    isYouTube: true
                })
            });

            if (response.ok) {
                this.showToast('Song added to playlist!', 'success');
            } else {
                const error = await response.json();
                this.showToast(error.message || 'Failed to add song', 'error');
            }
        } catch (error) {
            console.error('Error adding song to playlist:', error);
            this.showToast('Error adding song to playlist', 'error');
        }
    }

    /* -------------------------
       Queue modal rendering (called from the modal in _Layout)
       ------------------------- */
    showQueueModal() {
        const queue = this.#queueManager.getQueue();
        const currentIndex = this.#queueManager.getCurrentIndex();

        const modalBody = document.getElementById("queueModalBody");
        if (!modalBody) return;
        this.clearElement(modalBody);

        const queueContainer = document.createElement("div");
        queueContainer.classList.add("list-group");

        if (queue.length === 0) {
            const emptyMsg = document.createElement("div");
            emptyMsg.classList.add("text-center", "text-muted", "py-4");
            emptyMsg.textContent = "Queue is empty";
            queueContainer.appendChild(emptyMsg);
        } else {
            queue.forEach((song, index) => {
                const isPlaying = index === currentIndex;

                const item = document.createElement("div");
                item.classList.add("list-group-item");
                if (isPlaying) item.classList.add("active");
                item.dataset.queueIndex = index;

                const row = document.createElement("div");
                row.classList.add("d-flex", "align-items-center");

                let indicator;
                if (isPlaying) {
                    indicator = document.createElement("i");
                    indicator.classList.add("bi", "bi-volume-up", "me-2");
                } else {
                    indicator = document.createElement("span");
                    indicator.classList.add("me-3", "text-muted");
                    indicator.textContent = index + 1;
                }
                row.appendChild(indicator);

                const details = document.createElement("div");
                details.classList.add("flex-grow-1");

                const title = document.createElement("strong");
                title.textContent = song.songTitle || "null";
                details.appendChild(title);
                details.appendChild(document.createElement("br"));

                const artist = document.createElement("small");
                artist.classList.add("text-muted");
                artist.textContent = song.artists || '';
                details.appendChild(artist);

                row.appendChild(details);

                const removeBtn = document.createElement("button");
                removeBtn.classList.add("btn", "btn-sm", "btn-danger", "remove-from-queue");
                removeBtn.dataset.index = index;

                const trashIcon = document.createElement("i");
                trashIcon.classList.add("bi", "bi-trash");
                removeBtn.appendChild(trashIcon);

                row.appendChild(removeBtn);
                item.appendChild(row);
                queueContainer.appendChild(item);
            });
        }

        modalBody.appendChild(queueContainer);

        // reuse modal instance if available
        const modalElement = document.getElementById("queueModal");
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (!modal) modal = new bootstrap.Modal(modalElement);
        modal.show();

        modalBody.querySelectorAll(".remove-from-queue").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.dataset.index, 10);
                this.#queueManager.removeFromQueue(index);
                this.showQueueModal(); // re-render
            });
        });
    }

    /* -------------------------
       Basic toast for messages in success/error
       ------------------------- */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '250px';
        toast.innerText = message;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    /* -------------------------
       Playlist selection modal flow
       ------------------------- */
    async openPlaylistSelector(song) {
        // store song for selection
        this.songToAdd = song;

        try {
            const response = await fetch('/Playlist/MyPlaylists');
            if (!response.ok) {
                alert("Unable to load playlists.");
                return;
            }
            const playlists = await response.json();
            this.renderPlaylistSelectModal(playlists);

            const modalEl = document.getElementById('selectPlaylistModal');
            if (modalEl) new bootstrap.Modal(modalEl).show();
        } catch (err) {
            console.error("Error loading playlists:", err);
        }
    }

    /* -------------------------
       Playlist search (search bar in sidebar)
       ------------------------- */
    initializePlaylistSearch() {
        const searchInput = document.querySelector('#PlaylistSearch');
        if (!searchInput) return;

        searchInput.addEventListener('keydown', async (e) => {
            if (e.key !== 'Enter') return;
            const query = searchInput.value.trim();
            if (!query) return;

            const resultsContainer = document.querySelector('#playlistSearchResults');
            if (!resultsContainer) return;

            // show spinner
            this.clearElement(resultsContainer);
            resultsContainer.appendChild(this.createSpinnerElement());

            try {
                const response = await fetch(`/Playlist/Search?query=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error("Failed to search playlists");

                const playlists = await response.json();
                this.clearElement(resultsContainer);

                if (!playlists || playlists.length === 0) {
                    const noResult = document.createElement('div');
                    noResult.className = 'text-center text-muted py-4';
                    noResult.textContent = 'No playlists found';
                    resultsContainer.appendChild(noResult);
                    return;
                }

                playlists.forEach(pl => {
                    const card = document.createElement('div');
                    card.className = "card mb-2";
                    card.style.cursor = "pointer";

                    const artSrc = pl.playlistArt || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23e9ecef"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236c757d" font-size="10">No Art</text></svg>';

                    const body = document.createElement('div');
                    body.className = 'card-body d-flex align-items-center p-2';

                    const img = document.createElement('img');
                    img.src = artSrc;
                    img.className = 'me-3';
                    img.style.width = '60px';
                    img.style.height = '60px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '4px';
                    img.style.border = '1px solid #dee2e6';
                    img.onerror = function() {
                        this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect width=%2260%22 height=%2260%22 fill=%22%23e9ecef%22/></svg>';
                    };

                    const flex = document.createElement('div');
                    flex.className = 'flex-grow-1';

                    const title = document.createElement('h6');
                    title.className = 'mb-0';
                    title.textContent = pl.playlistTitle || 'Untitled';

                    const meta = document.createElement('small');
                    meta.className = 'text-muted';
                    meta.textContent = `${pl.songCount || 0} songs`;

                    flex.appendChild(title);
                    flex.appendChild(meta);

                    // read-only badge when not owner
                    const isOwner = !window.currentUserId || pl.accountId === window.currentUserId;
                    if (!isOwner) {
                        const badge = document.createElement('span');
                        badge.className = 'badge bg-warning text-dark ms-2';
                        badge.textContent = 'Read Only';
                        flex.appendChild(badge);
                    }

                    body.appendChild(img);
                    body.appendChild(flex);
                    card.appendChild(body);

                    // always allow viewing (original code navigated)
                    card.addEventListener('click', () => {
                        window.location.href = `/Playlist/Details/${pl.playlistId}`;
                    });

                    resultsContainer.appendChild(card);
                });
            } catch (err) {
                console.error(err);
                this.clearElement(resultsContainer);
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-danger';
                const icon = document.createElement('i');
                icon.className = 'bi bi-exclamation-triangle me-2';
                alertDiv.appendChild(icon);
                alertDiv.appendChild(document.createTextNode(`Error searching playlists: ${err.message}`));
                resultsContainer.appendChild(alertDiv);
            }
        });
    }

    /* -------------------------
       Render playlist selection modal (found in _Sidebar)
       ------------------------- */
    renderPlaylistSelectModal(playlists) {
        const container = document.querySelector('#playlistList');
        if (!container) return;
        this.clearElement(container);

        (playlists || []).forEach(pl => {
            const card = document.createElement('div');
            card.className = "card p-2 d-flex flex-row align-items-center";
            card.style.cursor = "pointer";

            const img = document.createElement('img');
            img.src = pl.playlistArt || '/placeholder.png';
            img.className = 'me-3';
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';

            const txt = document.createElement('div');
            const h6 = document.createElement('h6');
            h6.className = 'mb-0';
            h6.textContent = pl.playlistTitle;
            const small = document.createElement('small');
            small.className = 'text-muted';
            small.textContent = `${pl.songCount ?? 0} songs`;

            txt.appendChild(h6);
            txt.appendChild(small);

            card.appendChild(img);
            card.appendChild(txt);

            card.addEventListener("click", () => this.selectPlaylist(pl.playlistId));
            container.appendChild(card);
        });
    }

    async selectPlaylist(playlistId) {
        if (!this.songToAdd) return;
        const modal = bootstrap.Modal.getInstance(document.getElementById('selectPlaylistModal'));
        if (modal) modal.hide();
        await this.addSongToPlaylist(playlistId, this.songToAdd);
        this.songToAdd = null;
    }

    /* -------------------------
       Playlist song clicks on playlist page
       ------------------------- */
    initializePlaylistSongClicks() {
        const songEls = document.querySelectorAll(".song-card-wrapper");
        if (!songEls.length) return;

        songEls.forEach((el, clickedIndex) => {
            el.addEventListener("click", (event) => {
                // ignore remove button clicks
                if (event.target.closest(".remove-song-btn")) return;

                // clear and rebuild queue from DOM list
                this.#queueManager.clearQueue();

                const songs = Array.from(songEls).map(songEl => ({
                    songTitle: songEl.querySelector(".card-title")?.innerText || '',
                    artists: songEl.querySelector(".card-text")?.innerText || '',
                    videoId: songEl.dataset.videoId,
                    albumArt: songEl.querySelector("img")?.src || null,
                    songLength: 0,
                    isYouTube: true
                }));

                const clickedSong = songs[clickedIndex];
                const otherSongs = songs.filter((_, i) => i !== clickedIndex);

                this.#queueManager.addMultipleToQueue([clickedSong, ...otherSongs]);
                this.#queueManager.playFromQueue(0);
            });
        });
    }

    /* -------------------------
       Playlist edit modal flows
       ------------------------- */
    initializePlaylistEdit() {
        const editButton = document.getElementById("editPlaylistButton");
        if (!editButton) return;

        // prefill and show edit modal
        editButton.addEventListener("click", () => {
            const playlistTitle = document.querySelector(".playlist-title")?.innerText || '';
            const playlistDescription = document.querySelector("#playlistDescription")?.value || "";
            const playlistArt = document.querySelector(".playlist-cover img")?.src || "";

            const t = document.getElementById("editPlaylistTitle");
            const d = document.getElementById("editPlaylistDescription");
            const a = document.getElementById("editPlaylistArtUrl");
            const preview = document.getElementById("editArtPreview");

            if (t) t.value = playlistTitle;
            if (d) d.value = playlistDescription;
            if (a) a.value = playlistArt;

            if (preview) {
                if (playlistArt) {
                    preview.src = playlistArt;
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                }
            }

            const modal = new bootstrap.Modal(document.getElementById("editPlaylistModal"));
            modal.show();
        });

        // art preview live update
        const artInput = document.getElementById("editPlaylistArtUrl");
        if (artInput) {
            artInput.addEventListener("input", () => {
                const preview = document.getElementById("editArtPreview");
                if (!preview) return;
                if (artInput.value.trim()) {
                    preview.src = artInput.value.trim();
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                }
            });
        }

        // save changes
        const saveBtn = document.getElementById("savePlaylistEdits");
        if (saveBtn) {
            saveBtn.addEventListener("click", async () => {
                const playlistId = window.location.pathname.split("/").pop();
                const data = {
                    playlistTitle: document.getElementById("editPlaylistTitle")?.value.trim() || '',
                    playlistDescription: document.getElementById("editPlaylistDescription")?.value.trim() || '',
                    playlistArt: document.getElementById("editPlaylistArtUrl")?.value.trim() || ''
                };

                try {
                    const response = await fetch(`/Playlist/Edit/${playlistId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    if (!response.ok) throw new Error("Failed to save playlist edits");

                    const updated = await response.json();
                    console.log("Playlist updated:", updated);

                    const titleEl = document.querySelector(".playlist-title");
                    if (titleEl) titleEl.innerText = updated.playlistTitle;
                    const coverImg = document.querySelector(".playlist-cover img");
                    if (coverImg && updated.playlistArt) coverImg.src = updated.playlistArt;

                    const modal = bootstrap.Modal.getInstance(document.getElementById("editPlaylistModal"));
                    if (modal) modal.hide();

                    this.showToast("Playlist updated successfully!", "success");
                } catch (err) {
                    console.error(err);
                    this.showToast("Failed to update playlist", "error");
                }
            });
        }
    }
}