import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Playlist } from '../types/api';
import { playlistService } from '../services/apiClient';
import { usePlayer } from '../context/PlayerContext';

const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export const PlaylistDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentTrack, setQueue, playTrack } = usePlayer();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true); setError(null);
        playlistService.getPlaylistById(id).then(setPlaylist).catch(() => setError('Unable to load playlist.')).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p style={{ color: '#aaa' }}>Loading playlist...</p>;
    if (error) return <p style={{ color: '#ff7676' }}>{error}</p>;
    if (!playlist) return <p style={{ color: '#aaa' }}>Playlist not found.</p>;

    return <main>
        <div style={{ display: 'flex', gap: 24, marginBottom: 32, padding: 24, borderRadius: 12, background: 'linear-gradient(135deg, #191919, #101010)', flexWrap: 'wrap' }}>
            {playlist.movie?.posterUrl && <img src={playlist.movie.posterUrl} alt={playlist.name} style={{ width: 180, height: 250, objectFit: 'cover', borderRadius: 8 }} />}
            <div style={{ alignSelf: 'center' }}>
                <span style={{ display: 'inline-block', padding: '5px 9px', borderRadius: 999, background: '#1db954', color: '#000', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{playlist.source}</span>
                <h2 style={{ fontSize: 36, margin: '10px 0 8px' }}>{playlist.name}</h2>
                <p style={{ color: '#aaa', maxWidth: 700, lineHeight: 1.6 }}>{playlist.description}</p>
                <button type="button" onClick={() => setQueue(playlist.songs, 0)} disabled={!playlist.songs.length} style={{ padding: '10px 18px', border: 0, borderRadius: 999, background: '#fff', color: '#000', fontWeight: 800, cursor: playlist.songs.length ? 'pointer' : 'not-allowed' }}>▶ Play All</button>
            </div>
        </div>

        <section>
            <h3>Tracklist</h3>
            <div style={{ overflowX: 'auto', border: '1px solid #242424', borderRadius: 10, background: '#101010' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '60px minmax(240px,1fr) minmax(180px,.7fr) 120px', minWidth: 650, padding: '12px 16px', color: '#777', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid #242424' }}><span>#</span><span>Title</span><span>Artist</span><span>Duration (MM:SS)</span></div>
                {playlist.songs.map((song, index) => {
                    const active = currentTrack?.youtubeVideoId === song.youtubeVideoId;
                    return <button key={song.youtubeVideoId} type="button" onClick={() => playTrack(song, playlist.songs)} style={{ width: '100%', display: 'grid', gridTemplateColumns: '60px minmax(240px,1fr) minmax(180px,.7fr) 120px', minWidth: 650, padding: '14px 16px', border: 0, borderBottom: '1px solid #1d1d1d', background: active ? '#202020' : 'transparent', color: '#fff', textAlign: 'left', cursor: 'pointer' }}>
                        <span style={{ color: '#777' }}>{index + 1}</span><strong>{song.title}</strong><span style={{ color: '#aaa' }}>{song.artist}</span><span style={{ color: '#aaa' }}>{formatDuration(song.durationSeconds)}</span>
                    </button>;
                })}
            </div>
        </section>
        <p style={{ marginTop: 20 }}><Link to="/" style={{ color: '#1db954' }}>← Back to Discover</Link></p>
    </main>;
};
