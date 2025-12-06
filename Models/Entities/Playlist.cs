using System.ComponentModel.DataAnnotations;
namespace Project.Models.Entities;
public class Playlist
{
    public int PlaylistId { get; set; }
    public string? PlaylistTitle { get; set; } = String.Empty;

    [Required]
    public Account Account { get; set; }
    public string? AccountId { get; set; }
    public int? SongCount { get; set; }
    public string? PlaylistArt { get; set; }
    public List<Song>? SongsInPlaylist { get; set; }
    public List<PlaylistSong> PlaylistSongs { get; set; } = new();

}