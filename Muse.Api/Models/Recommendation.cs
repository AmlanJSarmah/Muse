using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Muse.Api.Models
{
    public class Recommendation
    {
        [Key]
        public Guid Id { get; set; }
        [ForeignKey(nameof(User))]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        [ForeignKey(nameof(Movie))]
        public Guid? MovieId { get; set; }
        public Movie? Movie { get; set; }
        [ForeignKey(nameof(Song))]
        public Guid? SongId { get; set; }
        public Song? Song { get; set; }

        public float Score { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
