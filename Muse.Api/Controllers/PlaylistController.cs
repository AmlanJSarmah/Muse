using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Muse.Api.Data;
using Muse.Api.Dtos;
using Muse.Api.Models;
using Muse.Api.Services;

namespace Muse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlaylistsController : ControllerBase
{
    private readonly MuseDbContext _db;
    private readonly ITmdbService _tmdbService;

    public PlaylistsController(MuseDbContext db, ITmdbService tmdbService)
    {
        _db = db;
        _tmdbService = tmdbService;
    }

    // show existing public playlists for a movie
    [HttpGet("search")]
    public async Task<IActionResult> SearchByMovie([FromQuery, Required] string movieTitle)
    {
        var playlists = await _db.Playlists
            .Include(p => p.Movie)
            .Include(p => p.Creator)
            .Include(p => p.PlaylistSongs)
            .Where(p => p.Movie.Title == movieTitle && p.isPublic)
            .Select(p => new PlaylistSummaryDto(
                p.Id,
                p.Name,
                p.Creator != null ? p.Creator.Username : "System",
                p.source,
                p.PlaylistSongs.Count,
                p.CreatedAt))
            .ToListAsync();

        return Ok(new { movie = movieTitle, playlists });
        // If this list is empty, your frontend shows just the "Generate" button.
    }

    // full contents when a user clicks into a playlist
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPlaylist(Guid id)
    {
        var playlist = await _db.Playlists
            .Include(p => p.Movie)
            .Include(p => p.PlaylistSongs)
                .ThenInclude(ps => ps.Song)
                    .ThenInclude(s => s.Artist)
            .Include(p => p.PlaylistSongs)
                .ThenInclude(ps => ps.Song)
                    .ThenInclude(s => s.Genres)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (playlist is null)
            return NotFound("Playlist not found.");

        // Private playlists are only visible to their creator
        if (!playlist.isPublic && playlist.CreatorId != GetCurrentUserId())
            return Forbid();

        var songs = playlist.PlaylistSongs
            .OrderBy(ps => ps.Position)
            .Select(ps => new SongDetailDto(
                ps.Song.Title,
                ps.Song.Artist.Name,
                ps.Song.Genres.Select(g => g.Name).ToList(),
                ps.Song.YoutubeUrl))
            .ToList();

        return Ok(new PlaylistDetailDto(
            playlist.Id, playlist.Name, playlist.description,
            playlist.isPublic, playlist.Movie.Title, songs));
    }

    // bookmark an existing playlist to the current user's account
    [HttpPost("{id:guid}/save")]
    public async Task<IActionResult> SavePlaylist(Guid id)
    {
        var userId = GetCurrentUserId();

        if (!await _db.Playlists.AnyAsync(p => p.Id == id))
            return NotFound("Playlist not found.");

        var alreadySaved = await _db.SavedPlaylists
            .AnyAsync(sp => sp.UserId == userId && sp.PlaylistId == id);
        if (alreadySaved)
            return Conflict("You've already saved this playlist.");

        _db.SavedPlaylists.Add(new SavedPlaylist
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PlaylistId = id,
            SavedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        return Ok(new { message = "Playlist saved." });
    }

    // Toggle a generated playlist's visibility — creator only
    [HttpPatch("{id:guid}/visibility")]
    public async Task<IActionResult> SetVisibility(Guid id, SetVisibilityRequest request)
    {
        var playlist = await _db.Playlists.FirstOrDefaultAsync(p => p.Id == id);
        if (playlist is null)
            return NotFound("Playlist not found.");

        if (playlist.CreatorId != GetCurrentUserId())
            return Forbid(); // only whoever generated it can change its visibility

        playlist.isPublic = request.IsPublic;
        playlist.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { playlistId = playlist.Id, isPublic = playlist.isPublic });
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyPlaylists()
    {
        var userId = GetCurrentUserId();

        var created = await _db.Playlists
            .Include(p => p.Movie)
            .Include(p => p.Creator)
            .Include(p => p.PlaylistSongs)
            .Where(p => p.CreatorId == userId)
            .Select(p => new PlaylistSummaryDto(
                p.Id, p.Name, p.Creator!.Username, p.source, p.PlaylistSongs.Count, p.CreatedAt))
            .ToListAsync();

        var saved = await _db.SavedPlaylists
            .Include(sp => sp.Playlist)
            .ThenInclude(p => p.Movie)
            .Include(sp => sp.Playlist)
            .ThenInclude(p => p.Creator)
            .Include(sp => sp.Playlist)
            .ThenInclude(p => p.PlaylistSongs)
            .Where(sp => sp.UserId == userId)
            .Select(sp => new PlaylistSummaryDto(
                sp.Playlist.Id, sp.Playlist.Name,
                sp.Playlist.Creator != null ? sp.Playlist.Creator.Username : "System",
                sp.Playlist.source, sp.Playlist.PlaylistSongs.Count, sp.SavedAt))
            .ToListAsync();

        return Ok(new MyPlaylistsResponse(created, saved));
    }
    
    [HttpDelete("{id:guid}/save")]
    public async Task<IActionResult> UnsavePlaylist(Guid id)
    {
        var userId = GetCurrentUserId();

        var savedEntry = await _db.SavedPlaylists
            .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.PlaylistId == id);

        if (savedEntry is null)
            return NotFound("This playlist isn't in your saved list.");

        _db.SavedPlaylists.Remove(savedEntry);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Playlist removed from your saved list." });
    }

    // Delete a playlist — creator only
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePlaylist(Guid id)
    {
        var userId = GetCurrentUserId();

        var playlist = await _db.Playlists
            .Include(p => p.SavedPlaylists)
            .Include(p => p.PlaylistSongs)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (playlist is null)
            return NotFound("Playlist not found.");

        if (playlist.CreatorId != userId)
            return Forbid();

        _db.SavedPlaylists.RemoveRange(playlist.SavedPlaylists);
        _db.PlaylistSongs.RemoveRange(playlist.PlaylistSongs);
        _db.Playlists.Remove(playlist);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Playlist deleted successfully." });
    }
    
    [HttpGet("mine/movie-info")]
    public async Task<IActionResult> GetMyPlaylistMovieInfo()
    {
        var userId = GetCurrentUserId();

        var createdMovies = await _db.Playlists
            .Include(p => p.Movie).ThenInclude(m => m.Genres)
            .Where(p => p.CreatorId == userId)
            .Select(p => p.Movie)
            .Distinct()
            .ToListAsync();

        var savedMovies = await _db.SavedPlaylists
            .Include(sp => sp.Playlist).ThenInclude(p => p.Movie).ThenInclude(m => m.Genres)
            .Where(sp => sp.UserId == userId)
            .Select(sp => sp.Playlist.Movie)
            .Distinct()
            .ToListAsync();

        var created = new List<RecommendationMovieInfoDto>();
        foreach (var movie in createdMovies)
        {
            var cast = await _tmdbService.GetTopCastAsync(movie.Title);
            created.Add(new RecommendationMovieInfoDto(
                movie.id, movie.Title, movie.Year, movie.Genres.Select(g => g.Name).ToList(), cast));
        }

        var saved = new List<RecommendationMovieInfoDto>();
        foreach (var movie in savedMovies)
        {
            var cast = await _tmdbService.GetTopCastAsync(movie.Title);
            saved.Add(new RecommendationMovieInfoDto(
                movie.id, movie.Title, movie.Year, movie.Genres.Select(g => g.Name).ToList(), cast));
        }

        return Ok(new MyRecommendationInfoResponse(created, saved));
    }
}