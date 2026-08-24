namespace Muse.Api.Dtos
{
    public class MLMovieDto
    {
        public Guid MovieId { get; set; }

        public string MovieName { get; set; } = string.Empty;

        public int Year { get; set; }

        public List<string> Genres { get; set; } = new();
    }
}