import React, { useState } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import './CreateTrackModal.css'; // Reusing modal styles

interface CreateArtistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateArtistModal: React.FC<CreateArtistModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [fullName, setFullName] = useState('');
    const [socials, setSocials] = useState({
        spotify: '',
        instagram: '',
        youtube: '',
        apple: ''
    });
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            setError('O nome do artista é obrigatório.');
            return;
        }

        try {
            setLoading(true);
            await artistHubService.createArtist({
                name,
                bio,
                full_name: fullName,
                social_links: socials
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar artista');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Novo Artista</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome Artístico *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: The Beatles"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Bio (Opcional)</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Breve descrição..."
                            rows={3}
                        />
                    </div>

                    <div className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                        <span>{showAdvanced ? '▼' : '▶'}</span> Opções Avançadas (ISRC & Redes)
                    </div>

                    {showAdvanced && (
                        <div className="advanced-options">
                            <div className="form-group">
                                <label>Nome Completo (Civil)</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Para registro de ISRC"
                                />
                                <small>Importante para cadastro em associações.</small>
                            </div>

                            <div className="form-group">
                                <label>Spotify URL</label>
                                <input
                                    type="text"
                                    value={socials.spotify}
                                    onChange={(e) => setSocials({ ...socials, spotify: e.target.value })}
                                    placeholder="https://open.spotify.com/artist/..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Instagram URL</label>
                                <input
                                    type="text"
                                    value={socials.instagram}
                                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                                    placeholder="https://instagram.com/..."
                                />
                            </div>

                            <div className="form-group">
                                <label>YouTube Channel</label>
                                <input
                                    type="text"
                                    value={socials.youtube}
                                    onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Artista'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
