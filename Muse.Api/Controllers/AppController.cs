using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muse.Api.Services;

namespace Muse.Api.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class AppController : ControllerBase
{
   private readonly ISpotifyService _spotifyService;
   private readonly IMusicBrainzService _musicBrainzService;
   private readonly IMusicPersistenceService _persistenceService;

   public AppController(ISpotifyService spotifyService, IMusicBrainzService musicBrainzService, IMusicPersistenceService persistenceService)
   {
      _spotifyService = spotifyService;
      _musicBrainzService = musicBrainzService;
      _persistenceService = persistenceService;
   }
   
   [HttpGet]
   public ActionResult<string> Get()
   {
      return Ok("Hello World");
   }
   
   [HttpGet("songs")]
   public async Task<IActionResult> GetSongsForMovie([FromQuery] string title)
   {
      var result = await _musicBrainzService.GetSoundtrackAsync(title);
      if (result is null)
         return NotFound($"No soundtrack found for '{title}'.");

      var (albumTitle, songs) = result.Value;
      return Ok(new { movie = title, album = albumTitle, songs });
   }

   [HttpGet("songs-from-spotify")]
   public async Task<IActionResult> GetSongsFromMovies([FromQuery] string title)
   {
      var result = await _spotifyService.GetSoundtrackAsync(title);

      if (result is null) return NotFound("No soundtrack for '{title}'.");
      
      return Ok(new { movie = title, album = result.Value.AlbumName, songs = result.Value.Songs });
   }
   
   [HttpPost("songs/save")]
   public async Task<IActionResult> SaveSongsForMovie([FromQuery] string title)
   {
      var result = await _musicBrainzService.GetSoundtrackAsync(title);
      if (result is null)
         return NotFound($"No soundtrack found for '{title}'.");

      var (albumTitle, songs) = result.Value;
      var playlist = await _persistenceService.SaveSoundtrackAsync(title, albumTitle, songs);

      return Ok(new { playlistId = playlist.Id, movie = title, album = albumTitle, songCount = songs.Count });
   }
}