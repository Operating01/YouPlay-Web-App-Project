using Microsoft.AspNetCore.Mvc;
using Project.Models.Entities;

public interface ISongRepository
{
    Task<ICollection<Song>> ReadAllAsync();
    Task<Song> CreateAsync(Song newSong);
    Task<Song?> ReadAsync(int id);
    Task UpdateAsync(int oldId, Song updatedSong);
    Task DeleteAsync(int id);
}