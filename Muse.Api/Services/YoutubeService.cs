using System.Text.Json;

namespace Muse.Api.Services;

public class YoutubeService : IYoutubeService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public YoutubeService(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    public async Task<string?> SearchVideoUrlAsync(string songTitle, string artist)
    {
        var client = _httpClientFactory.CreateClient();
        var apiKey = _config["YouTube:ApiKey"];
        var query = Uri.EscapeDataString($"{artist} {songTitle} official audio");
        var url = $"https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&maxResults=1&key={apiKey}";

        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return null; // fail soft — a missing YouTube link shouldn't block saving the rest of the soundtrack

        var body = await response.Content.ReadAsStringAsync();
        var json = JsonSerializer.Deserialize<JsonElement>(body);
        var items = json.GetProperty("items");

        if (items.GetArrayLength() == 0)
            return null;

        var videoId = items[0].GetProperty("id").GetProperty("videoId").GetString();
        return $"https://www.youtube.com/watch?v={videoId}";
    }
}