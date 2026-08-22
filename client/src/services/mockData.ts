import type { Playlist, RecommendationResponse } from '../types/api';


export const mockPlaylist: Playlist = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Interstellar Official Soundtrack",
    description: "Curated Hans Zimmer soundtrack for Interstellar (2014)",
    isPublic: true,
    source: "movie",
    creatorId: "user-uuid-101",
    movieId: "movie-uuid-999",
    songs: [
        {
            title: "Cornfield Chase",
            artist: "Hans Zimmer",
            youtubeUrl: "https://www.youtube.com/watch?v=1V_xRb0x9aw",
            youtubeVideoId: "1V_xRb0x9aw",
            durationSeconds: 126,
            thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300"
        },
        {
            title: "No Time for Caution",
            artist: "Hans Zimmer",
            youtubeUrl: "https://www.youtube.com/watch?v=m3zvVGJrJA8",
            youtubeVideoId: "m3zvVGJrJA8",
            durationSeconds: 246,
            thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300"
        }
    ],
    createdAt: "2026-08-17T10:30:00Z",
    updatedAt: "2026-08-17T10:30:00Z",
    movie: {
        id: "movie-uuid-999",
        title: "Interstellar",
        year: 2014,
        posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400"
    }
};

export const mockRecommendations: RecommendationResponse = {
    recommendations: [
        {
            type: "movie",
            id: "movie-uuid-888",
            score: 0.94,
            reason: "Because you liked atmospheric soundtracks by Hans Zimmer",
            item: {
                id: "movie-uuid-888",
                title: "Oppenheimer",
                year: 2023,
                posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400"
            }
        }
    ],
    generatedAt: "2026-08-17T10:30:00Z",
    modelVersion: "v1.0.4-ensemble"
};