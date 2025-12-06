namespace Project.Models.DTOs;

// DTO to be used when handling song data in transactions, like the YouTube API

public class SongDto
{
    public int SongId { get; set; }
    public string? SongTitle { get; set; } = string.Empty;
    public double SongLength { get; set; }
    public string? Artists { get; set; } = string.Empty;
    public string? AlbumArt { get; set; } = string.Empty;
    public bool IsYouTube { get; set; } = false;
    public string? VideoId { get; set; } 
}