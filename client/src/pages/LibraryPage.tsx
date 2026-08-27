import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
    LibraryResponse,
    LibraryPlaylist,
} from '../types/api';
import { playlistService } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const PlaylistList: React.FC<{
    items: LibraryPlaylist[];
    savedList?: boolean;
    onUnsave?: (id: string) => void;
    removingId?: string | null;
}> = ({
    items,
    savedList = false,
    onUnsave,
    removingId,
}) => (
    items.length === 0 ? (
        <p style={{ color: '#888' }}>
            None yet.
        </p>
    ) : (
        <div
            style={{
                display: 'grid',
                gap: 10,
            }}
        >
            {items.map((playlist) => (
                <div
                    key={playlist.id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        background: '#141414',
                        padding: 16,
                        borderRadius: 8,
                    }}
                >
                    <Link
                        to={`/playlist/${playlist.id}`}
                        style={{
                            color: '#fff',
                            textDecoration: 'none',
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <strong>
                            {playlist.name}
                        </strong>

                        <div
                            style={{
                                color: '#888',
                                fontSize: 13,
                                marginTop: 5,
                            }}
                        >
                            by {playlist.creatorUsername} •{' '}
                            {playlist.songCount} songs •{' '}
                            {playlist.source}
                        </div>
                    </Link>

                    {savedList && onUnsave && (
                        <button
                            type="button"
                            onClick={() =>
                                onUnsave(playlist.id)
                            }
                            disabled={
                                removingId === playlist.id
                            }
                            style={{
                                flexShrink: 0,
                                padding: '8px 12px',
                                borderRadius: 6,
                                border: '1px solid #444',
                                background: '#222',
                                color: '#fff',
                                cursor:
                                    removingId === playlist.id
                                        ? 'default'
                                        : 'pointer',
                            }}
                        >
                            {removingId === playlist.id
                                ? 'Removing...'
                                : 'Remove'}
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
);

export const LibraryPage: React.FC = () => {
    const { isAuthenticated } = useAuth();

    const [library, setLibrary] =
        useState<LibraryResponse | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [removingId, setRemovingId] =
        useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        playlistService
            .getMyLibrary()
            .then(setLibrary)
            .catch((err) =>
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unable to load library.'
                )
            );
    }, [isAuthenticated]);

    const handleUnsave = async (
        playlistId: string
    ) => {
        setRemovingId(playlistId);

        try {
            await playlistService.unsavePlaylist(
                playlistId
            );

            setLibrary((current) =>
                current
                    ? {
                          ...current,
                          saved: current.saved.filter(
                              (playlist) =>
                                  playlist.id !==
                                  playlistId
                          ),
                      }
                    : current
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to remove playlist from your saved list.'
            );
        } finally {
            setRemovingId(null);
        }
    };

    if (!isAuthenticated) {
        return (
            <div
                className="page-container"
                style={{
                    textAlign: 'center',
                    marginTop: 60,
                }}
            >
                <h2>
                    Your Library is Locked
                </h2>

                <p
                    style={{
                        color: '#888',
                        marginTop: 8,
                    }}
                >
                    Please log in to view your playlists.
                </p>
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

    if (!library) {
        return (
            <div
                className="page-container"
                style={{
                    textAlign: 'center',
                    color: '#888',
                }}
            >
                Loading library...
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2
                style={{
                    textAlign: 'center',
                    marginBottom: 28,
                }}
            >
                My Library
            </h2>

            <section
                style={{ marginBottom: 32 }}
            >
                <h3
                    style={{ marginBottom: 14 }}
                >
                    Created by Me
                </h3>

                <PlaylistList
                    items={library.created}
                />
            </section>

            <section>
                <h3
                    style={{ marginBottom: 14 }}
                >
                    Saved Playlists
                </h3>

                <PlaylistList
                    items={library.saved}
                    savedList
                    onUnsave={handleUnsave}
                    removingId={removingId}
                />
            </section>
        </div>
    );
};