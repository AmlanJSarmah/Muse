import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Song } from '../types/api';

interface PlayerContextValue {
    queue: Song[];
    currentTrack: Song | null;
    currentIndex: number;
    setQueue: (songs: Song[], startIndex?: number) => void;
    playTrack: (song: Song, queue?: Song[]) => void;
    next: () => void;
    previous: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const PlayerProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [queue, setQueueState] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const setQueue = (songs: Song[], startIndex = 0) => {
        setQueueState(songs);
        setCurrentIndex(Math.max(0, Math.min(startIndex, Math.max(songs.length - 1, 0))));
    };
    const playTrack = (song: Song, songs = queue) => {
        const index = songs.findIndex((candidate) => candidate.youtubeVideoId === song.youtubeVideoId);
        if (index >= 0) { setQueueState(songs); setCurrentIndex(index); }
        else { setQueueState([song, ...songs]); setCurrentIndex(0); }
    };
    const next = () => setCurrentIndex((i) => queue.length ? (i + 1) % queue.length : 0);
    const previous = () => setCurrentIndex((i) => queue.length ? (i - 1 + queue.length) % queue.length : 0);

    const value = useMemo(() => ({ queue, currentTrack: queue[currentIndex] ?? null, currentIndex, setQueue, playTrack, next, previous }), [queue, currentIndex]);
    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
    return context;
};
