using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Muse.Api.Models
{
    public class Song
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        [ForeignKey(nameof(Artist))]
        public Guid ArtistId { get; set; }
        public Artist Artist { get; set; } = null!;
        [ForeignKey(nameof(Movie))]
        public Guid MovieId { get; set; }
        public Movie Movie { get; set; } = null!;
        [Required, MaxLength(500)]
        public string YoutubeUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Genre> Genres { get; set; } = new List<Genre>();
        public ICollection<PlaylistSong> PlaylistSongs { get; set; } = new List<PlaylistSong>();
        public ICollection<Recommendation> Recommendations { get; set; } = new List<Recommendation>();

    }
}
