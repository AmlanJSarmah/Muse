import React, { useState } from 'react';
import type { PlaylistSearchResponse, SoundtrackResponse } from '../types/api';
import { movieService, playlistService } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

export const MovieSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [soundtrack, setSoundtrack] = useState<SoundtrackResponse | null>(null);
    const [playlists, setPlaylists] = useState<PlaylistSearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const search = async () => {
        const title = query.trim();
        if (!title) return;

        if (!isAuthenticated) {
            setError('Please log in before searching.');
            return;
        }

        setLoading(true);
        setError(null);
        setSoundtrack(null);
        setPlaylists(null);

        try {
            const [tracks, publicPlaylists] = await Promise.all([
                movieService.getSoundtrack(title),
                playlistService.searchPublicPlaylists(title),
            ]);
            setSoundtrack(tracks);
            setPlaylists(publicPlaylists);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to search.');
        } finally {
            setLoading(false);
        }
    };

    const generatePlaylist = async () => {
        if (!soundtrack) return;
        setGenerating(true);

        try {
            const result = await movieService.generatePlaylist(soundtrack.movie);
            showToast(`Playlist created with ${result.songCount} songs.`, 'success');
            window.location.href = `/playlist/${result.playlistId}`;
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Unable to generate playlist.', 'error');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <section className="page-container">
            <h2>Movie Search</h2>

            <div style={{ display: 'flex', gap: 10, maxWidth: 620, marginTop: 16 }}>
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void search(); }}
                    placeholder="Enter a movie title..."
                    aria-label="Movie title"
                    style={{ flex: 1, padding: '13px 15px', borderRadius: 8, border: '1px solid #333', background: '#141414', color: '#fff', fontSize: 16 }}
                />
                <button
                    type="button"
                    onClick={() => void search()}
                    disabled={loading || !query.trim()}
                    style={{ padding: '0 20px', border: 0, borderRadius: 8, background: '#1db954', color: '#000', fontWeight: 700 }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {!isAuthenticated && (
                <p style={{ color: '#aaa', marginTop: 12 }}>Log in to use the Muse soundtrack API.</p>
            )}

            {error && <p style={{ color: '#ff7676', marginTop: 16 }}>{error}</p>}

            {soundtrack && (
                <div style={{ marginTop: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                            <h3>{soundtrack.movie}</h3>
                            <p style={{ color: '#aaa', marginTop: 4 }}>{soundtrack.album}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => void generatePlaylist()}
                            disabled={generating}
                            style={{ padding: '10px 16px', border: 0, borderRadius: 8, background: '#1db954', color: '#000', fontWeight: 700 }}
                        >
                            {generating ? 'Generating...' : 'Generate Playlist'}
                        </button>
                    </div>

                    <div style={{ marginTop: 20, display: 'grid', gap: 8 }}>
                        {soundtrack.songs.map((song, index) => (
                            <div key={`${song.title}-${index}`} style={{ padding: 14, background: '#141414', borderRadius: 8 }}>
                                <strong>{index + 1}. {song.title}</strong>
                                <div style={{ color: '#aaa', marginTop: 4 }}>{song.artist}</div>
                                <div style={{ color: '#777', fontSize: 12, marginTop: 5 }}>{song.genres.join(' • ')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {playlists && (
                <section style={{ marginTop: 36 }}>
                    <h3>Public Playlists for {playlists.movie}</h3>
                    {playlists.playlists.length === 0 ? (
                        <p style={{ color: '#aaa', marginTop: 12 }}>No public playlists exist yet. Generate one above.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                            {playlists.playlists.map((playlist) => (
                                <div key={playlist.id} style={{ background: '#141414', borderRadius: 8, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                                    <div>
                                        <strong>{playlist.name}</strong>
                                        <div style={{ color: '#888', fontSize: 13, marginTop: 5 }}>
                                            by {playlist.creatorUsername} • {playlist.songCount} songs
                                        </div>
                                    </div>
                                    <Link to={`/playlist/${playlist.id}`} style={{ color: '#1db954' }}>Open</Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </section>
    );
};
