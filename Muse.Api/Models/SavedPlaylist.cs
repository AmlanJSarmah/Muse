using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Muse.Api.Models
{
    public class SavedPlaylist
    {
        [Key]
        public Guid Id { get; set; }
        [ForeignKey(nameof(User))]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        [ForeignKey(nameof(Playlist))]
        public Guid PlaylistId { get; set; }
        public Playlist Playlist { get; set; } = null!;
        public DateTime SavedAt{ get; set; } = DateTime.UtcNow;
    }
}
