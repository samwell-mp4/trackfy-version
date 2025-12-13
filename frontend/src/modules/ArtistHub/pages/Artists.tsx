import React, { useEffect, useState } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { CreateArtistModal } from '../components/CreateArtistModal';
import './Artists.css'; // We'll reuse or create a simple CSS

interface Artist {
    id: string;
    name: string;
    bio?: string;
    image_url?: string;
    full_name?: string;
    social_links?: {
        spotify?: string;
        instagram?: string;
        youtube?: string;
    };
}

export const Artists: React.FC = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadArtists();
    }, []);

    const loadArtists = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await artistHubService.getArtists();
            setArtists(data);
        } catch (error: any) {
            console.error('Error loading artists:', error);
            setError(error.message || 'Erro ao carregar artistas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="artists-page">
            <div className="page-header">
                <h1>🎤 Gerenciar Artistas</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Novo Artista
                </Button>
            </div>

            {error && (
                <div style={{ padding: '15px', background: '#ff444433', border: '1px solid #ff4444', borderRadius: '8px', marginBottom: '20px', color: '#ff8888' }}>
                    <strong>Erro:</strong> {error}
                </div>
            )}

            {loading ? (
                <p>Carregando...</p>
            ) : (
                <div className="artists-list-container">
                    {artists.length === 0 && (
                        <div className="empty-state">
                            <p>Nenhum artista cadastrado.</p>
                        </div>
                    )}

                    <div className="artists-list">
                        {artists.map(artist => (
                            <div
                                key={artist.id}
                                className="artist-list-item"
                                onClick={() => window.location.href = `/artist-hub/artists/${artist.id}/dashboard`}
                            >
                                <div className="artist-info-main">
                                    <div className="artist-avatar-small">
                                        {artist.image_url ? <img src={artist.image_url} alt={artist.name} /> : '👤'}
                                    </div>
                                    <div>
                                        <h3>{artist.name}</h3>
                                        <span className="artist-role-badge">Artista</span>
                                    </div>
                                </div>

                                <div className="artist-stats-preview">
                                    <div className="stat-pill">
                                        <span>🎵 0 Releases</span>
                                    </div>
                                    <div className="stat-pill">
                                        <span>📅 0 Eventos</span>
                                    </div>
                                </div>

                                <div className="artist-actions-arrow">
                                    ➝
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <CreateArtistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadArtists}
            />
        </div>
    );
};
