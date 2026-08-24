using System.ComponentModel.DataAnnotations;

namespace Muse.Api.Models
{
    public class Genre
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<Movie> Movies { get; set; } = new List<Movie>();
        public ICollection<Song> Songs { get; set; } = new List<Song>();
        public ICollection<UserPreference> UserPreferences { get; set; } = new List<UserPreference>();


    }
}
