namespace Muse.Api.Services;

public record MovieMetadata(int Year, string? PosterUrl, List<string> Genres);

public interface ITmdbService
{
    Task<MovieMetadata?> GetMovieMetadataAsync(string movieName);
}