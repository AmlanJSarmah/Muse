import type { Playlist, RecommendationResponse } from '../types/api';

export const mockPlaylists: Record<string, Playlist> = {
    'movie-vadakkan-selfie': {
        id: "playlist-vadakkan-selfie",
        name: "Oru Vadakkan Selfie Official Soundtrack",
        description: "Hit Malayalam soundtrack featuring Nivin Pauly & Vineeth Sreenivasan (2015)",
        isPublic: true,
        source: "movie",
        creatorId: "user-uuid-101",
        movieId: "movie-vadakkan-selfie",
        songs: [
            {
                title: "Neelambalin",
                artist: "Vineeth Sreenivasan",
                youtubeUrl: "https://youtu.be/vDGlGVtTsCg",
                youtubeVideoId: "vDGlGVtTsCg",
                durationSeconds: 195,
                thumbnailUrl: "https://i.ytimg.com/vi/vDGlGVtTsCg/hqdefault.jpg"
            },
            {
                title: "Enne Thallendammava",
                artist: "Vineeth Sreenivasan & Shaan Rahman",
                youtubeUrl: "https://www.youtube.com/watch?v=kYJqD2t0Pio",
                youtubeVideoId: "kYJqD2t0Pio",
                durationSeconds: 240,
                thumbnailUrl: "https://i.ytimg.com/vi/vDGlGVtTsCg/hqdefault.jpg"
            }
        ],
        createdAt: "2026-08-17T10:30:00Z",
        updatedAt: "2026-08-17T10:30:00Z",
        movie: {
            id: "movie-vadakkan-selfie",
            title: "Oru Vadakkan Selfie",
            year: 2015,
            posterUrl: "https://i.ytimg.com/vi/vDGlGVtTsCg/maxresdefault.jpg"
        }
    },
    'movie-thattathin-marayathu': {
        id: "playlist-thattathin-marayathu",
        name: "Thattathin Marayathu Official Soundtrack",
        description: "Blockbuster romantic musical score by Shaan Rahman directed by Vineeth Sreenivasan (2012)",
        isPublic: true,
        source: "movie",
        creatorId: "user-uuid-101",
        movieId: "movie-thattathin-marayathu",
        songs: [
            {
                title: "Anuraghathin Velayil",
                artist: "Vineeth Sreenivasan",
                youtubeUrl: "https://youtu.be/X48wPny1hTw",
                youtubeVideoId: "X48wPny1hTw",
                durationSeconds: 264,
                thumbnailUrl: "https://i.ytimg.com/vi/X48wPny1hTw/hqdefault.jpg"
            },
            {
                title: "Muthuchippi Poloru",
                artist: "Sachin Warrier & Remya Nambeesan",
                youtubeUrl: "https://www.youtube.com/watch?v=F3xK0m2zYQI",
                youtubeVideoId: "F3xK0m2zYQI",
                durationSeconds: 230,
                thumbnailUrl: "https://i.ytimg.com/vi/X48wPny1hTw/hqdefault.jpg"
            }
        ],
        createdAt: "2026-08-17T10:30:00Z",
        updatedAt: "2026-08-17T10:30:00Z",
        movie: {
            id: "movie-thattathin-marayathu",
            title: "Thattathin Marayathu",
            year: 2012,
            posterUrl: "https://i.ytimg.com/vi/X48wPny1hTw/maxresdefault.jpg"
        }
    }
};

export const mockPlaylist = mockPlaylists['movie-vadakkan-selfie'];

// Cross-recommendation logic helper
// Return recommendations strictly when a movie has been saved/searched
export const getDynamicRecommendations = (lastMovieId?: string): RecommendationResponse => {
    if (!lastMovieId) {
        return {
            recommendations: [],
            generatedAt: "2026-08-17T10:30:00Z",
            modelVersion: "v1.2-malayalam-recs"
        };
    }

    if (lastMovieId === 'movie-vadakkan-selfie') {
        return {
            recommendations: [
                {
                    type: "movie",
                    id: "movie-thattathin-marayathu",
                    score: 0.98,
                    reason: "Because you liked Nivin Pauly & Vineeth Sreenivasan Malayalam soundtracks",
                    item: mockPlaylists['movie-thattathin-marayathu'].movie!
                }
            ],
            generatedAt: "2026-08-17T10:30:00Z",
            modelVersion: "v1.2-malayalam-recs"
        };
    }

    if (lastMovieId === 'movie-thattathin-marayathu') {
        return {
            recommendations: [
                {
                    type: "movie",
                    id: "movie-vadakkan-selfie",
                    score: 0.96,
                    reason: "Because you liked romantic melodies composed by Shaan Rahman",
                    item: mockPlaylists['movie-vadakkan-selfie'].movie!
                }
            ],
            generatedAt: "2026-08-17T10:30:00Z",
            modelVersion: "v1.2-malayalam-recs"
        };
    }

    return {
        recommendations: [],
        generatedAt: "2026-08-17T10:30:00Z",
        modelVersion: "v1.2-malayalam-recs"
    };
};

export const mockRecommendations: RecommendationResponse = getDynamicRecommendations();