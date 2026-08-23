using Muse.Api.Models;

namespace Muse.Api.Services;

public interface IMusicPersistenceService
{
    Task<Playlist> SaveSoundtrackAsync(string movieName, string albumTitle, List<SongInfo> songs);
}