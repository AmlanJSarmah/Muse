import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Playlist } from '../types/api';
import { playlistService } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Trash2 } from 'lucide-react';

export const LibraryPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        let isSubscribed = true;

        playlistService
            .getUserPlaylists()
            .then((data) => {
                if (isSubscribed) {
                    setPlaylists(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (isSubscribed) {
                    setLoading(false);
                }
            });

        return () => {
            isSubscribed = false;
        };
    }, [isAuthenticated]);

    const handleRemove = async (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();
        await playlistService.removePlaylist(id);
        setPlaylists((prev) => prev.filter((p) => p.id !== id));
        showToast(`Removed "${name}" from your library`, 'info');
    };

    if (!isAuthenticated) {
        return (
            <div className="page-container" style={{ textAlign: 'center', marginTop: 60 }}>
                <h2>Your Library is Locked</h2>
                <p style={{ color: '#888', marginTop: 8 }}>Please log in to view and manage your saved movie soundtrack playlists.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="page-container" style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Loading library...</div>;
    }

    return (
        <div className="page-container">
            <h2 style={{ fontSize: 24, marginBottom: 24, textAlign: 'center' }}>Your Saved Playlists</h2>
            {playlists.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
                    <p>No saved playlists yet.</p>
                    <p style={{ fontSize: 13, marginTop: 6 }}>Search for a movie or generate one from Discover to add to your library.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                    {playlists.map((pl) => (
                        <div
                            key={pl.id}
                            className="interactive-card"
                            style={{ position: 'relative', backgroundColor: '#141414', borderRadius: 8, overflow: 'hidden', border: '1px solid #222' }}
                        >
                            <Link
                                to={`/playlist/${pl.id}`}
                                style={{ textDecoration: 'none', color: '#fff', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
                            >
                                <img
                                    src={pl.movie?.posterUrl || pl.songs[0]?.thumbnailUrl || 'https://via.placeholder.com/300x400?text=No+Cover'}
                                    alt={pl.name}
                                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 6 }}
                                />
                                <div>
                                    <strong style={{ fontSize: 15, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</strong>
                                    <span style={{ fontSize: 12, color: '#888' }}>{pl.songs.length} Tracks • {pl.source}</span>
                                </div>
                            </Link>
                            <button
                                onClick={(e) => handleRemove(e, pl.id, pl.name)}
                                title="Remove Playlist"
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#ff4d4d'
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};