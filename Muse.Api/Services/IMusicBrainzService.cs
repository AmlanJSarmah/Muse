namespace Muse.Api.Services;

public record SongInfo(string Title, string Artist, List<string> Genres);

public interface IMusicBrainzService
{
    Task<(string AlbumTitle, List<SongInfo> Songs)?> GetSoundtrackAsync(string movieName);
}
