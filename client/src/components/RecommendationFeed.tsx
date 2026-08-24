import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search } from 'lucide-react';

export const RecommendationFeed: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <h2 style={{ textAlign: 'center', fontSize: 24, marginBottom: 28 }}>Discover</h2>

            <div style={{ textAlign: 'center', maxWidth: 520, margin: '60px auto 0', padding: 40, background: '#121212', borderRadius: 12, border: '1px solid #222' }}>
                <Compass size={48} color="#1db954" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>Discover Movie Soundtracks</h3>
                <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
                    Search for a movie to fetch its soundtrack, see public playlists, or generate a new playlist.
                </p>
                <button
                    type="button"
                    onClick={() => navigate('/search')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1db954', color: '#000', border: 0, borderRadius: 24, padding: '12px 24px', fontWeight: 700 }}
                >
                    <Search size={16} /> Search Movies
                </button>
            </div>
        </div>
    );
};
