import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { CareerRoadmap } from '../components/CareerRoadmap';
import './artist-dashboard-view.css';

interface ArtistData {
    id: string;
    name: string;
    bio?: string;
    image_url?: string;
    social_links?: any;
    // Extended fields
    full_name?: string;
    cpf?: string;
    rg?: string;
    phone?: string;
    email_contact?: string;
    address?: string;
    artist_type?: string;
    responsible_name?: string;
    responsible_company?: string;
    responsible_phone?: string;
    responsible_email?: string;
    responsible_percentage?: number;
    share_email?: string;
    birth_date?: string;
}

const CopyButton: React.FC<{ text: string, label?: string }> = ({ text, label }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button className="ad-copy-btn" onClick={handleCopy} title="Copiar">
            {label && <span className="label">{label}:</span>}
            <span className="text">{text || '-'}</span>
            <span className="icon">{copied ? '✅' : '📋'}</span>
        </button>
    );
};

export const ArtistDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [tracks, setTracks] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Parallel fetching
            const [artistData, tracksData, eventsData] = await Promise.all([
                artistHubService.getArtists().then(list => list.find((a: any) => a.id === id)),
                artistHubService.getTracks(id),
                artistHubService.getEvents(undefined, undefined, undefined) // TODO: Filter by artist_id
            ]);

            setArtist(artistData);
            setTracks(tracksData);
            const artistTrackIds = tracksData.map((t: any) => t.id);
            const artistEvents = eventsData.filter((e: any) => e.track_id && artistTrackIds.includes(e.track_id));
            setEvents(artistEvents);

        } catch (error) {
            console.error('Error loading artist dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (updates: Partial<ArtistData>) => {
        if (!artist) return;
        try {
            // Optimistic update
            setArtist({ ...artist, ...updates });
            setIsEditing(false);

            await artistHubService.updateArtist(artist.id, updates);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Failed to update artist:', error);
            alert('Erro ao atualizar perfil.');
            loadData(); // Revert
        }
    };

    const [activeTab, setActiveTab] = useState<'overview' | 'career'>('overview');

    if (loading) return <div className="loading-spinner">Carregando...</div>;
    if (!artist) return <div className="error-message">Artista não encontrado.</div>;

    return (
        <div className="artist-dashboard">
            {/* Header */}
            <div className="ad-header">
                <div className="ad-profile">
                    <div className="ad-avatar">
                        {artist.image_url ? <img src={artist.image_url} alt={artist.name} /> : '👤'}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1>{artist.name}</h1>
                            <span className={`artist-type-badge ${artist.artist_type}`}>
                                {artist.artist_type === 'signed' ? '🏢 Produtora' : '🦅 Avulso'}
                            </span>
                        </div>
                        <p className="ad-bio">{artist.bio || 'Sem biografia definida.'}</p>

                        {/* Quick Info */}
                        <div className="ad-quick-info">
                            <CopyButton text={artist.phone || ''} label="📞" />
                            <CopyButton text={artist.email_contact || ''} label="✉️" />
                            <CopyButton text={artist.share_email || ''} label="📤 Share" />
                        </div>

                        <div className="ad-socials">
                            {artist.social_links?.instagram && (
                                <a href={artist.social_links.instagram} target="_blank" rel="noreferrer">📸 Instagram</a>
                            )}
                            {artist.social_links?.spotify && (
                                <a href={artist.social_links.spotify} target="_blank" rel="noreferrer">🎵 Spotify</a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="ad-actions">
                    <Button variant="outline" onClick={() => navigate('/artist-hub/artists')}>
                        Voltar
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                        ✏️ Editar Perfil
                    </Button>
                </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="ad-tabs" style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '0.5rem'
            }}>
                <button
                    className={`ad-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'overview' ? '#8b5cf6' : '#94a3b8',
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'overview' ? '2px solid #8b5cf6' : '2px solid transparent'
                    }}
                >
                    Visão Geral
                </button>
                <button
                    className={`ad-tab-btn ${activeTab === 'career' ? 'active' : ''}`}
                    onClick={() => setActiveTab('career')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'career' ? '#8b5cf6' : '#94a3b8',
                        fontSize: '1rem',
                        fontWeight: 600,
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'career' ? '2px solid #8b5cf6' : '2px solid transparent'
                    }}
                >
                    🚀 Carreira & Checklist
                </button>
            </div>

            {activeTab === 'career' ? (
                <CareerRoadmap />
            ) : (
                <>
                    {/* Personal & Contract Info */}
                    <div className="ad-info-grid">
                        <div className="ad-card info-card">
                            <h3>📄 Dados Cadastrais</h3>
                            <div className="info-row">
                                <CopyButton text={artist.full_name || ''} label="Nome Civil" />
                            </div>
                            <div className="info-row-group">
                                <CopyButton text={artist.cpf || ''} label="CPF" />
                                <CopyButton text={artist.rg || ''} label="RG" />
                            </div>
                            <div className="info-row">
                                <span className="label">Endereço:</span>
                                <span className="value">{artist.address || 'Não informado'}</span>
                            </div>
                        </div>

                        <div className="ad-card info-card">
                            <h3>🤝 Responsável / Empresa</h3>
                            {artist.responsible_name || artist.responsible_company ? (
                                <>
                                    <div className="info-row">
                                        <span className="label">Empresa/Resp:</span>
                                        <span className="value">{artist.responsible_company || artist.responsible_name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Contato:</span>
                                        <span className="value">{artist.responsible_name}</span>
                                    </div>
                                    <div className="info-row-group">
                                        <CopyButton text={artist.responsible_phone || ''} label="Tel" />
                                        <CopyButton text={artist.responsible_email || ''} label="Email" />
                                    </div>
                                </>
                            ) : (
                                <p className="empty-text">Nenhum responsável vinculado.</p>
                            )}
                        </div>
                        <div className="ad-card info-card">
                            <h3>🌎 Principais Cidades</h3>
                            <div className="info-row">
                                <span className="label">1. São Paulo, BR</span>
                                <span className="value">15k ouvintes</span>
                            </div>
                            <div className="info-row">
                                <span className="label">2. Rio de Janeiro, BR</span>
                                <span className="value">12k ouvintes</span>
                            </div>
                            <div className="info-row">
                                <span className="label">3. Lisboa, PT</span>
                                <span className="value">8k ouvintes</span>
                            </div>
                            <div className="info-row">
                                <span className="label">4. Belo Horizonte, BR</span>
                                <span className="value">6k ouvintes</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="ad-stats-grid">
                        <div className="ad-stat-card">
                            <h3>Ouvintes Mensais</h3>
                            <div className="stat-value">85.2K</div>
                            <div className="stat-trend positive">↑ 8% este mês</div>
                        </div>
                        <div className="ad-stat-card">
                            <h3>Streams Totais</h3>
                            <div className="stat-value">1.2M</div>
                            <div className="stat-trend positive">↑ 12% este mês</div>
                        </div>
                        <div className="ad-stat-card">
                            <h3>Seguidores</h3>
                            <div className="stat-value">45.3K</div>
                            <div className="stat-trend positive">↑ 5% este mês</div>
                        </div>
                        <div className="ad-stat-card">
                            <h3>Alcance de Playlist</h3>
                            <div className="stat-value">250K</div>
                            <div className="stat-trend positive">↑ 15% este mês</div>
                        </div>
                        <div className="ad-stat-card">
                            <h3>Taxa de Engajamento</h3>
                            <div className="stat-value">4.8%</div>
                            <div className="stat-trend neutral">− 0.2% este mês</div>
                        </div>
                        <div className="ad-stat-card">
                            <h3>Próximo Lançamento</h3>
                            <div className="stat-value text-sm">
                                {events.find(e => e.type === 'release' && new Date(e.start_time) > new Date())?.title || 'Nenhum agendado'}
                            </div>
                        </div>
                    </div>

                    <div className="ad-content-grid">
                        {/* Releases Section */}
                        <div className="ad-section">
                            <div className="section-header">
                                <h2>Lançamentos Recentes</h2>
                                <Button size="sm" onClick={() => navigate('/artist-hub/new-release')}>+ Novo</Button>
                            </div>
                            <div className="ad-list">
                                {tracks.length === 0 && <p className="empty-text">Nenhuma música lançada.</p>}
                                {tracks.map(track => (
                                    <div key={track.id} className="ad-list-item" onClick={() => navigate(`/artist-hub/tracks/${track.id}`)}>
                                        <div className="item-icon">🎵</div>
                                        <div className="item-info">
                                            <h4>{track.title}</h4>
                                            <span>{track.version} • {new Date(track.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className={`status-badge status-${track.status}`}>
                                            {track.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Agenda Section */}
                        <div className="ad-section">
                            <div className="section-header">
                                <h2>Agenda</h2>
                                <Button size="sm" onClick={() => navigate('/artist-hub/agenda')}>Ver Completa</Button>
                            </div>
                            <div className="ad-list">
                                {events.length === 0 && <p className="empty-text">Nenhum evento próximo.</p>}
                                {events.map(event => (
                                    <div key={event.id} className="ad-list-item">
                                        <div className="item-date">
                                            <span className="day">{new Date(event.start_time).getDate()}</span>
                                            <span className="month">{new Date(event.start_time).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                        </div>
                                        <div className="item-info">
                                            <h4>{event.title}</h4>
                                            <span>{event.type} • {event.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )
            }
            {/* Edit Profile Modal */}
            {
                isEditing && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Editar Perfil</h2>
                                <button className="close-btn" onClick={() => setIsEditing(false)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <form
                                    id="edit-artist-form"
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        const updates = Object.fromEntries(formData.entries());
                                        // Handle nested or specific fields if needed
                                        await handleSaveProfile({
                                            ...artist,
                                            ...updates,
                                            // Specific mapping for social links if inputs are separate
                                        });
                                    }}
                                >
                                    <div className="form-group">
                                        <label>Nome Artístico</label>
                                        <input name="name" defaultValue={artist.name} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Bio</label>
                                        <textarea name="bio" defaultValue={artist.bio} rows={3} />
                                    </div>

                                    <h4>Dados Pessoais</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nome Civil</label>
                                            <input name="full_name" defaultValue={artist.full_name} />
                                        </div>
                                        <div className="form-group">
                                            <label>CPF</label>
                                            <input name="cpf" defaultValue={artist.cpf} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>RG</label>
                                            <input name="rg" defaultValue={artist.rg} />
                                        </div>
                                        <div className="form-group">
                                            <label>Data Nascimento</label>
                                            <input name="birth_date" type="date" defaultValue={artist.birth_date} />
                                        </div>
                                    </div>

                                    <h4>Contato</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Telefone</label>
                                            <input name="phone" defaultValue={artist.phone} />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Contato</label>
                                            <input name="email_contact" defaultValue={artist.email_contact} />
                                        </div>
                                    </div>

                                    <h4>Responsável / Empresa</h4>
                                    <div className="form-group">
                                        <label>Nome da Empresa ou Responsável</label>
                                        <input name="responsible_company" defaultValue={artist.responsible_company || artist.responsible_name} />
                                    </div>

                                    <div className="form-actions">
                                        <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancelar</Button>
                                        <Button type="submit">Salvar Alterações</Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
