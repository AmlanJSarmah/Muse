using Muse.Api.Dtos;

namespace Muse.Api.Services
{
    public interface IMLService
    {
        Task<List<MLRecommendationResponseDto>>
            GetRecommendationsAsync(
                MLMovieRequestDto request);
    }
}