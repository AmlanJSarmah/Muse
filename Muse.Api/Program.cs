// IMPORTANT : Microsoft.OpenApi has been downgraded to Version 2.3.5 due to versioning errors
// https://github.com/dotnet/aspnetcore/issues/64317

using Microsoft.EntityFrameworkCore;
using Muse.Api.Data;
using Muse.Api.Services;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

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
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IMusicPersistenceService, MusicPersistenceService>();
            builder.Services.AddSingleton<IYoutubeService, YoutubeService>();
            builder.Services.AddHttpClient<IMLService, MLService>();
            builder.Services.AddSingleton<ITmdbService, TmdbService>();

            // DB
            builder.Services.AddDbContext<MuseDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddControllers();

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            // builder.Services.AddOpenApi();

            // CORS
            const string FrontendCorsPolicy = "FrontendCorsPolicy";

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(FrontendCorsPolicy, policy =>
                {
                    policy.WithOrigins(
                            "http://localhost:3000",
                            "http://localhost:5173"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            // JWT
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(
                                builder.Configuration["Jwt:Key"]!))
                    };
                });

            builder.Services.AddAuthorization();

            var app = builder.Build();

            // Global Error Handling
            app.UseMiddleware<Muse.Api.Exceptions.ExceptionHandlingMiddleware>();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
            }

            app.UseCors(FrontendCorsPolicy);

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}