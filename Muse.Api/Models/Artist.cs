using System.ComponentModel.DataAnnotations;

namespace Muse.Api.Models
{
    public class Artist
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        public ICollection<Song> Songs { get; set; } = new List<Song>();
        public ICollection<UserPreference> UserPreferences { get; set; } = new List<UserPreference>();

  
    }
}
