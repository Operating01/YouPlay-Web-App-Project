using Project.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Project.Models.DTOs;

/* ==================== Playlist Repo ======================

    This repository handles the basic CRUD functions for the playlist database, along
    with some specifications, including:
        - Creation, reading, updating and deleting of a playlist
        - Reading all playlists
        - Reading a playlist from a user ID
        - Deleting a song from a playlist

   ==================== Playlist Repo ====================== */

namespace Project.Services
{
    
    public class DbPlaylistRepository : IPlaylistRepository
    {
        private readonly ApplicationDbContext _db;


        public DbPlaylistRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        // --------------------------
        // Read all playlists with songs included
        // --------------------------
        public async Task<ICollection<Playlist>> ReadAllAsync()
        {
            return await _db.Playlists
                .Include(p => p.PlaylistSongs)
                    .ThenInclude(ps => ps.Song)
                .Select(p => new Playlist
                {
                    // This is done instead of just grabbing the item,
                    // so SongCount can be dynamically set
                    PlaylistId = p.PlaylistId,
                    PlaylistTitle = p.PlaylistTitle,
                    AccountId = p.AccountId,
                    PlaylistArt = p.PlaylistArt,
                    PlaylistSongs = p.PlaylistSongs,
                    SongCount = p.PlaylistSongs.Count
                })
                .ToListAsync();
        }

        // --------------------------
        // Create a new playlist
        // --------------------------
        public async Task<Playlist> CreateAsync(Playlist playlist)
        {
            await _db.Playlists.AddAsync(playlist);
            await _db.SaveChangesAsync();
            return playlist;
        }

        // --------------------------
        // Read a playlist by its ID
        // --------------------------
        public async Task<Playlist?> ReadAsync(int id)
        {
            return await _db.Playlists
                .Include(p => p.PlaylistSongs)
                    .ThenInclude(ps => ps.Song)
                .Where(p => p.PlaylistId == id)
                .Select(p => new Playlist
                {
                    // This is done instead of just grabbing the item,
                    // so SongCount can be dynamically set
                    PlaylistId = p.PlaylistId,
                    PlaylistTitle = p.PlaylistTitle,
                    AccountId = p.AccountId,
                    PlaylistArt = p.PlaylistArt,
                    PlaylistSongs = p.PlaylistSongs,
                    SongCount = p.PlaylistSongs.Count
                })
                .FirstOrDefaultAsync();
        }

        // --------------------------
        // Read playlists by account ID
        // --------------------------
        public async Task<ICollection<Playlist>> ReadByAccountIdAsync(string? accountId)
        {
            return await _db.Playlists
                .Include(p => p.PlaylistSongs)
                    .ThenInclude(ps => ps.Song)
                .Where(p => p.AccountId == accountId)
                .Select(p => new Playlist
                {
                    // This is done instead of just grabbing the item,
                    // so SongCount can be dynamically set
                    PlaylistId = p.PlaylistId,
                    PlaylistTitle = p.PlaylistTitle,
                    AccountId = p.AccountId,
                    PlaylistArt = p.PlaylistArt,
                    PlaylistSongs = p.PlaylistSongs,
                    SongCount = p.PlaylistSongs.Count
                })
                .ToListAsync();
        }

        // --------------------------
        // Update playlist details
        // --------------------------
        public async Task UpdateAsync(int oldId, Playlist playlist)
        {
            var playlistToUpdate = await _db.Playlists.FindAsync(oldId);
            if (playlistToUpdate != null)
            {
                // Replaces old data with new data and saves changes
                playlistToUpdate.PlaylistTitle = playlist.PlaylistTitle;
                playlistToUpdate.AccountId = playlist.AccountId;
                playlistToUpdate.SongCount = playlist.SongCount;
                playlistToUpdate.PlaylistArt = playlist.PlaylistArt;

                await _db.SaveChangesAsync();
            }
        }

        // --------------------------
        // Delete a playlist
        // --------------------------
        public async Task DeleteAsync(int id)
        {
            var playlistToDelete = await _db.Playlists.FindAsync(id);
            if (playlistToDelete != null)
            {
                _db.Playlists.Remove(playlistToDelete);
                await _db.SaveChangesAsync();
            }
        }

        // --------------------------
        // Add a song to a playlist
        // --------------------------
        public async Task AddSong(int id, Song song)
        {
            // Check if the song exists in the database
            var existingSong = await _db.Songs
                .FirstOrDefaultAsync(s => s.SongId == song.SongId && !string.IsNullOrEmpty(song.IdInYouTube));

            int songId;
            if (existingSong != null)
            {
                songId = existingSong.SongId;
            }
            else
            {
                // Add new song to the database
                _db.Songs.Add(song);
                await _db.SaveChangesAsync();
                songId = song.SongId;
            }

            // Check if song is already in the playlist
            var alreadyInPlaylist = await _db.PlaylistSongs
                .AnyAsync(ps => ps.PlaylistId == id && ps.SongId == songId);

            if (!alreadyInPlaylist)
            {
                var playlistSong = new PlaylistSong
                {
                    PlaylistId = id,
                    SongId = songId
                };

                _db.PlaylistSongs.Add(playlistSong);
                await _db.SaveChangesAsync();
            }
        }

        // --------------------------
        // Remove a song from a playlist
        // --------------------------
        public async Task<bool> RemoveSongAsync(int playlistId, int songId)
        {
            var playlist = await _db.Playlists
                .Include(p => p.PlaylistSongs)
                .FirstOrDefaultAsync(p => p.PlaylistId == playlistId);

            if (playlist == null) return false;

            var playlistSong = playlist.PlaylistSongs
                .FirstOrDefault(ps => ps.SongId == songId);

            if (playlistSong == null) return false;

            _db.PlaylistSongs.Remove(playlistSong);
            await _db.SaveChangesAsync();
            return true;
        }

        // --------------------------
        // Update playlist details from DTO
        // --------------------------
        public async Task UpdatePlaylistAsync(int playlistId, PlaylistDto newPlaylist)
        {
            var playlist = await _db.Playlists
                .Include(p => p.PlaylistSongs)
                .FirstOrDefaultAsync(p => p.PlaylistId == playlistId);

            if (playlist == null) return;

            playlist.PlaylistTitle = newPlaylist.PlaylistTitle;

            // Update playlist art
            playlist.PlaylistArt = newPlaylist.PlaylistArt;

            await _db.SaveChangesAsync();
        }
    }
}
