import React, { useState, useEffect } from 'react';
import { Button } from '@components/common/Button';
import { artistHubService } from '../../../services/artistHubService';
import './TrackQuickEditModal.css';

interface TrackQuickEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    track: any;
}

export const TrackQuickEditModal: React.FC<TrackQuickEditModalProps> = ({ isOpen, onClose, onSuccess, track }) => {
    const [title, setTitle] = useState('');
    const [artistId, setArtistId] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [availableArtists, setAvailableArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadArtists();
    }, []);

    useEffect(() => {
        if (track) {
            setTitle(track.title || '');
            setArtistId(track.artist_id || '');
            if (track.release_date) {
                setReleaseDate(track.release_date.split('T')[0]);
            } else {
                setReleaseDate('');
            }
        }
    }, [track, isOpen]);

    const loadArtists = async () => {
        try {
            const data = await artistHubService.getArtists();
            setAvailableArtists(data);
        } catch (error) {
            console.error('Error loading artists:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await artistHubService.updateTrack(track.id, {
                title,
                artist_id: artistId,
                release_date: releaseDate ? new Date(releaseDate).toISOString() : null
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating track:', error);
            alert('Erro ao atualizar música.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !track) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content quick-edit-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Editar Informações Básicas</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Título da Música</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Artista Principal</label>
                        <select
                            value={artistId}
                            onChange={e => setArtistId(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Selecione...</option>
                            {availableArtists.map(artist => (
                                <option key={artist.id} value={artist.id}>
                                    {artist.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Previsão de Lançamento</label>
                        <input
                            type="date"
                            value={releaseDate}
                            onChange={e => setReleaseDate(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="modal-actions">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
