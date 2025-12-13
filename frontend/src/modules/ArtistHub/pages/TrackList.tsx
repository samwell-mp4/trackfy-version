import React, { useEffect, useState } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { useNavigate } from 'react-router-dom';
import './TrackList.css';

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
            <div className="page-header">
                <h1>🎵 Músicas & Projetos</h1>
                <Button onClick={() => navigate('/artist-hub/organizer')}>
                    + Nova Música
                </Button>
            </div>

            {loading && <p>Carregando...</p>}
            {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

            {!loading && !error && tracks.length === 0 && (
                <div className="empty-state">
                    <p>Nenhuma música encontrada.</p>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Crie seu primeiro projeto para começar.</p>
                </div>
            )}

            <div className="tracks-grid">
                {tracks.map(track => (
                    <div key={track.id} className="track-card">
                        <div className="track-info">
                            <h3>{track.title}</h3>
                            <span className="track-meta">
                                {track.artists?.name || 'Artista Desconhecido'} • {track.status}
                            </span>
                        </div>
                        <Button variant="outline" onClick={() => navigate(`/artist-hub/tracks/${track.id}`)}>
                            Abrir Dashboard
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};
