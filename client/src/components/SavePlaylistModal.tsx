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
    const [name, setName] = useState(playlist.name);
    const [description, setDescription] = useState(playlist.description);
    const [isPublic, setIsPublic] = useState(playlist.isPublic);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await playlistService.savePlaylist({
                ...playlist,
                name,
                description,
                isPublic,
            });
            showToast('Playlist saved to your library!', 'success');
            onClose();
        } catch (err: unknown) {
            let errorMsg = 'Failed to save playlist';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
                errorMsg = axiosErr.response?.data?.error?.message || errorMsg;
            }
            showToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
            <div style={{ backgroundColor: '#181818', padding: 24, borderRadius: 8, width: 380, color: '#fff' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 20 }}>Save to My Library</h3>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Playlist Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 4, border: '1px solid #333', background: '#242424', color: '#fff' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 4, border: '1px solid #333', background: '#242424', color: '#fff' }}
                        />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', margin: '4px 0' }}>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        Make playlist public
                    </label>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ padding: 10, background: '#1db954', border: 'none', borderRadius: 4, color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Playlist'}
                    </button>
                </form>
                <button
                    onClick={onClose}
                    style={{ width: '100%', background: 'none', border: 'none', color: '#888', marginTop: 12, cursor: 'pointer', fontSize: 13 }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};