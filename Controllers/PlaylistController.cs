using Microsoft.AspNetCore.Mvc;
using Project.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Project.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Project.Models.DTOs;

namespace Project.Controllers
{
    public class PlaylistController : Controller
    {
        private readonly IPlaylistRepository _playlistRepo;
        private readonly ISongRepository _songRepo;
        private readonly UserManager<Account> _userManager;

        // Constructor: inject playlist repository, song repository, and user manager
        public PlaylistController(IPlaylistRepository playlistRepo, ISongRepository songRepo, UserManager<Account> userManager)
        {
            _playlistRepo = playlistRepo;
            _songRepo = songRepo;
            _userManager = userManager;
        }

        // --------------------------
        // Playlist Details
        // --------------------------
        public async Task<IActionResult> Details(int id)
        {
            var playlist = await _playlistRepo.ReadAsync(id);
            if (playlist == null)
                return NotFound();

            return View(playlist);
        }

        // --------------------------
        // Map Playlist entity to DTO
        // --------------------------
        private PlaylistDto MapToDto(Playlist playlist)
        {
            return new PlaylistDto
            {
                PlaylistId = playlist.PlaylistId,
                PlaylistTitle = playlist.PlaylistTitle ?? string.Empty,
                AccountId = playlist.AccountId,
                SongCount = playlist.SongCount ?? 0,
                PlaylistArt = playlist.PlaylistArt,
                Songs = playlist.SongsInPlaylist?.Select(s => new SongDto
                {
                    SongId = s.SongId,
                    SongTitle = s.SongTitle,
                    Artists = s.Artists,
                    AlbumArt = s.AlbumArt,
                    SongLength = s.SongLength
                }).ToList()
            };
        }

        // --------------------------
        // Delete a playlist
        // --------------------------
        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var playlistToDelete = await _playlistRepo.ReadAsync(id);
            if (playlistToDelete != null)
                await _playlistRepo.DeleteAsync(id);

            return RedirectToAction("Index", "Home");
        }

        // --------------------------
        // Get playlists by account ID
        // --------------------------
        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetByAccountId(string? accountId)
        {
            var playlists = await _playlistRepo.ReadByAccountIdAsync(accountId);
            if (playlists == null || playlists.Count == 0)
                return NotFound($"No playlists found for account ID {accountId}");

            var dto = playlists.Select(MapToDto).ToList();
            return Ok(dto);
        }

        // --------------------------
        // Get playlists for logged-in user
        // --------------------------
        [HttpGet("/Playlist/MyPlaylists")]
        public async Task<IActionResult> GetMyPlaylists()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var playlists = await _playlistRepo.ReadByAccountIdAsync(user.Id);
            var dto = playlists.Select(MapToDto).ToList();

            return Ok(dto);
        }

        // --------------------------
        // Remove a song from a playlist
        // --------------------------
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> RemoveSong([FromBody] RemoveSongRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var playlist = await _playlistRepo.ReadAsync(request.PlaylistId);
            if (playlist == null) return NotFound("Playlist not found");

            if (playlist.AccountId != user.Id)
                return Forbid("You do not own this playlist");

            var result = await _playlistRepo.RemoveSongAsync(request.PlaylistId, request.SongId);
            if (!result) return BadRequest("Could not remove song");

            return Json(new { success = true });
        }

        // --------------------------
        // Create a new playlist
        // --------------------------
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreatePlaylistRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            Uri? playlistArt = null;
            if (!string.IsNullOrEmpty(request.PlaylistArtUrl))
                Uri.TryCreate(request.PlaylistArtUrl, UriKind.Absolute, out playlistArt);

            var playlist = new Playlist
            {
                PlaylistTitle = request.PlaylistTitle,
                AccountId = userId,
                SongCount = 0,
                PlaylistArt = playlistArt?.ToString()
            };

            await _playlistRepo.CreateAsync(playlist);

            return Json(new { success = true, playlistId = playlist.PlaylistId });
        }

        // --------------------------
        // Add a song to a playlist
        // --------------------------
        [HttpPost]
        [Route("AddSong/{playlistId}")]
        [Authorize]
        public async Task<IActionResult> AddSongToPlaylist(int playlistId, [FromBody] AddSongRequest request)
        {
            try
            {
                var song = new Song
                {
                    IdInYouTube = request.VideoId,
                    SongTitle = request.SongTitle,
                    Artists = request.Artists,
                    AlbumArt = request.AlbumArt,
                    SongLength = request.SongLength,
                    IsYouTube = request.IsYouTube
                };

                await _playlistRepo.AddSong(playlistId, song);

                return Json(new { success = true, message = "Song added to playlist" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // --------------------------
        // Edit playlist details
        // --------------------------
        [HttpPost]
        public async Task<IActionResult> Edit(int id, [FromBody] PlaylistDto dto)
        {
            try
            {
                await _playlistRepo.UpdatePlaylistAsync(id, dto);
                var updatedPlaylist = await _playlistRepo.ReadAsync(id);
                return Json(new { success = true, message = updatedPlaylist.PlaylistArt });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // --------------------------
        // Search playlists by title
        // --------------------------
        [HttpGet]
        [Route("Playlist/Search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            var playlists = await _playlistRepo.ReadAllAsync();
            if (!string.IsNullOrWhiteSpace(query))
                playlists = playlists
                    .Where(p => p.PlaylistTitle.Contains(query, StringComparison.OrdinalIgnoreCase))
                    .ToList();

            var dto = playlists.Select(MapToDto).ToList();
            return Ok(dto);
        }

        // --------------------------
        // Get featured playlists (random 9)
        // --------------------------
        [HttpGet]
        [Route("api/playlist/featured")]
        public async Task<IActionResult> GetFeaturedPlaylists()
        {
            try
            {
                var allPlaylists = await _playlistRepo.ReadAllAsync();
                var random = new Random();

                var featured = allPlaylists
                    .OrderBy(x => random.Next())
                    .Take(9)
                    .Select(MapToDto)
                    .ToList();

                return Ok(featured);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    // ====================================================
    // DTO / Request classes used by PlaylistController
    // ====================================================

    // Remove a song from a playlist
    public class RemoveSongRequest
    {
        public int PlaylistId { get; set; }
        public int SongId { get; set; }
    }

    // Create a new playlist request
    public class CreatePlaylistRequest
    {
        public string PlaylistTitle { get; set; }
        public string? PlaylistDescription { get; set; }
        public string? PlaylistArtUrl { get; set; }
    }

    // Add a song to a playlist request
    public class AddSongRequest
    {
        public string VideoId { get; set; }
        public string SongTitle { get; set; }
        public string Artists { get; set; }
        public string AlbumArt { get; set; }
        public double SongLength { get; set; }
        public bool IsYouTube { get; set; }
    }
}
