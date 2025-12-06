'use strict';

/* =================YouTube Search  ==================

    This short class just handles the search functionality for YouTube. It makes 
    a query with the given query and maxes out the list to 10 items

   ================= YouTube Search ================== */ 

export class YouTubeSearch{
    #baseAddress;
    constructor(baseAddress){
        this.#baseAddress = baseAddress;
    }

    async searchVideos(query) {
        try {
            const response = await fetch(`/api/youtube/search?query=${encodeURIComponent(query)}&maxResults=10`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Search failed');
            }
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search videos: ' + error.message);
            return [];
        }
    }
}