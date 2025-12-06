namespace Project.Models.Entities
{
    public class PlaylistSong
    {
        public int PlaylistId { get; set; }
        public Playlist Playlist { get; set; } = null!;
        
        public int SongId { get; set; }
        public Song Song { get; set; } = null!;
        
        public DateTime AddedDate { get; set; } = DateTime.Now;
        public int OrderIndex { get; set; } // For ordering songs in playlist
    }
}