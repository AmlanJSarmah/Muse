import axios from 'axios';

import type {
    ApiResponse,
    MovieSummary,
    Playlist,
    RecommendationResponse,
} from '../types/api';

import {
    mockPlaylist,
    mockRecommendations,
} from './mockData';

const USE_MOCK = true;

export const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});


/* =========================================================
   MOVIE SERVICE
   ========================================================= */

export const movieService = {

    searchMovies: async (
        query: string
    ): Promise<ApiResponse<MovieSummary>> => {

        if (USE_MOCK) {

            const movies: MovieSummary[] = [
                {
                    id: 'movie-uuid-999',
                    title: 'Interstellar',
                    year: 2014,
                    posterUrl:
                        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',
                },

                {
                    id: 'movie-uuid-888',
                    title: 'Oppenheimer',
                    year: 2023,
                    posterUrl:
                        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400',
                },

                {
                    id: 'movie-uuid-777',
                    title: 'Inception',
                    year: 2010,
                    posterUrl:
                        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
                },
            ];

            const filteredMovies = movies.filter((movie) =>
                movie.title
                    .toLowerCase()
                    .includes(query.toLowerCase())
            );

            return {
                data: filteredMovies,

                pagination: {
                    page: 1,
                    pageSize: filteredMovies.length,
                    totalCount: filteredMovies.length,
                    totalPages:
                        filteredMovies.length > 0 ? 1 : 0,
                },
            };
        }

        const response =
            await apiClient.get<ApiResponse<MovieSummary>>(
                '/movies/search',
                {
                    params: {
                        query,
                    },
                }
            );

        return response.data;
    },


    generatePlaylist: async (
        movieId: string
    ): Promise<Playlist> => {

        if (USE_MOCK) {
            return mockPlaylist;
        }

        const response =
            await apiClient.post<Playlist>(
                `/movies/${movieId}/generate-playlist`
            );

        return response.data;
    },
};


/* =========================================================
   PLAYLIST SERVICE
   ========================================================= */

export const playlistService = {

    getPlaylistById: async (
        id: string
    ): Promise<Playlist> => {

        if (USE_MOCK) {
            return mockPlaylist;
        }

        const response =
            await apiClient.get<Playlist>(
                `/playlists/${id}`
            );

        return response.data;
    },


    getRecommendations:
        async (): Promise<RecommendationResponse> => {

        if (USE_MOCK) {
            return mockRecommendations;
        }

        const response =
            await apiClient.get<RecommendationResponse>(
                '/recommendations'
            );

        return response.data;
    },
};