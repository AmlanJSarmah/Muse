import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LibraryResponse, LibraryPlaylist } from '../types/api';
import { playlistService } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const PlaylistList: React.FC<{ items: LibraryPlaylist[] }> = ({ items }) => (
    items.length === 0 ? (
        <p style={{ color: '#888' }}>None yet.</p>
    ) : (
        <div style={{ display: 'grid', gap: 10 }}>
            {items.map((playlist) => (
                <Link
                    key={playlist.id}
                    to={`/playlist/${playlist.id}`}
                    style={{ color: '#fff', textDecoration: 'none', background: '#141414', padding: 16, borderRadius: 8 }}
                >
                    <strong>{playlist.name}</strong>
                    <div style={{ color: '#888', fontSize: 13, marginTop: 5 }}>
                        by {playlist.creatorUsername} • {playlist.songCount} songs • {playlist.source}
                    </div>
                </Link>
            ))}
        </div>
    )
);

export const LibraryPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [library, setLibrary] = useState<LibraryResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        playlistService.getMyLibrary()
            .then(setLibrary)
            .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load library.'));
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="page-container" style={{ textAlign: 'center', marginTop: 60 }}>
                <h2>Your Library is Locked</h2>
                <p style={{ color: '#888', marginTop: 8 }}>Please log in to view your playlists.</p>
            </div>
        );
    }

    if (error) {
        return <div className="page-container" style={{ color: '#ff7676' }}>{error}</div>;
    }

    if (!library) {
        return <div className="page-container" style={{ textAlign: 'center', color: '#888' }}>Loading library...</div>;
    }

    return (
        <div className="page-container">
            <h2 style={{ textAlign: 'center', marginBottom: 28 }}>My Library</h2>

            <section style={{ marginBottom: 32 }}>
                <h3 style={{ marginBottom: 14 }}>Created by Me</h3>
                <PlaylistList items={library.created} />
            </section>

            <section>
                <h3 style={{ marginBottom: 14 }}>Saved Playlists</h3>
                <PlaylistList items={library.saved} />
            </section>
        </div>
    );
};
