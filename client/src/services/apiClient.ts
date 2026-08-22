import axios from 'axios';
import type { ApiResponse, MovieSummary, Playlist, RecommendationResponse } from '../types/api';
import { mockPlaylists, mockPlaylist, getDynamicRecommendations } from './mockData';

const USE_MOCK = true;
const SAVED_STORAGE_KEY = 'user_saved_playlists';

export const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const authService = {
    login: async (credentials: { email: string; passwordHash: string }) => {
        if (USE_MOCK) return { token: 'mock-jwt-token-xyz', userId: 'user-uuid-101' };
        const res = await apiClient.post('/users/login', credentials);
        return res.data;
    },
    register: async (data: { email: string; passwordHash: string; username: string }) => {
        if (USE_MOCK) return { token: 'mock-jwt-token-xyz', userId: 'user-uuid-101' };
        const res = await apiClient.post('/users/register', data);
        return res.data;
    }
};

export const movieService = {
    searchMovies: async (query: string): Promise<ApiResponse<MovieSummary>> => {
        if (USE_MOCK) {
            const movies: MovieSummary[] = [
                {
                    id: 'movie-vadakkan-selfie',
                    title: 'Oru Vadakkan Selfie',
                    year: 2015,
                    posterUrl: 'https://i.ytimg.com/vi/vDGlGVtTsCg/maxresdefault.jpg',
                },
                {
                    id: 'movie-thattathin-marayathu',
                    title: 'Thattathin Marayathu',
                    year: 2012,
                    posterUrl: 'https://i.ytimg.com/vi/X48wPny1hTw/maxresdefault.jpg',
                }
            ];
            const filtered = movies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()));
            return { data: filtered, pagination: { page: 1, pageSize: filtered.length, totalCount: filtered.length, totalPages: filtered.length > 0 ? 1 : 0 } };
        }
        const res = await apiClient.get<ApiResponse<MovieSummary>>('/movies/search', { params: { query } });
        return res.data;
    },

    generatePlaylist: async (movieId: string): Promise<Playlist> => {
        const playlist = mockPlaylists[movieId] || mockPlaylist;
        localStorage.setItem('last_searched_movie', movieId);

        const stored: Playlist[] = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
        if (!stored.some((p: Playlist) => p.id === playlist.id)) {
            stored.unshift(playlist);
            localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(stored));
        }

        if (USE_MOCK) return playlist;
        const res = await apiClient.post<Playlist>(`/movies/${movieId}/generate-playlist`);
        return res.data;
    },
};

export const playlistService = {
    getPlaylistById: async (id: string): Promise<Playlist> => {
        if (USE_MOCK) {
            const stored: Playlist[] = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
            const inStored = stored.find(p => p.id === id || p.movieId === id);
            if (inStored) return inStored;
            const found = Object.values(mockPlaylists).find(p => p.id === id || p.movieId === id);
            return found || mockPlaylist;
        }
        const res = await apiClient.get<Playlist>(`/playlists/${id}`);
        return res.data;
    },

    getUserPlaylists: async (): Promise<Playlist[]> => {
        if (USE_MOCK) {
            const stored = localStorage.getItem(SAVED_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        }
        const res = await apiClient.get<ApiResponse<Playlist>>('/playlists/me');
        return res.data.data;
    },

    savePlaylist: async (playlist: Partial<Playlist>): Promise<Playlist> => {
        const fullPlaylist = { ...mockPlaylist, ...playlist } as Playlist;
        const stored: Playlist[] = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
        const existingIndex = stored.findIndex(p => p.id === fullPlaylist.id);

        if (existingIndex >= 0) {
            stored[existingIndex] = fullPlaylist;
        } else {
            stored.unshift(fullPlaylist);
        }
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(stored));

        if (USE_MOCK) return fullPlaylist;
        const res = await apiClient.post<Playlist>('/playlists', playlist);
        return res.data;
    },

    removePlaylist: async (id: string): Promise<void> => {
        const stored: Playlist[] = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
        const filtered = stored.filter(p => p.id !== id);
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(filtered));

        if (filtered.length === 0) {
            localStorage.removeItem('last_searched_movie');
        } else if (filtered[0].movieId) {
            localStorage.setItem('last_searched_movie', filtered[0].movieId);
        }

        if (!USE_MOCK) {
            await apiClient.delete(`/playlists/${id}`);
        }
    },

    getRecommendations: async (): Promise<RecommendationResponse> => {
        if (USE_MOCK) {
            const stored: Playlist[] = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
            if (stored.length === 0) {
                return getDynamicRecommendations(undefined);
            }
            const lastMovie = stored[0].movieId ?? undefined;
            return getDynamicRecommendations(lastMovie);
        }
        const res = await apiClient.get<RecommendationResponse>('/recommendations');
        return res.data;
    },
};