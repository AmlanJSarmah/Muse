import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Compass,
    Search,
    RefreshCw,
} from 'lucide-react';

import { playlistService } from '../services/apiClient';
import { getRecommendations } from '../services/recommendationService';

import type {
    MovieRecommendation,
    RecommendationResponse,
} from '../types/api';

import { useAuth } from '../context/AuthContext';

export const RecommendationFeed: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [recommendations, setRecommendations] =
        useState<RecommendationResponse | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const loadRecommendations = async () => {
        if (!isAuthenticated) {
            setRecommendations(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            /*
             * Get the user's created and saved movies
             * from the ASP.NET backend.
             */
            const movieInfo =
                await playlistService.getMyRecommendationMovieInfo();

            /*
             * Send that information to the ML API.
             *
             * POST http://localhost:8000/recommend
             */
            const result =
                await getRecommendations(movieInfo);

            setRecommendations(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load recommendations.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadRecommendations();
    }, [isAuthenticated]);

    /*
     * User is not logged in.
     */
    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <h2
                    style={{
                        textAlign: 'center',
                        fontSize: 24,
                        marginBottom: 28,
                    }}
                >
                    Discover
                </h2>

                <div
                    style={{
                        textAlign: 'center',
                        maxWidth: 520,
                        margin: '60px auto 0',
                        padding: 40,
                        background: '#121212',
                        borderRadius: 12,
                        border: '1px solid #222',
                    }}
                >
                    <Compass
                        size={48}
                        color="#1db954"
                        style={{
                            marginBottom: 16,
                        }}
                    />

                    <h3
                        style={{
                            fontSize: 20,
                            marginBottom: 8,
                        }}
                    >
                        Discover Movie Soundtracks
                    </h3>

                    <p
                        style={{
                            color: '#aaa',
                            fontSize: 14,
                            lineHeight: 1.5,
                            marginBottom: 24,
                        }}
                    >
                        Search for movies, create playlists,
                        and save playlists to get personalized
                        recommendations.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/search')
                        }
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: '#1db954',
                            color: '#000',
                            border: 0,
                            borderRadius: 24,
                            padding: '12px 24px',
                            fontWeight: 700,
                        }}
                    >
                        <Search size={16} />
                        Search Movies
                    </button>
                </div>
            </div>
        );
    }

    /*
     * Loading recommendations.
     */
    if (loading) {
        return (
            <div className="page-container">
                <h2
                    style={{
                        textAlign: 'center',
                        fontSize: 24,
                        marginBottom: 28,
                    }}
                >
                    Discover
                </h2>

                <div
                    style={{
                        textAlign: 'center',
                        color: '#888',
                        marginTop: 60,
                    }}
                >
                    <RefreshCw
                        size={28}
                        style={{
                            marginBottom: 12,
                        }}
                    />

                    <p>
                        Finding recommendations for you...
                    </p>
                </div>
            </div>
        );
    }

    /*
     * Recommendation error.
     */
    if (error) {
        return (
            <div className="page-container">
                <h2
                    style={{
                        textAlign: 'center',
                        fontSize: 24,
                        marginBottom: 28,
                    }}
                >
                    Discover
                </h2>

                <div
                    style={{
                        maxWidth: 600,
                        margin: '40px auto',
                        padding: 24,
                        background: '#121212',
                        borderRadius: 12,
                        border: '1px solid #222',
                        textAlign: 'center',
                    }}
                >
                    <p
                        style={{
                            color: '#ff7676',
                            marginBottom: 20,
                        }}
                    >
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            void loadRecommendations()
                        }
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: '#222',
                            color: '#fff',
                            border: '1px solid #444',
                            borderRadius: 24,
                            padding: '10px 18px',
                            fontWeight: 600,
                        }}
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    /*
     * No recommendations.
     */
    if (
        !recommendations ||
        recommendations.recommendations.length === 0
    ) {
        return (
            <div className="page-container">
                <h2
                    style={{
                        textAlign: 'center',
                        fontSize: 24,
                        marginBottom: 28,
                    }}
                >
                    Discover
                </h2>

                <div
                    style={{
                        textAlign: 'center',
                        maxWidth: 520,
                        margin: '60px auto 0',
                        padding: 40,
                        background: '#121212',
                        borderRadius: 12,
                        border: '1px solid #222',
                    }}
                >
                    <Compass
                        size={48}
                        color="#1db954"
                        style={{
                            marginBottom: 16,
                        }}
                    />

                    <h3
                        style={{
                            fontSize: 20,
                            marginBottom: 8,
                        }}
                    >
                        Build Your Music Library
                    </h3>

                    <p
                        style={{
                            color: '#aaa',
                            fontSize: 14,
                            lineHeight: 1.5,
                            marginBottom: 24,
                        }}
                    >
                        Create or save some movie playlists
                        first. We'll use those movies to find
                        similar soundtracks for you.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/search')
                        }
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: '#1db954',
                            color: '#000',
                            border: 0,
                            borderRadius: 24,
                            padding: '12px 24px',
                            fontWeight: 700,
                        }}
                    >
                        <Search size={16} />
                        Search Movies
                    </button>
                </div>
            </div>
        );
    }

    /*
     * The ML API gives recommendations grouped by
     * each movie in the user's library.
     *
     * Flatten them and remove duplicates.
     */
    const uniqueRecommendations =
        new Map<string, MovieRecommendation>();

    recommendations.recommendations.forEach(
        (group) => {
            group.recommendations.forEach(
                (recommendation) => {
                    const key =
                        `${recommendation.movieName}-${recommendation.year}`;

                    const existing =
                        uniqueRecommendations.get(key);

                    if (
                        !existing ||
                        recommendation.score >
                            existing.score
                    ) {
                        uniqueRecommendations.set(
                            key,
                            recommendation
                        );
                    }
                }
            );
        }
    );

    /*
     * Sort by similarity score and show
     * the top 10 unique movies.
     */
    const recommendationList =
        Array.from(
            uniqueRecommendations.values()
        )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, 10);

    return (
        <div className="page-container">
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 12,
                }}
            >
                <h2
                    style={{
                        fontSize: 24,
                        margin: 0,
                    }}
                >
                    Recommended For You
                </h2>

                <button
                    type="button"
                    onClick={() =>
                        void loadRecommendations()
                    }
                    disabled={loading}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#222',
                        color: '#fff',
                        border: '1px solid #444',
                        borderRadius: 20,
                        padding: '8px 14px',
                        cursor: loading
                            ? 'default'
                            : 'pointer',
                    }}
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            <p
                style={{
                    color: '#888',
                    marginBottom: 24,
                }}
            >
                Based on the movies in your created and
                saved playlists.
            </p>

            {recommendationList.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: 40,
                        background: '#121212',
                        borderRadius: 12,
                        border: '1px solid #222',
                    }}
                >
                    <p
                        style={{
                            color: '#888',
                        }}
                    >
                        We couldn't find similar movies
                        yet. Try adding more movies to your
                        library.
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 16,
                    }}
                >
                    {recommendationList.map(
                        (recommendation) => (
                            <div
                                key={`${recommendation.movieName}-${recommendation.year}`}
                                style={{
                                    background:
                                        '#141414',
                                    borderRadius: 12,
                                    padding: 20,
                                    border:
                                        '1px solid #222',
                                }}
                            >
                                <h3
                                    style={{
                                        margin:
                                            '0 0 8px',
                                        fontSize: 18,
                                    }}
                                >
                                    {
                                        recommendation.movieName
                                    }
                                </h3>

                                <p
                                    style={{
                                        color: '#888',
                                        margin:
                                            '0 0 12px',
                                        fontSize: 14,
                                    }}
                                >
                                    Year:{' '}
                                    {
                                        recommendation.year
                                    }
                                </p>

                                {recommendation.genres.length >
                                    0 && (
                                    <div
                                        style={{
                                            display:
                                                'flex',
                                            flexWrap:
                                                'wrap',
                                            gap: 6,
                                            marginBottom:
                                                12,
                                        }}
                                    >
                                        {recommendation.genres.map(
                                            (genre) => (
                                                <span
                                                    key={
                                                        genre
                                                    }
                                                    style={{
                                                        background:
                                                            '#222',
                                                        color:
                                                            '#bbb',
                                                        padding:
                                                            '4px 8px',
                                                        borderRadius:
                                                            12,
                                                        fontSize:
                                                            11,
                                                    }}
                                                >
                                                    {
                                                        genre
                                                    }
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}

                                {recommendation.artists.length >
                                    0 && (
                                    <p
                                        style={{
                                            color:
                                                '#999',
                                            fontSize:
                                                13,
                                            lineHeight:
                                                1.5,
                                            margin:
                                                '8px 0 0',
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    '#ccc',
                                            }}
                                        >
                                            Artists:
                                        </strong>{' '}
                                        {
                                            recommendation.artists
                                                .slice(
                                                    0,
                                                    4
                                                )
                                                .join(
                                                    ', '
                                                )
                                        }
                                    </p>
                                )}

                                <div
                                    style={{
                                        marginTop: 16,
                                        color:
                                            '#1db954',
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}
                                >
                                    Match:{' '}
                                    {(
                                        recommendation.score *
                                        100
                                    ).toFixed(1)}
                                    %
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};