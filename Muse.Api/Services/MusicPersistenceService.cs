using Microsoft.EntityFrameworkCore;
using Muse.Api.Data;
using Muse.Api.Models;

namespace Muse.Api.Services;

public class MusicPersistenceService : IMusicPersistenceService
{
   private readonly MuseDbContext _db;
   private readonly IYoutubeService _youtubeService;

   public MusicPersistenceService(MuseDbContext db, IYoutubeService youtubeService)
   {
      _db = db;
      _youtubeService = youtubeService;
   }
   
   public async Task<Playlist> SaveSoundtrackAsync(string movieName, string albumTitle, List<SongInfo> songs)
   {
      var movie = await FindOrCreateMovieAsync(movieName);

      var playlist = new Playlist
      {
         Id = Guid.NewGuid(),
         Name = albumTitle,
         description = $"Auto-generated soundtrack for {movieName}",
         isPublic = true,
         source = "system",
         CreatorId = null, // requires the nullable fix above
         MovieId = movie.id,
         CreatedAt = DateTime.UtcNow,
         UpdatedAt = DateTime.UtcNow
      };
      _db.Playlists.Add(playlist);
      await _db.SaveChangesAsync();

      var position = 0;
      foreach (var songInfo in songs)
      {
         var artist = await FindOrCreateArtistAsync(songInfo.Artist);
         var song = await FindOrCreateSongAsync(songInfo.Title, artist, movie);

         foreach (var genreName in songInfo.Genres)
         {
            var genre = await FindOrCreateGenreAsync(genreName);
            if (!song.Genres.Any(g => g.Id == genre.Id))
               song.Genres.Add(genre);
         }

         if (string.IsNullOrEmpty(song.YoutubeUrl))
            song.YoutubeUrl = await _youtubeService.SearchVideoUrlAsync(song.Title, artist.Name);

         _db.PlaylistSongs.Add(new PlaylistSong
         {
            id = Guid.NewGuid(),
            PlaylistId = playlist.Id,
            SongId = song.Id,
            Position = position++
         });

         await _db.SaveChangesAsync();
      }

      return playlist;
   }

   private async Task<Movie> FindOrCreateMovieAsync(string title)
   {
      var existing = await _db.Movies.FirstOrDefaultAsync(m => m.Title == title);
      if (existing != null) return existing;

      var movie = new Movie { id = Guid.NewGuid(), Title = title, Year = 0, PosterUrl = "", CreatedAt = DateTime.UtcNow };
      _db.Movies.Add(movie);
      await _db.SaveChangesAsync();
      return movie;
   }
   
   private async Task<Artist> FindOrCreateArtistAsync(string name)
   {
      var existing = await _db.Artists.FirstOrDefaultAsync(a => a.Name == name);
      if (existing != null) return existing;

      var artist = new Artist { Id = Guid.NewGuid(), Name = name };
      _db.Artists.Add(artist);
      await _db.SaveChangesAsync();
      return artist;
   }
   
   
   private async Task<Genre> FindOrCreateGenreAsync(string name)
   {
      var existing = await _db.Genres.FirstOrDefaultAsync(g => g.Name == name);
      if (existing != null) return existing;

      var genre = new Genre { Id = Guid.NewGuid(), Name = name };
      _db.Genres.Add(genre);
      await _db.SaveChangesAsync();
      return genre;
   }
   
   private async Task<Song> FindOrCreateSongAsync(string title, Artist artist, Movie movie)
   {
      var existing = await _db.Songs
         .Include(s => s.Genres)
         .FirstOrDefaultAsync(s => s.Title == title && s.ArtistId == artist.Id && s.MovieId == movie.id);
      if (existing != null) return existing;

      var song = new Song
      {
         Id = Guid.NewGuid(),
         Title = title,
         ArtistId = artist.Id,
         Artist = artist,
         MovieId = movie.id,
         Movie = movie,
         YoutubeUrl = null,
         CreatedAt = DateTime.UtcNow
      };
      _db.Songs.Add(song);
      await _db.SaveChangesAsync();
      return song;
   }
}