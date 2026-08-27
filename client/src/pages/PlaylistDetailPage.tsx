import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Playlist } from '../types/api';
import { playlistService } from '../services/apiClient';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Play } from 'lucide-react';

const getYoutubeVideoId = (url: string | null | undefined): string | null => {
    if (!url) return null;

    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes('youtu.be')) {
            return parsed.pathname.replace('/', '') || null;
        }

        if (parsed.hostname.includes('youtube.com')) {
            return parsed.searchParams.get('v');
        }
    } catch {
        return null;
    }

    return null;
};

export const PlaylistDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [changingVisibility, setChangingVisibility] = useState(false);

    const { setQueue, playTrack } = usePlayer();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (!id) return;

        setLoading(true);

        const loadPlaylist = async () => {
            try {
                const [playlistData, library] = await Promise.all([
                    playlistService.getPlaylistById(id),
                    isAuthenticated
                        ? playlistService.getMyLibrary()
                        : Promise.resolve(null),
                ]);

                setPlaylist(playlistData);

                setIsSaved(
                    library?.saved.some(
                        (savedPlaylist) => savedPlaylist.id === id
                    ) ?? false
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unable to load playlist.'
                );
            } finally {
                setLoading(false);
            }
        };

        void loadPlaylist();
    }, [id, isAuthenticated]);

    const handleSave = async () => {
        if (!playlist) return;

        setSaving(true);

        try {
            if (isSaved) {
                await playlistService.unsavePlaylist(playlist.id);

                setIsSaved(false);

                showToast(
                    'Playlist removed from your saved list.',
                    'success'
                );
            } else {
                await playlistService.savePlaylist(playlist.id);

                setIsSaved(true);

                showToast(
                    'Playlist saved to your library.',
                    'success'
                );
            }
        } catch (err) {
            showToast(
                err instanceof Error
                    ? err.message
                    : isSaved
                        ? 'Unable to remove playlist from your saved list.'
                        : 'Unable to save playlist.',
                'error'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleVisibility = async () => {
        if (!playlist) return;

        setChangingVisibility(true);

        try {
            const nextVisibility = !playlist.isPublic;

            await playlistService.setVisibility(
                playlist.id,
                nextVisibility
            );

            setPlaylist({
                ...playlist,
                isPublic: nextVisibility,
            });

            showToast(
                nextVisibility
                    ? 'Playlist is now public.'
                    : 'Playlist is now private.',
                'success'
            );
        } catch (err) {
            showToast(
                err instanceof Error
                    ? err.message
                    : 'Unable to change visibility.',
                'error'
            );
        } finally {
            setChangingVisibility(false);
        }
    };

    const playableSongs =
        playlist?.songs
            .map((song) => {
                const videoId =
                    song.youtubeVideoId ??
                    getYoutubeVideoId(song.youtubeUrl);

                if (!videoId) return null;

                return {
                    ...song,
                    youtubeVideoId: videoId,
                    youtubeUrl:
                        song.youtubeUrl ??
                        `https://www.youtube.com/watch?v=${videoId}`,
                    durationSeconds: song.durationSeconds ?? 0,
                    thumbnailUrl:
                        song.thumbnailUrl ??
                        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                };
            })
            .filter(
                (
                    song
                ): song is NonNullable<typeof song> =>
                    song !== null
            ) ?? [];

    if (loading) {
        return (
            <div
                className="page-container"
                style={{
                    textAlign: 'center',
                    color: '#888',
                }}
            >
                Loading playlist...
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="page-container"
                style={{ color: '#ff7676' }}
            >
                {error}
            </div>
        );
    }

    if (!playlist) {
        return (
            <div
                className="page-container"
                style={{ color: '#888' }}
            >
                Playlist not found.
            </div>
        );
    }

    return (
        <div
            className="page-container"
            style={{
                maxWidth: 900,
                margin: '0 auto',
            }}
        >
            <div
                style={{
                    background: '#141414',
                    padding: 28,
                    borderRadius: 12,
                    marginBottom: 28,
                }}
            >
                <div
                    style={{
                        color: '#1db954',
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                >
                    {playlist.isPublic ? 'PUBLIC' : 'PRIVATE'}
                </div>

                <h1 style={{ margin: '10px 0 8px' }}>
                    {playlist.name}
                </h1>

                <p style={{ color: '#aaa' }}>
                    {playlist.description}
                </p>

                <p
                    style={{
                        color: '#888',
                        marginTop: 8,
                    }}
                >
                    Movie: {playlist.movieTitle}
                </p>

                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        flexWrap: 'wrap',
                        marginTop: 18,
                    }}
                >
                    {playableSongs.length > 0 && (
                        <button
                            type="button"
                            onClick={() =>
                                setQueue(playableSongs, 0)
                            }
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: '#fff',
                                color: '#000',
                                border: 0,
                                borderRadius: 24,
                                padding: '10px 20px',
                                fontWeight: 700,
                            }}
                        >
                            <Play
                                size={16}
                                fill="#000"
                            />
                            Play All
                        </button>
                    )}

                    {isAuthenticated && (
                        <>
                            <button
                                type="button"
                                onClick={() =>
                                    void handleSave()
                                }
                                disabled={saving}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: 24,
                                    border: '1px solid #444',
                                    background: '#222',
                                    color: '#fff',
                                }}
                            >
                                {saving
                                    ? isSaved
                                        ? 'Removing...'
                                        : 'Saving...'
                                    : isSaved
                                        ? 'Remove from Library'
                                        : 'Save to Library'}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleVisibility()
                                }
                                disabled={changingVisibility}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: 24,
                                    border: '1px solid #444',
                                    background: '#222',
                                    color: '#fff',
                                }}
                            >
                                {changingVisibility
                                    ? 'Updating...'
                                    : playlist.isPublic
                                        ? 'Make Private'
                                        : 'Make Public'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <h3 style={{ marginBottom: 14 }}>
                Soundtrack Tracks
            </h3>

            <div style={{ display: 'grid', gap: 8 }}>
                {playlist.songs.map((song, index) => {
                    const videoId =
                        song.youtubeVideoId ??
                        getYoutubeVideoId(song.youtubeUrl);

                    return (
                        <button
                            key={`${song.title}-${index}`}
                            type="button"
                            onClick={() => {
                                const playable =
                                    playableSongs.find(
                                        (item) =>
                                            item.title ===
                                                song.title &&
                                            item.artist ===
                                                song.artist
                                    );

                                if (playable) {
                                    playTrack(
                                        playable,
                                        playableSongs
                                    );
                                }
                            }}
                            disabled={!videoId}
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    '40px 1fr auto',
                                gap: 12,
                                textAlign: 'left',
                                padding: 14,
                                border: 0,
                                borderRadius: 8,
                                background: '#141414',
                                color: '#fff',
                                cursor: videoId
                                    ? 'pointer'
                                    : 'default',
                            }}
                        >
                            <span style={{ color: '#888' }}>
                                {index + 1}
                            </span>

                            <span>
                                <strong>
                                    {song.title}
                                </strong>

                                <span
                                    style={{
                                        display: 'block',
                                        color: '#888',
                                        marginTop: 4,
                                    }}
                                >
                                    {song.artist}
                                </span>

                                <span
                                    style={{
                                        display: 'block',
                                        color: '#666',
                                        fontSize: 12,
                                        marginTop: 4,
                                    }}
                                >
                                    {song.genres.join(' • ')}
                                </span>
                            </span>

                            <span
                                style={{
                                    color: '#888',
                                    fontSize: 13,
                                }}
                            >
                                {videoId
                                    ? '▶'
                                    : 'No YouTube link'}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};