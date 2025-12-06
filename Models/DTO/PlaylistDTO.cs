using System;
using System.Collections.Generic;

// DTO to be used when handling playlist data in transactions

namespace Project.Models.DTOs
{
    public class PlaylistDto
    {
        public int PlaylistId { get; set; }
        public string PlaylistTitle { get; set; } = string.Empty;

        
        public string? AccountId { get; set; }
        public string? AccountName { get; set; } 

        public int SongCount { get; set; }
        public string? PlaylistArt { get; set; }

        public List<SongDto>? Songs { get; set; }
    }
}