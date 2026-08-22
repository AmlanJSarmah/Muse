import React, { useEffect, useState } from 'react';
import type { MovieSummary, Playlist } from '../types/api';
import { movieService } from '../services/apiClient';

export const MovieSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState<MovieSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [generatedPlaylist, setGeneratedPlaylist] = useState<Playlist | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) { setMovies([]); setError(null); return; }

        const timer = window.setTimeout(async () => {
            setLoading(true); setError(null);
            try {
                const response = await movieService.searchMovies(trimmed);
                setMovies(response.data);
            } catch {
                setMovies([]); setError('Unable to search movies. Please try again.');
            } finally { setLoading(false); }
        }, 350);
        return () => window.clearTimeout(timer);
    }, [query]);

    const generatePlaylist = async (movie: MovieSummary) => {
        setGeneratingId(movie.id); setGeneratedPlaylist(null); setError(null);
        try { setGeneratedPlaylist(await movieService.generatePlaylist(movie.id)); }
        catch { setError(`Unable to generate a playlist for ${movie.title}.`); }
        finally { setGeneratingId(null); }
    };

    return <section>
        <h2>Movie Search</h2>
        <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie..." aria-label="Search for a movie"
            style={{ width: '100%', maxWidth: 620, padding: '13px 15px', borderRadius: 8, border: '1px solid #333', background: '#141414', color: '#fff', fontSize: 16, boxSizing: 'border-box' }}
        />
        {loading && <p style={{ color: '#aaa' }} role="status">Searching...</p>}
        {error && <p style={{ color: '#ff7676' }}>{error}</p>}
        {generatedPlaylist && <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: '#141414' }}>Generated: <strong>{generatedPlaylist.name}</strong></div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 20, marginTop: 24 }}>
            {movies.map((movie) => {
                const generating = generatingId === movie.id;
                return <article key={movie.id} style={{ background: '#141414', border: '1px solid #252525', borderRadius: 10, overflow: 'hidden' }}>
                    <img src={movie.posterUrl} alt={`${movie.title} poster`} style={{ display: 'block', width: '100%', aspectRatio: '2 / 3', objectFit: 'cover' }} />
                    <div style={{ padding: 14 }}>
                        <h3 style={{ margin: '0 0 6px' }}>{movie.title}</h3>
                        <p style={{ margin: '0 0 14px', color: '#999' }}>{movie.year}</p>
                        <button type="button" disabled={generating} onClick={() => generatePlaylist(movie)} style={{ width: '100%', padding: '10px 12px', border: 0, borderRadius: 6, background: generating ? '#166b36' : '#1db954', color: '#000', fontWeight: 700, cursor: generating ? 'wait' : 'pointer' }}>
                            {generating ? '⟳ Generating...' : 'Generate Playlist'}
                        </button>
                    </div>
                </article>;
            })}
        </div>
        {!loading && query.trim() && movies.length === 0 && !error && <p style={{ color: '#aaa', marginTop: 24 }}>No movies found.</p>}
    </section>;
};
