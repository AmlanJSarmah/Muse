import axios from 'axios';
import type {
    AuthResponse,
    LibraryResponse,
    MyRecommendationInfoResponse,
    Playlist,
    PlaylistSearchResponse,
    SoundtrackResponse,
} from '../types/api';

export const apiClient = axios.create({
    baseURL: 'http://localhost:5235',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const getApiError = (
    error: unknown,
    fallback: string
): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as
            | {
                  error?: string;
                  errors?: Record<string, string[]>;
              }
            | undefined;

        if (typeof data?.error === 'string') {
            return data.error;
        }

        if (data?.errors) {
            return (
                Object.values(data.errors)
                    .flat()
                    .join(' ') || fallback
            );
        }

        if (error.response?.status === 401) {
            return 'Please log in to continue.';
        }

        if (error.response?.status === 404) {
            return 'The requested resource was not found.';
        }
    }

    return fallback;
};

export const authService = {
    async login(
        email: string,
        password: string
    ): Promise<AuthResponse> {
        try {
            const response =
                await apiClient.post<AuthResponse>(
                    '/api/auth/signin',
                    {
                        email,
                        password,
                    }
                );

            return response.data;
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Invalid email or password.'
                )
            );
        }
    },

    async register(
        username: string,
        email: string,
        password: string
    ): Promise<AuthResponse> {
        try {
            const response =
                await apiClient.post<AuthResponse>(
                    '/api/auth/signup',
                    {
                        username,
                        email,
                        password,
                    }
                );

            return response.data;
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Unable to create the account.'
                )
            );
        }
    },
};

export const movieService = {
    async getSoundtrack(
        title: string
    ): Promise<SoundtrackResponse> {
        try {
            const response =
                await apiClient.get<SoundtrackResponse>(
                    '/app/songs',
                    {
                        params: { title },
                    }
                );

            return response.data;
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    `No soundtrack found for "${title}".`
                )
            );
        }
    },

    async generatePlaylist(title: string): Promise<{
        playlistId: string;
        movie: string;
        album: string;
        songCount: number;
    }> {
        try {
            const response =
                await apiClient.post(
                    '/app/songs/save',
                    null,
                    {
                        params: { title },
                    }
                );

            return response.data;
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    `Unable to generate a playlist for "${title}".`
                )
            );
        }
    },
};

export const playlistService = {
    async searchPublicPlaylists(
        movieTitle: string
    ): Promise<PlaylistSearchResponse> {
        try {
            const response =
                await apiClient.get<PlaylistSearchResponse>(
                    '/api/playlists/search',
                    {
                        params: { movieTitle },
                    }
                );

            return response.data;
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Unable to find public playlists.'
                )
            );
        }
    },

    async getPlaylistById(
        id: string
    ): Promise<Playlist> {
        try {
            const response =
                await apiClient.get<Playlist>(
                    `/api/playlists/${id}`
                );

            return response.data;
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Unable to load playlist.'
                )
            );
        }
    },

    async savePlaylist(
        id: string
    ): Promise<void> {
        try {
            await apiClient.post(
                `/api/playlists/${id}/save`
            );
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Unable to save playlist.'
                )
            );
        }
    },

    async unsavePlaylist(
        id: string
    ): Promise<void> {
        try {
            await apiClient.delete(
                `/api/playlists/${id}/save`
            );
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Unable to remove playlist from your saved list.'
                )
            );
        }
    },

    async deletePlaylist(
        id: string
    ): Promise<void> {
        try {
            await apiClient.delete(
                `/api/playlists/${id}`
            );
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Unable to delete playlist.'
                )
            );
        }
    },

    async setVisibility(
        id: string,
        isPublic: boolean
    ): Promise<void> {
        try {
            await apiClient.patch(
                `/api/playlists/${id}/visibility`,
                {
                    isPublic,
                }
            );
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Unable to change playlist visibility.'
                )
            );
        }
    },

    async getMyLibrary(): Promise<LibraryResponse> {
        try {
            const response =
                await apiClient.get<LibraryResponse>(
                    '/api/playlists/mine'
                );

            return response.data;
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Unable to load your library.'
                )
            );
        }
    },

    
    async getMyRecommendationMovieInfo(): Promise<MyRecommendationInfoResponse> {
        try {
            const response =
                await apiClient.get<MyRecommendationInfoResponse>(
                    '/api/playlists/mine/movie-info'
                );

            return response.data;
        } catch (error) {
            throw new Error(
                getApiError(
                    error,
                    'Unable to load movie information for recommendations.'
                )
            );
        }
    },
};