using Project.Models.Entities;
using Microsoft.EntityFrameworkCore;

/* ==================== Song Repo ======================

    This repository handles the basic CRUD functions for the song database, including:
        - Creation, reading, updating and deleting of a song
        - Reading all songs
    Since the main point of songs come from utilizing songs, many of the more complex
    functions can be found in the Playlist repository

   ==================== Song Repo ====================== */

namespace Project.Services
{
    public class DbSongsRepository : ISongRepository
    {
        private readonly ApplicationDbContext _db;

        public DbSongsRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        // --------------------------
        // Get all songs
        // --------------------------
        public async Task<ICollection<Song>> ReadAllAsync()
        {
            return await _db.Songs.ToListAsync();
        }

        // --------------------------
        // Create a new song
        // --------------------------
        public async Task<Song> CreateAsync(Song newSong)
        {
            await _db.Songs.AddAsync(newSong);
            await _db.SaveChangesAsync();
            return newSong;
        }

        // --------------------------
        // Read a song by ID
        // --------------------------
        public async Task<Song?> ReadAsync(int id)
        {
            return await _db.Songs.FindAsync(id);
        }

        // --------------------------
        // Update an existing song
        // --------------------------
        public async Task UpdateAsync(int oldId, Song updatedSong)
        {
            var songToUpdate = await ReadAsync(oldId);
            if (songToUpdate != null)
            {
                songToUpdate.SongTitle = updatedSong.SongTitle;
                songToUpdate.SongLength = updatedSong.SongLength;
                songToUpdate.Artists = updatedSong.Artists;
                songToUpdate.AlbumArt = updatedSong.AlbumArt;
                songToUpdate.IsYouTube = updatedSong.IsYouTube;

                await _db.SaveChangesAsync();
            }
        }

        // --------------------------
        // Delete a song by ID
        // --------------------------
        public async Task DeleteAsync(int id)
        {
            var songToDelete = await ReadAsync(id);
            if (songToDelete != null)
            {
                _db.Songs.Remove(songToDelete);
                await _db.SaveChangesAsync();
            }
        }
    }
}
