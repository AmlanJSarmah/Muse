namespace Muse.Api.Dtos;

public record PlaylistSummaryDto(Guid Id, string Name, string CreatorUsername, string Source, int SongCount, DateTime CreatedAt);
public record SongDetailDto(string Title, string Artist, List<string> Genres, string? YoutubeUrl);
public record PlaylistDetailDto(Guid Id, string Name, string? Description, bool IsPublic, string MovieTitle, List<SongDetailDto> Songs);
public record SetVisibilityRequest(bool IsPublic);
public record MyPlaylistsResponse(List<PlaylistSummaryDto> Created, List<PlaylistSummaryDto> Saved);
public record MovieGenreInfoDto(string MovieTitle, List<string> Genres);
public record MyMovieGenreInfoResponse(List<MovieGenreInfoDto> Created, List<MovieGenreInfoDto> Saved);