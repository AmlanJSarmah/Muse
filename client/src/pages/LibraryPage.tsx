import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
    LibraryResponse,
    LibraryPlaylist,
} from '../types/api';
import { playlistService } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

interface PlaylistListProps {
    items: LibraryPlaylist[];
    createdByMe?: boolean;
    onDelete?: (id: string) => void;
    deletingId?: string | null;
}

const PlaylistList: React.FC<PlaylistListProps> = ({
    items,
    createdByMe = false,
    onDelete,
    deletingId,
}) => {
    if (items.length === 0) {
        return (
            <p style={{ color: '#888' }}>
                None yet.
            </p>
        );
    }

    return (
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

                    {createdByMe &&
                        onDelete && (
                            <button
                                type="button"
                                onClick={() =>
                                    onDelete(
                                        playlist.id
                                    )
                                }
                                disabled={
                                    deletingId ===
                                    playlist.id
                                }
                                style={{
                                    flexShrink: 0,
                                    padding:
                                        '8px 14px',
                                    borderRadius: 6,
                                    border:
                                        '1px solid #444',
                                    background:
                                        '#222',
                                    color: '#fff',
                                    cursor:
                                        deletingId ===
                                        playlist.id
                                            ? 'default'
                                            : 'pointer',
                                }}
                            >
                                {deletingId ===
                                playlist.id
                                    ? 'Deleting...'
                                    : 'Delete'}
                            </button>
                        )}
                </div>
            ))}
        </div>
    );
};

export const LibraryPage: React.FC = () => {
    const { isAuthenticated } =
        useAuth();

    const [library, setLibrary] =
        useState<LibraryResponse | null>(
            null
        );

    const [error, setError] =
        useState<string | null>(null);

    const [deletingId, setDeletingId] =
        useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const loadLibrary =
            async () => {
                try {
                    setError(null);

                    const data =
                        await playlistService.getMyLibrary();

                    setLibrary(data);
                } catch (err) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Unable to load library.'
                    );
                }
            };

        void loadLibrary();
    }, [isAuthenticated]);

    const handleDelete = async (
        playlistId: string
    ) => {
        const confirmed =
            window.confirm(
                'Are you sure you want to delete this playlist?'
            );

        if (!confirmed) {
            return;
        }

        setDeletingId(playlistId);
        setError(null);

        try {
            await playlistService.deletePlaylist(
                playlistId
            );

            // Remove the deleted playlist
            // immediately from Created by Me.
            setLibrary((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    created:
                        current.created.filter(
                            (playlist) =>
                                playlist.id !==
                                playlistId
                        ),
                };
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to delete playlist.'
            );
        } finally {
            setDeletingId(null);
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
                    Please log in to view your
                    playlists.
                </p>
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

            {error && (
                <div
                    style={{
                        color: '#ff7676',
                        marginBottom: 20,
                    }}
                >
                    {error}
                </div>
            )}

            {/* CREATED PLAYLISTS */}
            <section
                style={{
                    marginBottom: 32,
                }}
            >
                <h3
                    style={{
                        marginBottom: 14,
                    }}
                >
                    Created by Me
                </h3>

                <PlaylistList
                    items={library.created}
                    createdByMe={true}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                />
            </section>

            {/* SAVED PLAYLISTS */}
            <section>
                <h3
                    style={{
                        marginBottom: 14,
                    }}
                >
                    Saved Playlists
                </h3>

                {/* 
                    IMPORTANT:
                    There is intentionally NO Remove button here.

                    
                */}
                <PlaylistList
                    items={library.saved}
                />
            </section>
        </div>
    );
};