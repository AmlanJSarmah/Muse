import React, { useState } from 'react';
import type { Playlist } from '../types/api';
import { playlistService } from '../services/apiClient';
import { useToast } from '../context/ToastContext';

interface SavePlaylistModalProps {
    playlist: Playlist;
    isOpen: boolean;
    onClose: () => void;
}

export const SavePlaylistModal: React.FC<SavePlaylistModalProps> = ({ playlist, isOpen, onClose }) => {
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await playlistService.savePlaylist(playlist.id);
            showToast('Playlist saved to your library!', 'success');
            onClose();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to save playlist.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
            <div style={{ backgroundColor: '#181818', padding: 24, borderRadius: 8, width: 380, color: '#fff' }}>
                <h3 style={{ margin: '0 0 10px' }}>Save to My Library</h3>
                <p style={{ color: '#aaa', marginBottom: 20 }}>
                    Save <strong>{playlist.name}</strong> to your account?
                </p>

                <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={submitting}
                    style={{ width: '100%', padding: 10, background: '#1db954', border: 'none', borderRadius: 4, color: '#000', fontWeight: 'bold' }}
                >
                    {submitting ? 'Saving...' : 'Save Playlist'}
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    style={{ width: '100%', background: 'none', border: 'none', color: '#888', marginTop: 12, cursor: 'pointer' }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
