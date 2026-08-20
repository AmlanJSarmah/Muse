# MUSE : Movies Songs Understanding, Search and Extraction
MUSE is a tool created to extract music from your favorite movie, collect the YouTube links and group them in a playlist for convenience.
Additionally, we provide personalized recommendations by looking at the music and movies you are interested in.

## Setup Instruction - Server
### Setting up Database
1. Make sure `dotnet ef` is installed
```shell
dotnet tool install --global dotnet-ef
```
2. To update the database
```shell
dotnet ef database update
```

### Database URL String 
Make sure you run the following commands
```shell
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=MuseDb;User Id=sa;Password=<yout_password_here>;TrustServerCertificate=True;"
```
**Note** : Make sure to change the username and password in the above connection string. 

### Spotify and MusicBrainz API Settings
Make sure to run the following commands
```shell
dotnet user-secrets set "Spotify:ClientId" "your-client-id"
dotnet user-secrets set "Spotify:ClientSecret" "your-client-secret"
dotnet user-secrets set "MusicBrainz:ContactEmail" "your-real-email@example.com"
```
**Note** : Replace the spotify client id, secret and email with original values