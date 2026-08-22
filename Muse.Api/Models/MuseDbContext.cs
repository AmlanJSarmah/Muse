using Microsoft.EntityFrameworkCore;
namespace Muse.Api.Models
{
    public class MuseDbContext : DbContext
    {
        public MuseDbContext(DbContextOptions<MuseDbContext> options) : base(options)
        {
            
        }

        public DbSet<User> Users { get; set; }
    }
}
