using Muse.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography.X509Certificates;
namespace Muse.Api.Data

{
    public class MuseDbContext : DbContext
    {
        public MuseDbContext(DbContextOptions<MuseDbContext> options) : base(options)
        {
            
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Movie> Movies => Set<Movie>();
        public DbSet<Genre> Genres => Set<Genre>();
        public DbSet<Artist> Artists => Set<Artist>();
        public DbSet<Song> Songs => Set<Song>();
        public DbSet<Playlist> Playlists => Set<Playlist>();
        public DbSet<PlaylistSong> PlaylistSongs => Set<PlaylistSong>();
        public DbSet<SavedPlaylist> SavedPlaylists => Set<SavedPlaylist>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Genre>().HasIndex(g => g.Name).IsUnique();

            modelBuilder.Entity<Movie>()
                .HasMany(m => m.Genres)
                .WithMany(g => g.Movies)
                .UsingEntity(j => j.ToTable("MovieGenre"));

            modelBuilder.Entity<Song>()
                .HasMany(s => s.Genres)
                .WithMany(g => g.Songs)
                .UsingEntity(j => j.ToTable("SongGenre"));

            modelBuilder.Entity<Song>()
                .HasOne(s => s.Artist)
                .WithMany(a => a.Songs)
                .HasForeignKey(s => s.ArtistId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Song>()
                .HasOne(s => s.Movie)
                .WithMany(m => m.Songs)
                .HasForeignKey(s => s.MovieId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Playlist>()
                .HasOne(p => p.Creator)
                .WithMany(u => u.Playlists)
                .HasForeignKey(p => p.CreatorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Playlist>()
                .HasOne(p => p.Movie)
                .WithMany(m => m.Playlists)
                .HasForeignKey(p => p.MovieId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PlaylistSong>()
                .HasOne(ps => ps.Playlist)
                .WithMany(p => p.PlaylistSongs)
                .HasForeignKey(ps => ps.PlaylistId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlaylistSong>()
                .HasOne(ps => ps.Song)
                .WithMany(s => s.PlaylistSongs)
                .HasForeignKey(ps => ps.SongId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedPlaylist>()
                .HasOne(sp => sp.User)
                .WithMany(u => u.SavedPlaylists)
                .HasForeignKey(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Restrict);   // was Cascade

            modelBuilder.Entity<SavedPlaylist>()
                .HasOne(sp => sp.Playlist)
                .WithMany(p => p.SavedPlaylists)
                .HasForeignKey(sp => sp.PlaylistId)
                .OnDelete(DeleteBehavior.Cascade);   // unchanged
        }
    }
}
