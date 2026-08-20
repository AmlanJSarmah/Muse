namespace Muse.Api.Services;

public record SongResult(string Title, string Artist, string Url);

public interface ISpotifyService
{
    Task<(string AlbumName, List<SongResult> Songs)?> GetSoundtrackAsync(string movieName);
}