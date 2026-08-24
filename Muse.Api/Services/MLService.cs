using System.Net.Http.Json;
using Muse.Api.Dtos;

namespace Muse.Api.Services
{
    public class MLService : IMLService
    {
        private readonly HttpClient _httpClient;

        public MLService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<MLRecommendationResponseDto>>
            GetRecommendationsAsync(
                MLMovieRequestDto request)
        {
            var response = await _httpClient.PostAsJsonAsync(
                "http://127.0.0.1:8000/recommend",
                request
            );

            response.EnsureSuccessStatusCode();

            var result =
                await response.Content
                    .ReadFromJsonAsync<MLResponse>();

            return result?.Recommendations
                   ?? new List<MLRecommendationResponseDto>();
        }

        private class MLResponse
        {
            public List<MLRecommendationResponseDto>
                Recommendations
            { get; set; } = new();
        }
    }
}