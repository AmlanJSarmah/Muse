namespace Muse.Api.Dtos
{
    public class MLRecommendationDto
    {
        public Guid MovieId { get; set; }

        public float Score { get; set; }
    }
}