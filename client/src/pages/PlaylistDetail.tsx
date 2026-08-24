import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Playlist } from '../types/api';
import { playlistService } from '../services/apiClient';
import { PlayerBar } from '../components/PlayerBar';

export const PlaylistDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError(null);

        playlistService.getPlaylistById(id)
            .then(setPlaylist)
            .catch(() => setError('Unable to load playlist.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleNext = () => {
        if (!playlist || playlist.songs.length === 0) return;
        setCurrentSongIndex((prev) => (prev + 1) % playlist.songs.length);
    };

    const handlePrev = () => {
        if (!playlist || playlist.songs.length === 0) return;
        setCurrentSongIndex((prev) => (prev - 1 + playlist.songs.length) % playlist.songs.length);
    };

    if (loading) return <p style={{ color: '#aaa' }}>Loading playlist...</p>;
    if (error) return <p style={{ color: '#ff7676' }}>{error}</p>;
    if (!playlist) return <p style={{ color: '#aaa' }}>Playlist not found.</p>;

    return (
        <>
            <main>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    {playlist.movie?.posterUrl && (
                        <img
                            src={playlist.movie.posterUrl}
                            alt={playlist.name}
                            style={{ width: '160px', height: '220px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                    )}

                    <div>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#1db954', fontWeight: 'bold' }}>
                            {playlist.source}
                        </span>
                        <h2 style={{ fontSize: '32px', margin: '8px 0' }}>{playlist.name}</h2>
                        <p style={{ color: '#aaa', maxWidth: '600px' }}>{playlist.description}</p>
                    </div>
                </div>

                <section>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                        Soundtrack Tracks
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        {playlist.songs.map((song, index) => (
                            <button
                                type="button"
                                key={song.youtubeVideoId}
                                onClick={() => setCurrentSongIndex(index)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    borderRadius: '6px',
                                    border: 0,
                                    background: index === currentSongIndex ? '#222' : '#141414',
                                    color: '#fff',
                                    cursor: 'pointer',
                                }}
                            >
                                <div>
                                    <strong>{index + 1}. {song.title}</strong>
                                    <div style={{ fontSize: '12px', color: '#888' }}>{song.artist}</div>
                                </div>

                                <span style={{ color: '#888' }}>
                                    {Math.floor(song.durationSeconds / 60)}:
                                    {(song.durationSeconds % 60).toString().padStart(2, '0')}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            <PlayerBar
                currentTrack={playlist.songs[currentSongIndex] ?? null}
                onNext={handleNext}
                onPrev={handlePrev}
            />
        </>
    );
};
