import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
    MovieSummary,
    Playlist,
    RecommendationItem,
    Song,
} from '../types/api';
import { playlistService, movieService } from '../services/apiClient';

const isMovie = (
    item: RecommendationItem['item']
): item is MovieSummary => {
    return 'year' in item && 'posterUrl' in item;
};

const isPlaylist = (
    item: RecommendationItem['item']
): item is Playlist => {
    return 'songs' in item && 'name' in item;
};

const isSong = (
    item: RecommendationItem['item']
): item is Song => {
    return 'artist' in item && 'youtubeVideoId' in item;
};

export const RecommendationFeed: React.FC = () => {
    const navigate = useNavigate();

    const [recommendations, setRecommendations] = useState<
        RecommendationItem[]
    >([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const [generatingId, setGeneratingId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await playlistService.getRecommendations();

                if (!cancelled) {
                    setRecommendations(response.recommendations);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        'Unable to load recommendations. Please try again.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadRecommendations();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleGeneratePlaylist = async (movieId: string) => {
        try {
            setGeneratingId(movieId);
            setError(null);

            const playlist =
                await movieService.generatePlaylist(movieId);

            navigate(`/playlist/${playlist.id}`);
        } catch (err) {
            setError(
                'Unable to generate playlist. Please try again.'
            );
        } finally {
            setGeneratingId(null);
        }
    };

    if (loading) {
        return (
            <section>
                <h2>Discover & Recommendations</h2>

                <p style={{ color: '#aaa' }}>
                    Loading recommendations...
                </p>
            </section>
        );
    }

    if (error && recommendations.length === 0) {
        return (
            <section>
                <h2>Discover & Recommendations</h2>

                <p style={{ color: '#ff7676' }}>
                    {error}
                </p>
            </section>
        );
    }

    return (
        <section>
            <h2
                style={{
                    textAlign: 'center',
                    marginBottom: '24px',
                }}
            >
                Discover & Recommendations
            </h2>

            {error && (
                <p
                    style={{
                        color: '#ff7676',
                        textAlign: 'center',
                    }}
                >
                    {error}
                </p>
            )}

            {recommendations.length === 0 ? (
                <p
                    style={{
                        color: '#aaa',
                        textAlign: 'center',
                    }}
                >
                    No recommendations available.
                </p>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '24px',
                        width: '100%',
                    }}
                >
                    {recommendations.map((recommendation) => {
                        const item = recommendation.item;

                        let title = 'Recommended Item';
                        let image: string | null = null;
                        let metadata = '';

                        /*
                         * MOVIE
                         */
                        if (
                            recommendation.type === 'movie' &&
                            isMovie(item)
                        ) {
                            title = item.title;
                            image = item.posterUrl;
                            metadata = String(item.year);
                        }

                        /*
                         * PLAYLIST
                         */
                        else if (
                            recommendation.type === 'playlist' &&
                            isPlaylist(item)
                        ) {
                            title = item.name;

                            image =
                                item.movie?.posterUrl ?? null;

                            metadata = 'Playlist';
                        }

                        /*
                         * SONG
                         */
                        else if (
                            recommendation.type === 'song' &&
                            isSong(item)
                        ) {
                            title = item.title;

                            image =
                                item.thumbnailUrl ?? null;

                            metadata = item.artist;
                        }

                        const isGenerating =
                            generatingId === recommendation.id;

                        return (
                            <article
                                key={`${recommendation.type}-${recommendation.id}`}
                                style={{
                                    backgroundColor: '#141414',
                                    border: '1px solid #292929',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    transition:
                                        'transform 0.2s ease, border-color 0.2s ease',
                                }}
                            >
                                {/* IMAGE */}
                                {image && (
                                    <img
                                        src={image}
                                        alt={`${title} poster`}
                                        style={{
                                            width: '100%',
                                            aspectRatio: '16 / 10',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />
                                )}

                                {/* CARD CONTENT */}
                                <div
                                    style={{
                                        padding: '18px',
                                    }}
                                >
                                    {/* TYPE */}
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: '#888',
                                            textTransform:
                                                'uppercase',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {recommendation.type}
                                    </div>

                                    {/* MATCH SCORE */}
                                    <div
                                        style={{
                                            color: '#1db954',
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {Math.round(
                                            recommendation.score * 100
                                        )}
                                        % Match
                                    </div>

                                    {/* TITLE */}
                                    <h3
                                        style={{
                                            margin: '0 0 6px',
                                            fontSize: '21px',
                                        }}
                                    >
                                        {title}
                                    </h3>

                                    {/* YEAR / ARTIST / PLAYLIST */}
                                    {metadata && (
                                        <p
                                            style={{
                                                margin:
                                                    '0 0 12px',
                                                color: '#999',
                                                fontSize: '14px',
                                            }}
                                        >
                                            {metadata}
                                        </p>
                                    )}

                                    {/* REASON */}
                                    <p
                                        style={{
                                            margin: '0 0 16px',
                                            color: '#bbb',
                                            lineHeight: 1.5,
                                            fontSize: '14px',
                                        }}
                                    >
                                        {recommendation.reason}
                                    </p>

                                    {/* GENERATE PLAYLIST
                                        ONLY FOR MOVIES */}
                                    {recommendation.type ===
                                        'movie' &&
                                        isMovie(item) && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleGeneratePlaylist(
                                                        item.id
                                                    )
                                                }
                                                disabled={
                                                    isGenerating
                                                }
                                                style={{
                                                    width: '100%',
                                                    padding:
                                                        '11px 14px',
                                                    border: 'none',
                                                    borderRadius:
                                                        '7px',
                                                    background:
                                                        isGenerating
                                                            ? '#166b36'
                                                            : '#1db954',
                                                    color: '#000',
                                                    fontWeight: 700,
                                                    cursor:
                                                        isGenerating
                                                            ? 'wait'
                                                            : 'pointer',
                                                    display: 'flex',
                                                    alignItems:
                                                        'center',
                                                    justifyContent:
                                                        'center',
                                                    gap: '8px',
                                                }}
                                            >
                                                {isGenerating && (
                                                    <span
                                                        style={{
                                                            width:
                                                                '14px',
                                                            height:
                                                                '14px',
                                                            border:
                                                                '2px solid rgba(0,0,0,0.3)',
                                                            borderTopColor:
                                                                '#000',
                                                            borderRadius:
                                                                '50%',
                                                            display:
                                                                'inline-block',
                                                            animation:
                                                                'recommendation-spin 0.7s linear infinite',
                                                        }}
                                                    />
                                                )}

                                                {isGenerating
                                                    ? 'Generating...'
                                                    : 'Generate Playlist'}
                                            </button>
                                        )}

                                    {/* PLAYLIST ACTION */}
                                    {recommendation.type ===
                                        'playlist' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/playlist/${recommendation.id}`
                                                )
                                            }
                                            style={{
                                                width: '100%',
                                                padding:
                                                    '11px 14px',
                                                border: 'none',
                                                borderRadius:
                                                    '7px',
                                                background:
                                                    '#ffffff',
                                                color: '#000',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            View Playlist
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <style>
                {`
                    @keyframes recommendation-spin {
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}
            </style>
        </section>
    );
};