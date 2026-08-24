namespace Muse.Api.Services;

public interface IYoutubeService
{
    Task<string?> SearchVideoUrlAsync(string songTitle, string artist);
}