using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Muse.Api.Models
{
    public class PlaylistSong
    {
        [Key]
        public Guid id { get; set; }
        [ForeignKey(nameof(Playlist))]
        public Guid PlaylistId { get; set; }
        public Playlist Playlist { get; set; } = null!;
        [ForeignKey(nameof(Song))]
        public Guid SongId { get; set; }
        public Song Song { get; set; } = null!;
        public int Position { get; set; }

    }
}
