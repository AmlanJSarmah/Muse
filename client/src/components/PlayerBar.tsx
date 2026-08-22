import React, { useState } from 'react';
import YouTube, { type YouTubeProps, type YouTubePlayer } from 'react-youtube';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const PlayerBar: React.FC = () => {
    const { currentTrack, next, previous } = usePlayer();
    const [isPlaying, setIsPlaying] = useState(true);
    const [playerRef, setPlayerRef] = useState<YouTubePlayer | null>(null);
    if (!currentTrack) return null;
    const onPlayerReady: YouTubeProps['onReady'] = (event) => { setPlayerRef(event.target); event.target.playVideo(); setIsPlaying(true); };
    const togglePlay = () => { if (!playerRef) return; if (isPlaying) { playerRef.pauseVideo(); setIsPlaying(false); } else { playerRef.playVideo(); setIsPlaying(true); } };
    return <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#121212', borderTop: '1px solid #282828', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>{currentTrack.thumbnailUrl && <img src={currentTrack.thumbnailUrl} alt={currentTrack.title} style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover' }} />}<div><div style={{ fontWeight: 600, fontSize: 14 }}>{currentTrack.title}</div><div style={{ color: '#b3b3b3', fontSize: 12 }}>{currentTrack.artist}</div></div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><button type="button" onClick={previous} style={{ background: 'none', border: 0, color: '#b3b3b3', cursor: 'pointer' }}><SkipBack size={20} /></button><button type="button" onClick={togglePlay} style={{ background: '#fff', border: 0, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{isPlaying ? <Pause size={18} color="#000" /> : <Play size={18} color="#000" />}</button><button type="button" onClick={next} style={{ background: 'none', border: 0, color: '#b3b3b3', cursor: 'pointer' }}><SkipForward size={20} /></button></div>
        <div style={{ display: 'none' }}><YouTube videoId={currentTrack.youtubeVideoId} opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }} onReady={onPlayerReady} onEnd={next} /></div>
    </div>;
};
