using System.ComponentModel.DataAnnotations;
namespace Project.Models.Entities;
public class Song 
{
    public int SongId { get; set; }
    public string IdInYouTube { get; set; }
    public string? SongTitle { get; set; } = String.Empty;
    public double SongLength { get; set; }
    public string? Artists { get; set; } = String.Empty;
    public string? AlbumArt { get; set; } = String.Empty;
    // This line is unused in most code, but left in incase Spotify functionality is added later on
    public bool IsYouTube { get; set; } = false;
    public List<PlaylistSong> PlaylistSongs { get; set; } = new();
}