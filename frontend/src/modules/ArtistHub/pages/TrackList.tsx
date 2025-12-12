import React, { useEffect, useState } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { useNavigate } from 'react-router-dom';
import { CreateTrackModal } from '../components/CreateTrackModal';

interface Track {
    id: string;
    title: string;
    status: string;
    release_date: string;
    artists?: { name: string };
}

export const TrackList: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        try {
            setLoading(true);
            const data = await artistHubService.getTracks();
            setTracks(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="track-list-page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>🎵 Músicas & Projetos</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Nova Música
                </Button>
            </div>

            {loading && <p>Carregando...</p>}
            {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

            {!loading && !error && tracks.length === 0 && (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px', background: '#1e1e1e', borderRadius: '8px' }}>
                    <p>Nenhuma música encontrada.</p>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Crie seu primeiro projeto para começar.</p>
                </div>
            )}

            <div className="tracks-grid" style={{ display: 'grid', gap: '15px' }}>
                {tracks.map(track => (
                    <div key={track.id} className="track-card" style={{ background: '#1e1e1e', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>{track.title}</h3>
                            <span style={{ color: '#888', fontSize: '0.85rem' }}>
                                {track.artists?.name || 'Artista Desconhecido'} • {track.status}
                            </span>
                        </div>
                        <Button variant="outline" onClick={() => navigate(`/artist-hub/tracks/${track.id}`)}>
                            Abrir Dashboard
                        </Button>
                    </div>
                ))}
            </div>

            <CreateTrackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadTracks}
            />
        </div>
    );
};
