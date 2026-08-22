import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RecommendationResponse, MovieSummary } from '../types/api';
import { playlistService, movieService } from '../services/apiClient';
import { useToast } from '../context/ToastContext';
import { Compass, Search } from 'lucide-react';

export const RecommendationFeed: React.FC = () => {
    const [data, setData] = useState<RecommendationResponse | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        playlistService.getRecommendations().then(setData);
    }, [location.key]);

    const handleGenerate = async (movieId: string, title: string) => {
        setLoadingId(movieId);
        try {
            const playlist = await movieService.generatePlaylist(movieId);
            showToast(`Generated: ${playlist.name}`, 'success');
            setTimeout(() => {
                navigate(`/playlist/${playlist.id}`);
            }, 1000);
        } catch {
            showToast(`Failed to generate playlist for ${title}`, 'error');
        } finally {
            setLoadingId(null);
        }
    };

    if (!data) {
        return <div className="page-container" style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Loading recommendations...</div>;
    }

    return (
        <div className="page-container">
            <h2 style={{ textAlign: 'center', fontSize: 24, marginBottom: 28 }}>Discover & Recommendations</h2>

            {data.recommendations.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    maxWidth: 480,
                    margin: '60px auto 0',
                    padding: '40px 24px',
                    backgroundColor: '#121212',
                    borderRadius: 12,
                    border: '1px solid #222'
                }}>
                    <Compass size={48} color="#1db954" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>No Recommendations Found</h3>
                    <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
                        We generate music recommendations based on your saved soundtracks. Search for a movie to generate and save your first playlist!
                    </p>
                    <button
                        onClick={() => navigate('/search')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            backgroundColor: '#1db954',
                            color: '#000',
                            border: 'none',
                            borderRadius: 24,
                            padding: '12px 24px',
                            fontWeight: 'bold',
                            fontSize: 14,
                            cursor: 'pointer'
                        }}
                    >
                        <Search size={16} /> Search Movies
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
                    {data.recommendations.map((rec) => {
                        const movie = rec.item as MovieSummary;
                        return (
                            <div
                                key={rec.id}
                                className="interactive-card"
                                style={{
                                    backgroundColor: '#121212',
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    border: '1px solid #222',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', textAlign: 'center' }}>
                                    <div>
                                        <span style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>MOVIE</span>
                                        <div style={{ color: '#1db954', fontWeight: 'bold', fontSize: 14, marginTop: 4 }}>
                                            {Math.round(rec.score * 100)}% Match
                                        </div>
                                        <h3 style={{ margin: '8px 0 4px', fontSize: 20 }}>{movie.title}</h3>
                                        <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>{movie.year}</div>
                                        <p style={{ color: '#aaa', fontSize: 12, margin: '0 0 20px', minHeight: 36 }}>{rec.reason}</p>
                                    </div>
                                    <button
                                        onClick={() => handleGenerate(movie.id, movie.title)}
                                        disabled={loadingId === movie.id}
                                        style={{
                                            backgroundColor: '#1db954',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: 8,
                                            padding: '12px',
                                            fontWeight: 'bold',
                                            fontSize: 14,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {loadingId === movie.id ? 'Generating...' : 'Generate Playlist'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};