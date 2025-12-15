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
<<<<<<< HEAD
    const [artists, setArtists] = useState<any[]>([]);
=======
>>>>>>> 2515de915935a0055c33748ef425b911b5c2085d
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

<<<<<<< HEAD
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArtist, setSelectedArtist] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tracksData, artistsData] = await Promise.all([
                artistHubService.getTracks(),
                artistHubService.getArtists()
            ]);
            setTracks(tracksData);
            setArtists(artistsData);
=======
    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        try {
            setLoading(true);
            const data = await artistHubService.getTracks();
            setTracks(data);
>>>>>>> 2515de915935a0055c33748ef425b911b5c2085d
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
    // Metrics Calculation
    const metrics = {
        total: tracks.length,
        released: tracks.filter(t => t.status === 'released').length,
        in_progress: tracks.filter(t => ['pre_production', 'production', 'mixing', 'mastering'].includes(t.status)).length
    };

    // Filtering & Sorting
    const filteredTracks = tracks
        .filter(track => {
            const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesArtist = selectedArtist ? track.artists?.name === selectedArtist : true; // Note: track.artists might be object or array, simplified here assuming mapped name or single artist
            // If backend returns artist_id, better to filter by that. But UI shows name. Assuming track.artists.name matches value.
            // Let's assume we filter by artist ID if available or just name for now.
            // Actually, let's verify track structure. Usually it has an ID.
            // For now, let's match loose to ensure it works.
            const matchesStatus = selectedStatus ? track.status === selectedStatus : true;
            return matchesSearch && matchesArtist && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
            if (sortBy === 'oldest') return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime();
            if (sortBy === 'az') return a.title.localeCompare(b.title);
            return 0;
        });

    const handleStatusChange = async (trackId: string, newStatus: string) => {
        // Optimistic Update
        const updatedTracks = tracks.map(t =>
            t.id === trackId ? { ...t, status: newStatus } : t
        );
        setTracks(updatedTracks);

        try {
            await artistHubService.updateTrack(trackId, { status: newStatus });
        } catch (error) {
            console.error('Failed to update status', error);
            loadData(); // Revert on error
        }
    };

    const getProgress = (status: string) => {
        switch (status) {
            case 'idea': return 10;
            case 'pre_production': return 30;
            case 'recording': return 50;
            case 'mixing': return 70;
            case 'mastering': return 90;
            case 'released': return 100;
            default: return 0;
        }
    };

    const handleShare = (track: Track) => {
        const link = `${window.location.origin}/artist-hub/tracks/${track.id}`;
        navigator.clipboard.writeText(link);
        alert(`Link copiado! 🔗`);
    };

    const handleDelete = async (trackId: string) => {
        if (window.confirm('Tem certeza que deseja excluir?')) {
            try {
                // Mock delete for now as service might need update
                const updatedTracks = tracks.filter(t => t.id !== trackId);
                setTracks(updatedTracks);
            } catch (error) {
                alert('Erro ao excluir.');
            }
        }
    };

=======
>>>>>>> 2515de915935a0055c33748ef425b911b5c2085d
    return (
        <div className="track-list-page">
            <div className="page-header">
                <h1>🎵 Músicas & Projetos</h1>
                <Button onClick={() => navigate('/artist-hub/organizer')}>
                    + Nova Música
                </Button>
            </div>

<<<<<<< HEAD
            {/* Metrics Row */}
            <div className="tl-metrics-row">
                <div className="tl-metric-card">
                    <span className="label">Total de Projetos</span>
                    <span className="value">{metrics.total}</span>
                </div>
                <div className="tl-metric-card">
                    <span className="label">Lançados</span>
                    <span className="value">{metrics.released}</span>
                </div>
                <div className="tl-metric-card">
                    <span className="label">Em Produção</span>
                    <span className="value">{metrics.in_progress}</span>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="tl-filter-toolbar">
                <div className="search-box">
                    <span className="icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar música..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    value={selectedArtist}
                    onChange={(e) => setSelectedArtist(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos os Artistas</option>
                    {artists.map(a => (
                        <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                </select>

                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos os Status</option>
                    <option value="draft">Rascunho</option>
                    <option value="pre_production">Pré-Produção</option>
                    <option value="production">Produção</option>
                    <option value="mixing">Mixagem</option>
                    <option value="mastering">Masterização</option>
                    <option value="released">Lançado</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                >
                    <option value="newest">Mais Recentes</option>
                    <option value="oldest">Mais Antigos</option>
                    <option value="az">A-Z</option>
                </select>
            </div>

            {loading && <p>Carregando...</p>}
            {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

            {!loading && !error && filteredTracks.length === 0 && (
                <div className="empty-state">
                    <p>Nenhuma música encontrada com estes filtros.</p>
=======
            {loading && <p>Carregando...</p>}
            {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

            {!loading && !error && tracks.length === 0 && (
                <div className="empty-state">
                    <p>Nenhuma música encontrada.</p>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Crie seu primeiro projeto para começar.</p>
>>>>>>> 2515de915935a0055c33748ef425b911b5c2085d
                </div>
            )}

            <div className="tracks-grid">
<<<<<<< HEAD
                {filteredTracks.map(track => {
                    const progress = getProgress(track.status);
                    return (
                        <div key={track.id} className="track-card">
                            <div className="track-card-inner">
                                <div className="track-info-section">
                                    <h3>{track.title}</h3>
                                    <div className="track-meta-row">
                                        <span className="artist-name">{track.artists?.name || 'Artista Desconhecido'}</span>
                                        <span className="separator">•</span>
                                        <div className="status-selector-wrapper">
                                            <select
                                                className={`mini-status-selector status-${track.status}`}
                                                value={track.status}
                                                onChange={(e) => handleStatusChange(track.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="idea">💡 Ideia</option>
                                                <option value="pre_production">🎹 Pré-Produção</option>
                                                <option value="recording">🎙️ Gravação</option>
                                                <option value="mixing">🎚️ Mixagem</option>
                                                <option value="mastering">📀 Masterização</option>
                                                <option value="released">🚀 Lançado</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="track-actions-section">
                                    <div className="quick-actions-hover">
                                        <button className="icon-btn" onClick={() => handleShare(track)} title="Compartilhar">🔗</button>
                                        <button className="icon-btn delete-btn" onClick={() => handleDelete(track.id)} title="Excluir">🗑️</button>
                                    </div>
                                    <Button variant="outline" onClick={() => navigate(`/artist-hub/tracks/${track.id}`)}>
                                        Abrir Dashboard
                                    </Button>
                                </div>
                            </div>

                            {/* Progress Line */}
                            <div className="track-progress-line" style={{ width: `${progress}%` }} title={`${progress}% Concluído`} />
                        </div>
                    );
                })}
=======
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
>>>>>>> 2515de915935a0055c33748ef425b911b5c2085d
            </div>
        </div>
    );
};
