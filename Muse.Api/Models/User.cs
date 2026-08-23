using System.ComponentModel.DataAnnotations;

namespace Muse.Api.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(50)]
        public string Username { get; set; }
        [Required, MaxLength(255)]
        public string Email { get; set; }
        [Required]
        public string PasswordHash { get; set; }
        [Required]
        public string Role { get; set; } = "generalPublic";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
        public ICollection<SavedPlaylist> SavedPlaylists { get; set; } = new List<SavedPlaylist>();
        public ICollection<UserPreference> Preferences { get; set; } = new List<UserPreference>();
        public ICollection<Recommendation> Recommendations { get; set; } = new List<Recommendation>();


    }
}
