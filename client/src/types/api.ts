export interface AuthResponse {
    token: string;
    expiresAt: string;
    username: string;
    email: string;
}

export interface SoundtrackSong {
    title: string;
    artist: string;
    genres: string[];
}

export interface SoundtrackResponse {
    movie: string;
    album: string;
    songs: SoundtrackSong[];
}

export interface PlaylistSummary {
    id: string;
    name: string;
    creatorUsername: string;
    source: string;
    songCount: number;
    createdAt: string;
}

export interface PlaylistSearchResponse {
    movie: string;
    playlists: PlaylistSummary[];
}

export interface PlaylistSong {
    title: string;
    artist: string;
    genres: string[];
    youtubeUrl: string | null;
    youtubeVideoId?: string;
    durationSeconds?: number;
    thumbnailUrl?: string | null;
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    isPublic: boolean;
    movieTitle: string;
    songs: PlaylistSong[];
}

export interface LibraryPlaylist {
    id: string;
    name: string;
    creatorUsername: string;
    source: string;
    songCount: number;
    createdAt: string;
}

export interface LibraryResponse {
    created: LibraryPlaylist[];
    saved: LibraryPlaylist[];
}


export interface RecommendationMovieInfo {
    movieId: string;
    movieTitle: string;
    year: number;
    genres: string[];
    artists: string[];
}

export interface MyRecommendationInfoResponse {
    created: RecommendationMovieInfo[];
    saved: RecommendationMovieInfo[];
}


export interface MovieRecommendation {
    movieName: string;
    year: number;
    genres: string[];
    artists: string[];
    score: number;
}


export interface RecommendationGroup {
    movieId: string;
    movieName: string;
    recommendations: MovieRecommendation[];
}


export interface RecommendationResponse {
    recommendations: RecommendationGroup[];
}