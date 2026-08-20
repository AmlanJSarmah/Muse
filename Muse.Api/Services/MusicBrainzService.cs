using System.Text.Json;

namespace Muse.Api.Services;

public class MusicBrainzService : IMusicBrainzService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public MusicBrainzService(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }
    
    public async Task<(string AlbumTitle, List<SongInfo> Songs)?> GetSoundtrackAsync(string movieName)
    {
        var client = _httpClientFactory.CreateClient();
        var contactEmail = _config["MusicBrainz:ContactEmail"] ?? "unknown@example.com"; 
        client.DefaultRequestHeaders.UserAgent.ParseAdd($"MuseApp/1.0 ({contactEmail})");

        // Search for a soundtrack release-group matching the movie title
        var releaseGroup = await FindSoundtrackReleaseGroupAsync(client, movieName);
        if (releaseGroup is null)
            return null;

        var releaseGroupId = releaseGroup.Value.GetProperty("id").GetString();
        var albumTitle = releaseGroup.Value.GetProperty("title").GetString()!;

        // Album-level genres — used as a fallback when a specific artist has none
        var albumGenres = new List<string>();
        var rgGenresJson = await GetJsonAsync(client, $"https://musicbrainz.org/ws/2/release-group/{releaseGroupId}?inc=genres&fmt=json");
        if (rgGenresJson.TryGetProperty("genres", out var rgGenres))
        {
            albumGenres = rgGenres.EnumerateArray()
                .Select(g => g.GetProperty("name").GetString() ?? "")
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .Take(3)
                .ToList();
        }

        await Task.Delay(1100);

        // Get releases under this release-group, take the first
        var rgJson = await GetJsonAsync(client, $"https://musicbrainz.org/ws/2/release-group/{releaseGroupId}?inc=releases&fmt=json");
        var releases = rgJson.GetProperty("releases");

        if (releases.GetArrayLength() == 0)
            return null;

        var releaseId = releases[0].GetProperty("id").GetString();

        await Task.Delay(1100);

        // Full tracklist with artist credits (includes each artist's MBID)
        var releaseJson = await GetJsonAsync(client, $"https://musicbrainz.org/ws/2/release/{releaseId}?inc=recordings+artist-credits&fmt=json");

        var tracks = new List<(string Title, string ArtistName, string? ArtistId)>();
        foreach (var media in releaseJson.GetProperty("media").EnumerateArray())
        {
            if (!media.TryGetProperty("tracks", out var trackList)) continue;

            foreach (var track in trackList.EnumerateArray())
            {
                var title = track.GetProperty("title").GetString() ?? "";
                var artistCredit = track.GetProperty("artist-credit")[0];
                var artistName = artistCredit.GetProperty("name").GetString() ?? "";
                var artistId = artistCredit.TryGetProperty("artist", out var artistObj)
                    ? artistObj.GetProperty("id").GetString()
                    : null;

                tracks.Add((title, artistName, artistId));
            }
        }

        // Genre per unique artist — cached so repeated artists don't re-query MusicBrainz
        var artistGenreCache = new Dictionary<string, List<string>>();
        var songs = new List<SongInfo>();

        foreach (var track in tracks)
        {
            var genres = albumGenres; // fallback default

            if (track.ArtistId != null)
            {
                if (!artistGenreCache.TryGetValue(track.ArtistId, out var cachedGenres))
                {
                    await Task.Delay(1100);
                    cachedGenres = await GetArtistGenresAsync(client, track.ArtistId);
                    artistGenreCache[track.ArtistId] = cachedGenres;
                }

                if (cachedGenres.Count > 0)
                    genres = cachedGenres;
            }

            songs.Add(new SongInfo(track.Title, track.ArtistName, genres));
        }

        return (albumTitle, songs);
    }

    private static async Task<List<string>> GetArtistGenresAsync(HttpClient client, string artistId)
    {
        var json = await GetJsonAsync(client, $"https://musicbrainz.org/ws/2/artist/{artistId}?inc=genres&fmt=json");

        if (!json.TryGetProperty("genres", out var genres))
            return new List<string>();

        return genres.EnumerateArray()
            .Select(g => g.GetProperty("name").GetString() ?? "")
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .Take(3)
            .ToList();
    }

    private static async Task<JsonElement> GetJsonAsync(HttpClient client, string url, int retriesLeft = 3)
    {
        var response = await client.GetAsync(url);

        if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable && retriesLeft > 0)
        {
            await Task.Delay(2000); // back off, then retry
            return await GetJsonAsync(client, url, retriesLeft - 1);
        }

        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"MusicBrainz request failed ({(int)response.StatusCode}): {body}");

        return JsonSerializer.Deserialize<JsonElement>(body);
    }
    
    private static async Task<JsonElement?> FindSoundtrackReleaseGroupAsync(HttpClient client, string movieName)
    {
        // Tier 1: exact-ish match with the correct secondary-type field
        var strictQuery = Uri.EscapeDataString($"\"{movieName}\" AND secondarytype:soundtrack");
        var strictJson = await GetJsonAsync(client, $"https://musicbrainz.org/ws/2/release-group/?query={strictQuery}&fmt=json&limit=5");
        var strictResults = strictJson.GetProperty("release-groups");
        if (strictResults.GetArrayLength() > 0)
            return strictResults[0];

        await Task.Delay(1100);

        // Tier 2: fall back to the community "soundtrack" tag, since not every soundtrack
        // release is formally marked with the secondary type
        var tagQuery = Uri.EscapeDataString($"\"{movieName}\" AND tag:soundtrack");
        var tagJson = await GetJsonAsync(client, $"https://musicbrainz.org/ws/2/release-group/?query={tagQuery}&fmt=json&limit=5");
        var tagResults = tagJson.GetProperty("release-groups");
        if (tagResults.GetArrayLength() > 0)
            return tagResults[0];

        return null; // genuinely nothing on MusicBrainz for this title
    }
}