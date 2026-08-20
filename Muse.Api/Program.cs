// IMPORTANT : Microsoft.OpenApi has been downgraded to Version 2.3.5 due to versioning errors
// https://github.com/dotnet/aspnetcore/issues/64317

using Muse.Api.Services;

namespace Muse.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddHttpClient();
            builder.Services.AddSingleton<IMusicBrainzService, MusicBrainzService>(); 
            builder.Services.AddSingleton<ISpotifyService, SpotifyService>();

            builder.Services.AddControllers();
            builder.Services.AddDbContext<MuseDbContext>(
                options => options.UseSqlServer(builder.Configuration.GetConnectionString("MuseConnection")));

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
            }

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
