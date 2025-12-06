using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Project.Services;
using Project.Models.Entities;
using System.Text.Json;
using Project.Controllers;

namespace Project.Controllers
{
    // --------------------------
    // API controller to handle YouTube searches
    // --------------------------
    [ApiController]
    [Route("api/[controller]")]
    public class YouTubeController : ControllerBase
    {
        private readonly YouTubeAPIService _youtubeAPIService;
        private readonly ILogger<YouTubeController> _logger;

        // Constructor: inject YouTube service and logger
        public YouTubeController(YouTubeAPIService youtubeAPIService, ILogger<YouTubeController> logger)
        {
            _youtubeAPIService = youtubeAPIService;
            _logger = logger;
        }

        // --------------------------
        // GET: api/YouTube/search
        // Searches YouTube for videos based on a query
        // --------------------------
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] int maxResults = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                    return BadRequest(new { error = "Query parameter is required" });

                var songs = await _youtubeAPIService.SearchVideosAsync(query, maxResults);
                return Ok(songs);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "YouTube API request failed");
                return StatusCode(500, new { error = "Failed to search YouTube", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during YouTube search");
                return StatusCode(500, new { error = "An unexpected error occurred" });
            }
        }
    }
}
