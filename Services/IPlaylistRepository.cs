using Project.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Project.Models.DTOs;
namespace Project.Services;

public interface IPlaylistRepository
{
    Task<ICollection<Playlist>> ReadAllAsync();
    Task<Playlist> CreateAsync(Playlist playlist);
    Task<Playlist?> ReadAsync(int id);
    Task<ICollection<Playlist>> ReadByAccountIdAsync(string? accountId);
    Task<bool> RemoveSongAsync(int playlistId, int songId);
    Task UpdateAsync(int oldId, Playlist playlist);
    Task DeleteAsync(int id);
    Task AddSong(int id, Song song);
    Task UpdatePlaylistAsync(int playlistId, PlaylistDto playlist);
}