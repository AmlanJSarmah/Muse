using System.Data;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Muse.Api.Services;

public class SpotifyService : ISpotifyService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private string? _cachedToken;
    private DateTime _expiresAt = DateTime.MinValue;

    public SpotifyService(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    // Get the mandatory access Token
    private async Task<string> GetAccessTokenAsync(HttpClient client)
    {
        if (_cachedToken != null && DateTime.UtcNow < _expiresAt)
        {
            return _cachedToken;
        }

        var clientId = _config["Spotify:ClientId"];
        var clientSecret = _config["Spotify:ClientSecret"];
        var basicAuth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
        
        // Send Request to Spotify
        var request = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token")
        {
            Content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials")
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuth);

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        
        // Retrieve and cache
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        _cachedToken = json.GetProperty("access_token").GetString()!;
        _expiresAt = DateTime.UtcNow.AddSeconds(json.GetProperty("expires_in").GetInt32() - 60);

        return _cachedToken;
    }
    
    private static string NormalizeTitle(string title)
    {
        // Strip "(Original Motion Picture Soundtrack)", "(Music From...)", etc.
        var withoutParens = Regex.Replace(title, @"[\(\[].*?[\)\]]", "");
        // Strip punctuation, collapse whitespace, lowercase
        var alphanumericOnly = Regex.Replace(withoutParens, @"[^a-zA-Z0-9\s]", "");
        return Regex.Replace(alphanumericOnly, @"\s+", " ").Trim().ToLowerInvariant();
    }
    
    // Get the actual songs
    // find official album -> normalize titles -> songs
    public async Task<(string AlbumName, List<SongResult> Songs)?> GetSoundtrackAsync(string movieName)
    {
        // Get mandatory spotify token
        var client = _httpClientFactory.CreateClient();
        var token = await GetAccessTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        //Get albums
        var searchUrl = $"https://api.spotify.com/v1/search?q={Uri.EscapeDataString($"{movieName} soundtrack")}&type=album&limit=10";
        var searchJson = await client.GetFromJsonAsync<JsonElement>(searchUrl);
        var albums = searchJson.GetProperty("albums").GetProperty("items"); 
        
        if (albums.GetArrayLength() == 0)
            return null;
        
        var normalizedTarget = NormalizeTitle(movieName);

        JsonElement? exactMatch = null;
        foreach (var candidate in albums.EnumerateArray())
        {
            var candidateName = candidate.GetProperty("name").GetString() ?? "";
            if (NormalizeTitle(candidateName) == normalizedTarget)
            {
                exactMatch = candidate;
                break; 
            }
        }

        var album = exactMatch ?? albums[0];
        var albumId = album.GetProperty("id").GetString();
        var albumName = album.GetProperty("name").GetString()!;
        
        var tracksJson = await client.GetFromJsonAsync<JsonElement>($"https://api.spotify.com/v1/albums/{albumId}/tracks?limit=50");

        var songs = tracksJson.GetProperty("items").EnumerateArray().Select(track => new SongResult(
            track.GetProperty("name").GetString()!,
            track.GetProperty("artists")[0].GetProperty("name").GetString()!,
            track.GetProperty("external_urls").GetProperty("spotify").GetString()!
        )).ToList();

        return (albumName, songs);
    }
}