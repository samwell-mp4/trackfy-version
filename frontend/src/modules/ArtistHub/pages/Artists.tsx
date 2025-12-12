import React, { useEffect, useState } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { CreateArtistModal } from '../components/CreateArtistModal';
import './Artists.css'; // We'll reuse or create a simple CSS

interface Artist {
    id: string;
    name: string;
    bio?: string;
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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
                <div className="artists-grid">
                    {artists.length === 0 && (
                        <div className="empty-state">
                            <p>Nenhum artista cadastrado.</p>
                        </div>
                    )}

                    {artists.map(artist => (
                        <div key={artist.id} className="artist-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                <h3>{artist.name}</h3>
                                <span className="artist-avatar">
                                    👤
                                </span>
                            </div>

                            {artist.full_name && (
                                <p className="artist-full-name">
                                    <strong>Nome Civil:</strong> {artist.full_name}
                                </p>
                            )}

                            <p className="artist-bio">
                                {artist.bio || 'Sem biografia.'}
                            </p>

                            <div className="social-links">
                                {artist.social_links?.spotify && (
                                    <a href={artist.social_links.spotify} target="_blank" rel="noopener noreferrer">🟢 Spotify</a>
                                )}
                                {artist.social_links?.instagram && (
                                    <a href={artist.social_links.instagram} target="_blank" rel="noopener noreferrer">📸 Insta</a>
                                )}
                                {artist.social_links?.youtube && (
                                    <a href={artist.social_links.youtube} target="_blank" rel="noopener noreferrer">▶️ YT</a>
                                )}
                            </div>
                        </div>
                    ))}
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
