using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Muse.Api.Data;
using Muse.Api.Dtos;
using Muse.Api.Services;

namespace Muse.Api.Controllers
{
    [ApiController]
    [Route("api/recommendations")]
    [Authorize]
    public class RecommendationController : ControllerBase
    {
        private readonly MuseDbContext _db;
        private readonly IMLService _mlService;

        public RecommendationController(
            MuseDbContext db,
            IMLService mlService)
        {
            _db = db;
            _mlService = mlService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecommendations(
            [FromQuery] Guid movieId)
        {
            var movieExists = await _db.Movies
                .AnyAsync(m => m.id == movieId);

            if (!movieExists)
            {
                return NotFound(new
                {
                    message = "Movie not found."
                });
            }

            /*
             * Get all movies and their genres.
             */
            var movies = await _db.Movies
                .Include(m => m.Genres)
                .ToListAsync();

            var mlMovies = movies
                .Select(movie => new MLMovieDto
                {
                    MovieId = movie.id,

                    MovieName = movie.Title,

                    Year = movie.Year,

                    Genres = movie.Genres
                        .Select(g => g.Name)
                        .Where(name => !string.IsNullOrWhiteSpace(name))
                        .Distinct()
                        .ToList()
                })
                .ToList();

            /*
             * Send the entire movie catalogue to Python.
             */
            var request = new MLMovieRequestDto
            {
                Movies = mlMovies
            };

            var mlResult =
                await _mlService.GetRecommendationsAsync(request);

            /*
             * Find the recommendation list
             * for the requested movie.
             */
            var movieRecommendations =
                mlResult.FirstOrDefault(
                    x => x.MovieId == movieId
                );

            if (movieRecommendations == null)
            {
                return Ok(new
                {
                    recommendations = new List<object>()
                });
            }

            /*
             * Get the actual movie information from SQL Server.
             */
            var recommendedIds =
                movieRecommendations.Recommendations
                    .Select(x => x.MovieId)
                    .ToList();

            var recommendedMovies =
                await _db.Movies
                    .Where(m => recommendedIds.Contains(m.id))
                    .ToListAsync();

            /*
             * Combine ML score with database movie information.
             */
            var recommendations =
                movieRecommendations.Recommendations
                    .Join(
                        recommendedMovies,

                        recommendation => recommendation.MovieId,

                        movie => movie.id,

                        (recommendation, movie) => new
                        {
                            type = "movie",

                            id = movie.id,

                            score = recommendation.Score,

                            reason =
                                "Recommended based on similar movie content.",

                            item = new
                            {
                                id = movie.id,
                                title = movie.Title,
                                year = movie.Year,
                                posterUrl = movie.PosterUrl
                            }
                        })
                    .OrderByDescending(x => x.score)
                    .ToList();

            return Ok(new
            {
                recommendations,

                generatedAt = DateTime.UtcNow,

                modelVersion = "tfidf-v1"
            });
        }
    }
}