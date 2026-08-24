namespace Muse.Api.Dtos
{
    public class MLRecommendationResponseDto
    {
        public Guid MovieId { get; set; }

        public List<MLRecommendationDto> Recommendations { get; set; }
            = new();
    }
}