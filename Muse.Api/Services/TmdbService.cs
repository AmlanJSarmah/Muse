using System.Text.Json;

namespace Muse.Api.Services;

public class TmdbService : ITmdbService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public TmdbService(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    public async Task<MovieMetadata?> GetMovieMetadataAsync(string movieName)
    {
        var client = _httpClientFactory.CreateClient();
        var apiKey = _config["Tmdb:ApiKey"];

        // 1. Search for the movie to get its TMDb id
        var searchUrl = $"https://api.themoviedb.org/3/search/movie?api_key={apiKey}&query={Uri.EscapeDataString(movieName)}";
        var searchResponse = await client.GetAsync(searchUrl);
        if (!searchResponse.IsSuccessStatusCode)
            return null; // fail soft — missing year/genre shouldn't block saving the soundtrack

        var searchJson = JsonSerializer.Deserialize<JsonElement>(await searchResponse.Content.ReadAsStringAsync());
        var results = searchJson.GetProperty("results");

        if (results.GetArrayLength() == 0)
            return null;

        var movieId = results[0].GetProperty("id").GetInt32();

        // 2. Fetch full details — genres only come back as {id, name} pairs from this endpoint, not search
        var detailsUrl = $"https://api.themoviedb.org/3/movie/{movieId}?api_key={apiKey}";
        var detailsResponse = await client.GetAsync(detailsUrl);
        if (!detailsResponse.IsSuccessStatusCode)
            return null;

        var detailsJson = JsonSerializer.Deserialize<JsonElement>(await detailsResponse.Content.ReadAsStringAsync());

        var releaseDate = detailsJson.GetProperty("release_date").GetString();
        var year = !string.IsNullOrEmpty(releaseDate) && releaseDate.Length >= 4
            ? int.Parse(releaseDate[..4])
            : 0;

        string? posterUrl = null;
        if (detailsJson.TryGetProperty("poster_path", out var posterPath) && posterPath.ValueKind == JsonValueKind.String)
            posterUrl = $"https://image.tmdb.org/t/p/w500{posterPath.GetString()}";

        var genres = detailsJson.GetProperty("genres")
            .EnumerateArray()
            .Select(g => g.GetProperty("name").GetString() ?? "")
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .ToList();

        return new MovieMetadata(year, posterUrl, genres);
    }
    
    
    public async Task<List<string>> GetTopCastAsync(string movieTitle)
    {
        var client = _httpClientFactory.CreateClient();
        var apiKey = _config["Tmdb:ApiKey"];

        var searchUrl = $"https://api.themoviedb.org/3/search/movie?api_key={apiKey}&query={Uri.EscapeDataString(movieTitle)}";
        var searchResponse = await client.GetAsync(searchUrl);
        if (!searchResponse.IsSuccessStatusCode)
            return new List<string>(); // fail soft — missing cast shouldn't break the whole response

        var searchJson = JsonSerializer.Deserialize<JsonElement>(await searchResponse.Content.ReadAsStringAsync());
        var results = searchJson.GetProperty("results");
        if (results.GetArrayLength() == 0)
            return new List<string>();

        var movieId = results[0].GetProperty("id").GetInt32();

        var creditsUrl = $"https://api.themoviedb.org/3/movie/{movieId}/credits?api_key={apiKey}";
        var creditsResponse = await client.GetAsync(creditsUrl);
        if (!creditsResponse.IsSuccessStatusCode)
            return new List<string>();

        var creditsJson = JsonSerializer.Deserialize<JsonElement>(await creditsResponse.Content.ReadAsStringAsync());
        var cast = creditsJson.GetProperty("cast");

        return cast.EnumerateArray()
            .Take(5) // top-billed cast only, ordered by TMDb's own "order" field
            .Select(actor => actor.GetProperty("name").GetString() ?? "")
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .ToList();
    }
}