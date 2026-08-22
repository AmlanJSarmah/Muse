import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Playlist } from '../types/api';
import { playlistService } from '../services/apiClient';
import { usePlayer } from '../context/PlayerContext';
import { Play } from 'lucide-react';

export const PlaylistDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const { playTrack, setQueue } = usePlayer();

    useEffect(() => {
        if (id) {
            playlistService.getPlaylistById(id).then(setPlaylist);
        }
    }, [id]);

    if (!playlist) {
        return <div className="page-container" style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Loading playlist...</div>;
    }

    const formatDuration = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Header Banner */}
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', backgroundColor: '#141414', padding: 28, borderRadius: 12, marginBottom: 32, border: '1px solid #222' }}>
                {playlist.movie?.posterUrl && (
                    <img src={playlist.movie.posterUrl} alt={playlist.name} style={{ width: 140, height: 180, borderRadius: 8, objectFit: 'cover' }} />
                )}
                <div>
                    <span style={{ backgroundColor: '#1db954', color: '#000', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {playlist.source}
                    </span>
                    <h1 style={{ fontSize: 30, margin: '12px 0 8px' }}>{playlist.name}</h1>
                    <p style={{ color: '#aaa', margin: '0 0 16px', fontSize: 14 }}>{playlist.description}</p>
                    <button
                        onClick={() => setQueue(playlist.songs, 0)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: 24, padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        <Play size={16} fill="#000" /> Play All
                    </button>
                </div>
            </div>

            {/* Tracklist */}
            <h3 style={{ textAlign: 'center', fontSize: 20, marginBottom: 20 }}>Tracklist</h3>
            <div style={{ backgroundColor: '#121212', borderRadius: 8, overflow: 'hidden', border: '1px solid #222' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 80px', padding: '12px 16px', borderBottom: '1px solid #222', fontSize: 12, color: '#666', fontWeight: 600 }}>
                    <span>#</span>
                    <span>TITLE</span>
                    <span>ARTIST</span>
                    <span style={{ textAlign: 'right' }}>DURATION</span>
                </div>
                {playlist.songs.map((song, idx) => (
                    <div
                        key={song.youtubeVideoId}
                        onClick={() => playTrack(song, playlist.songs)}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '50px 1fr 1fr 80px',
                            padding: '14px 16px',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontSize: 14,
                            borderBottom: '1px solid #1a1a1a',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1c1c1c')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        <span style={{ color: '#888' }}>{idx + 1}</span>
                        <span style={{ fontWeight: 600 }}>{song.title}</span>
                        <span style={{ color: '#888' }}>{song.artist}</span>
                        <span style={{ textAlign: 'right', color: '#888' }}>{formatDuration(song.durationSeconds)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};