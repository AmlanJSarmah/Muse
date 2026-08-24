using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Muse.Api.Models
{
    public class UserPreference
    {
        [Key]
        public Guid Id { get; set; }
        [ForeignKey(nameof(User))]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        [ForeignKey(nameof(Genre))]
        public Guid? GenreId { get; set; }
        public Genre? Genre { get; set; }

        [ForeignKey(nameof(Artist))]
        public Guid? ArtistId { get; set; }
        public Artist? Artist { get; set; }

        public float Weight { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
