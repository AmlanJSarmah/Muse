using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Muse.Api.Models
{
    public class Playlist
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(150)]
        public string Name { get; set; }
        [MaxLength(1000)]
        public string? description { get; set; }
        public Boolean isPublic { get; set; }
        [Required, MaxLength(30)]
        public string source { get; set; } = "user"; // either user or system
        [ForeignKey(nameof(Creator))]
        public Guid? CreatorId { get; set; }
        public User? Creator { get; set; }
        [ForeignKey(nameof(Movie))]
        public Guid MovieId { get; set; }
        public Movie Movie { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ICollection<PlaylistSong> PlaylistSongs { get; set; } = new List<PlaylistSong>();
        public ICollection<SavedPlaylist> SavedPlaylists { get; set; } = new List<SavedPlaylist>();

    }
}
