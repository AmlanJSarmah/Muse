import React, { useState, useEffect, useRef } from 'react';
import YouTube, { type YouTubeProps, type YouTubePlayer } from 'react-youtube';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

export const PlayerBar: React.FC = () => {
    const { currentTrack, next, previous } = usePlayer();
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isSeeking, setIsSeeking] = useState<boolean>(false);
    const playerRef = useRef<YouTubePlayer | null>(null);

    const duration = currentTrack?.durationSeconds ?? 0;

    // 100ms smooth polling interval for fluid scrubber motion
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current && isPlaying && !isSeeking) {
                const time = playerRef.current.getCurrentTime();
                if (typeof time === 'number') {
                    setCurrentTime(time);
                }
            }
        }, 100);
        return () => clearInterval(interval);
    }, [isPlaying, isSeeking]);

    if (!currentTrack) return null;

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        event.target.playVideo();
        setIsPlaying(true);
        setCurrentTime(0);
    };

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
        } else {
            playerRef.current.playVideo();
            setIsPlaying(true);
        }
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentTime(Number(e.target.value));
    };

    const handleSeekEnd = (e: React.SyntheticEvent) => {
        setIsSeeking(false);
        const targetTime = Number((e.target as HTMLInputElement).value);
        if (playerRef.current) {
            playerRef.current.seekTo(targetTime, true);
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#121212',
            borderTop: '1px solid #282828',
            padding: '10px 24px',
            display: 'flex',
            flexDirection: 'column',
            color: '#fff',
            zIndex: 1000,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.4)',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Track Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                    {currentTrack.thumbnailUrl && (
                        <img
                            src={currentTrack.thumbnailUrl}
                            alt={currentTrack.title}
                            style={{ width: '45px', height: '45px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                    )}
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{currentTrack.title}</div>
                        <div style={{ color: '#b3b3b3', fontSize: '12px' }}>{currentTrack.artist}</div>
                    </div>
                </div>

                {/* Controls & Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1, maxWidth: '540px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={previous} style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}>
                            <SkipBack size={18} />
                        </button>
                        <button onClick={togglePlay} style={{ background: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            {isPlaying ? <Pause size={16} color="#000" /> : <Play size={16} color="#000" />}
                        </button>
                        <button onClick={next} style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}>
                            <SkipForward size={18} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', fontSize: '11px', color: '#888' }}>
                        <span style={{ minWidth: 28 }}>{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            step="any"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onMouseDown={() => setIsSeeking(true)}
                            onTouchStart={() => setIsSeeking(true)}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekEnd}
                            onTouchEnd={handleSeekEnd}
                            style={{
                                flex: 1,
                                cursor: 'pointer',
                                accentColor: '#1db954',
                                height: '4px',
                                transition: isSeeking ? 'none' : 'all 0.1s linear'
                            }}
                        />
                        <span style={{ minWidth: 28 }}>{formatTime(duration)}</span>
                    </div>
                </div>

                <div style={{ minWidth: '220px' }}></div>
            </div>

            {/* Hidden YouTube Engine */}
            <div style={{ display: 'none' }}>
                <YouTube
                    videoId={currentTrack.youtubeVideoId}
                    opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }}
                    onReady={onPlayerReady}
                    onEnd={next}
                />
            </div>
        </div>
    );
};