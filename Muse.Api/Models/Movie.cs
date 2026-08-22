using System.ComponentModel.DataAnnotations;

namespace Muse.Api.Models
{
    public class Movie
    {
        [Key]
        public Guid id { get; set; }
        [Required, MaxLength(255)]
        public string Title { get; set; }
        public int Year { get; set; }
        [MaxLength(500)]
        public string PosterUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Song> Songs { get; set; } = new List<Song>();
        public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
        public ICollection<Genre> Genres { get; set; } = new List<Genre>();
        public ICollection<Recommendation> Recommendations { get; set; } = new List<Recommendation>();


    }
}
