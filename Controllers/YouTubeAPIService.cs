using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Project.Services;
using Project.Models.Entities;
using Project.Models.DTOs;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace Project.Controllers
{
    // --------------------------
    // Service to interact with YouTube API
    // --------------------------
    public class YouTubeAPIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string BaseUrl = "https://www.googleapis.com/youtube/v3";

        // Constructor: inject HttpClient and read API key from configuration
        public YouTubeAPIService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            // vvvvvvvvvv PUT API KEY HERE vvvvvvvvvvv
            _apiKey = "";
            // ^^^^^^^ PUT API KEY HERE ^^^^^^^^
        }

        // --------------------------
        // Search YouTube videos by query
        // --------------------------
        public async Task<List<SongDto>> SearchVideosAsync(string query, int maxResults = 10)
        {
            var url = $"{BaseUrl}/search?part=snippet&maxResults={maxResults}&q={Uri.EscapeDataString(query)}&type=video&key={_apiKey}";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"YouTube API error: {response.StatusCode} - {error}");
            }

            var json = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var youtubeResponse = JsonSerializer.Deserialize<YouTubeSearchResponse>(json, options);

            // Map YouTube search results to SongDto
            var songs = youtubeResponse?.Items?.Select((item, index) => new SongDto
            {
                SongId = index, // Temporary ID for display
                SongTitle = item.Snippet.Title,
                SongLength = 0, // Duration not available in search API
                Artists = item.Snippet.ChannelTitle,
                AlbumArt = item.Snippet.Thumbnails?.Medium?.Url ?? item.Snippet.Thumbnails?.Default?.Url ?? string.Empty,
                IsYouTube = true,
                VideoId = item.Id.VideoId
            }).ToList() ?? new List<SongDto>();

            return songs;
        }
    }

    // --------------------------
    // DTOs for YouTube search results
    // --------------------------
    public class YouTubeSearchResponse
    {
        [JsonPropertyName("items")]
        public List<SearchItem> Items { get; set; } = new();
    }

    public class SearchItem
    {
        [JsonPropertyName("id")]
        public SearchId Id { get; set; } = new();

        [JsonPropertyName("snippet")]
        public SearchSnippet Snippet { get; set; } = new();
    }

    public class SearchId
    {
        [JsonPropertyName("videoId")]
        public string VideoId { get; set; } = string.Empty;
    }

    public class SearchSnippet
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("channelTitle")]
        public string ChannelTitle { get; set; } = string.Empty;

        [JsonPropertyName("thumbnails")]
        public Thumbnails Thumbnails { get; set; } = new();
    }

    public class Thumbnails
    {
        [JsonPropertyName("default")]
        public Thumbnail Default { get; set; } = new();

        [JsonPropertyName("medium")]
        public Thumbnail Medium { get; set; } = new();

        [JsonPropertyName("high")]
        public Thumbnail High { get; set; } = new();
    }

    public class Thumbnail
    {
        [JsonPropertyName("url")]
        public string Url { get; set; } = string.Empty;

        [JsonPropertyName("width")]
        public int Width { get; set; }

        [JsonPropertyName("height")]
        public int Height { get; set; }
    }

    // --------------------------
    // DTOs for detailed video info (optional, for later)
    // --------------------------
    public class YouTubeVideoResponse
    {
        [JsonPropertyName("items")]
        public List<VideoItem> Items { get; set; } = new();
    }

    public class VideoItem
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("snippet")]
        public VideoSnippet Snippet { get; set; } = new();

        [JsonPropertyName("contentDetails")]
        public ContentDetails ContentDetails { get; set; } = new();
    }

    public class VideoSnippet
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("channelTitle")]
        public string ChannelTitle { get; set; } = string.Empty;
    }

    public class ContentDetails
    {
        [JsonPropertyName("duration")]
        public string Duration { get; set; } = string.Empty;
    }
}
