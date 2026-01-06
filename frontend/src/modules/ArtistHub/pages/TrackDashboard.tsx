
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { useAudioPlayer } from '../../../contexts/AudioPlayerContext'; // Correct import placement
import { TrackChecklists } from '../components/TrackChecklists';
import { ParticipantSelector } from '../components/ParticipantSelector';
import { RoyaltiesTab } from '../components/RoyaltiesTab';
import { ContractsTab } from '../components/ContractsTab';
import './TrackDashboard.css';

interface TrackData {
    id: string;
    title: string;
    version: string;
    status: string;
    release_date: string;
    metadata: {
        subtitle?: string;
        genre?: string;
        cover_url?: string;
        explicit_content?: boolean;
        participants?: any[];
        rights?: any[];
        audio_file_url?: string;
        duration?: number;
        isrc?: string;
        upc?: string;
        bpm?: string;
        key?: string;
        label?: string;
        language?: string;
        release_type?: string;
        lyrics?: string;
        share_token?: string;
        share_password?: string;
        files?: {
            wav?: string;
            mp3?: string;
            stems?: string;
            docs?: Array<{ name: string; url: string; date: string }>;
        };
    };
    artists: {
        name: string;
    };
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button className="copy-btn" onClick={handleCopy} title="Copiar">
            {copied ? '✅' : '📋'}
        </button>
    );
};



export const TrackDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Restore useParams
    const { playTrack } = useAudioPlayer(); // Hook usage
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'lyrics' | 'files' | 'team' | 'docs' | 'checklists' | 'financial' | 'contracts'>('overview');

    const [track, setTrack] = useState<TrackData | null>(null);
    const [originalTrack, setOriginalTrack] = useState<TrackData | null>(null); // For dirty checking
    const [isDirty, setIsDirty] = useState(false);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [showShareModal, setShowShareModal] = useState(false);
    const [sharePassword, setSharePassword] = useState('');

    // Participant Selector State
    const [showParticipantSelector, setShowParticipantSelector] = useState(false);

    // Refs for file inputs
    const coverInputRef = useRef<HTMLInputElement>(null);
    const wavInputRef = useRef<HTMLInputElement>(null);
    const mp3InputRef = useRef<HTMLInputElement>(null);
    const stemsInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) loadTrack(id);
    }, [id]);

    // Check for changes
    useEffect(() => {
        if (track && originalTrack) {
            const hasChanges = JSON.stringify(track) !== JSON.stringify(originalTrack);
            setIsDirty(hasChanges);
        }
    }, [track, originalTrack]);

    const loadTrack = async (trackId: string) => {
        try {
            const data = await artistHubService.getTrack(trackId);
            if (!data.metadata.files) {
                data.metadata.files = { docs: [] };
            }
            setTrack(data);
            setOriginalTrack(JSON.parse(JSON.stringify(data))); // Deep copy
        } catch (error) {
            console.error('Error loading track:', error);
            alert('Erro ao carregar dados da música.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!track || !id) return;
        setSaving(true);
        try {
            await artistHubService.updateTrack(id, {
                title: track.title,
                release_date: track.release_date,
                status: track.status,
                metadata: track.metadata
            });

            // Sync with Agenda if release date changed
            if (track.release_date && track.release_date !== originalTrack?.release_date) {
                try {
                    const events = await artistHubService.getEvents(undefined, undefined, id);
                    const releaseEvent = events.find((e: any) => e.type === 'release');

                    if (releaseEvent) {
                        // Update existing event
                        await artistHubService.updateEvent(releaseEvent.id, {
                            start_time: new Date(track.release_date).toISOString(),
                            end_time: new Date(new Date(track.release_date).setHours(new Date(track.release_date).getHours() + 1)).toISOString(),
                            title: `Lançamento: ${track.title}`
                        });
                    } else {
                        // Create new event
                        await artistHubService.createEvent({
                            title: `Lançamento: ${track.title}`,
                            type: 'release',
                            start_time: new Date(track.release_date).toISOString(),
                            end_time: new Date(new Date(track.release_date).setHours(new Date(track.release_date).getHours() + 1)).toISOString(),
                            status: 'planned',
                            priority: 'high',
                            track_id: id,
                            metadata: {
                                releaseType: track.metadata.release_type || 'single'
                            }
                        });
                    }
                } catch (syncError) {
                    console.error('Error syncing with agenda:', syncError);
                    // Don't block success message if sync fails, but maybe warn?
                }
            }

            setOriginalTrack(JSON.parse(JSON.stringify(track)));
            setIsDirty(false);
            alert('Alterações salvas com sucesso! 💾');
        } catch (error) {
            console.error('Error saving track:', error);
            alert('Erro ao salvar alterações.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (originalTrack) {
            setTrack(JSON.parse(JSON.stringify(originalTrack)));
            setIsDirty(false);
        }
    };

    const updateMetadata = (field: string, value: any) => {
        if (!track) return;
        setTrack({
            ...track,
            metadata: {
                ...track.metadata,
                [field]: value
            }
        });
    };

    const updateTrackField = (field: string, value: any) => {
        if (!track) return;
        setTrack({
            ...track,
            [field]: value
        });
    };

    const handleDeleteFile = async (type: 'wav' | 'mp3' | 'stems') => {
        if (!track || !id) return;
        if (!window.confirm('Tem certeza que deseja remover este arquivo?')) return;

        try {
            const updatedMetadata = { ...track.metadata };
            if (!updatedMetadata.files) updatedMetadata.files = {};

            // @ts-ignore
            updatedMetadata.files[type] = null;
            if (type === 'mp3') updatedMetadata.audio_file_url = undefined;

            await artistHubService.updateTrack(id, { metadata: updatedMetadata });

            const newTrack = { ...track, metadata: updatedMetadata };
            setTrack(newTrack);
            setOriginalTrack(JSON.parse(JSON.stringify(newTrack)));

            alert('Arquivo removido com sucesso!');
        } catch (error) {
            console.error('Erro ao remover arquivo:', error);
            alert('Erro ao remover arquivo.');
        }
    };

    const downloadFile = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async (file: File, type: 'cover' | 'wav' | 'mp3' | 'stems' | 'doc') => {
        if (!track || !id) return;
        setUploading(true);

        try {
            const result: any = await artistHubService.uploadFile(file);
            const fileUrl = result.url;

            const updatedMetadata = { ...track.metadata };

            if (type === 'cover') {
                updatedMetadata.cover_url = fileUrl;
            } else if (type === 'doc') {
                if (!updatedMetadata.files?.docs) updatedMetadata.files = { ...updatedMetadata.files, docs: [] };
                updatedMetadata.files.docs?.push({
                    name: file.name,
                    url: fileUrl,
                    date: new Date().toISOString()
                });
            } else {
                if (!updatedMetadata.files) updatedMetadata.files = {};
                // @ts-ignore
                updatedMetadata.files[type] = fileUrl;
                if (type === 'mp3') updatedMetadata.audio_file_url = fileUrl;
            }

            // Auto-save on upload for now, or we could just update state and let user save.
            // User requested explicit save, but uploads usually should be persisted immediately or it gets complicated.
            // Let's persist upload immediately to avoid "upload but didn't save" issues.
            await artistHubService.updateTrack(id, { metadata: updatedMetadata });

            const newTrack = { ...track, metadata: updatedMetadata };
            setTrack(newTrack);
            setOriginalTrack(JSON.parse(JSON.stringify(newTrack))); // Sync original

            alert('Upload realizado com sucesso!');

        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro ao fazer upload. Verifique o tamanho do arquivo (Max 35MB).');
        } finally {
            setUploading(false);
        }
    };

    // Share Logic
    const generateShareLink = () => {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        updateMetadata('share_token', token);
        // We don't save immediately, user must click save.
    };

    const copyShareLink = () => {
        if (!track?.metadata.share_token) return;
        const link = `${window.location.origin}/shared/${track.metadata.share_token}`;
        navigator.clipboard.writeText(link);
        alert('Link copiado! 🔗');
    };

    if (loading) return <div className="loading-spinner">Carregando...</div>;
    if (!track) return <div className="error-message">Música não encontrada.</div>;

    const renderOverview = () => (
        <div className="overview-grid">
            <div className="cover-section">
                <img
                    src={track.metadata.cover_url || 'https://via.placeholder.com/300'}
                    alt="Cover Art"
                    className="cover-art-large"
                />
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Button
                        variant="outline"
                        style={{ width: '100%' }}
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Enviando...' : '📸 Alterar Capa'}
                    </Button>
                    <input
                        type="file"
                        ref={coverInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'cover')}
                    />
                </div>
            </div>
            <div className="metadata-grid">
                {/* Basic Info */}
                <div className="meta-item">
                    <span className="meta-label">Título <CopyButton text={track.title} /></span>
                    <input
                        className="meta-input"
                        value={track.title}
                        onChange={(e) => updateTrackField('title', e.target.value)}
                    />
                </div>
                <div className="meta-item">
                    <span className="meta-label">Subtítulo/Versão</span>
                    <input
                        className="meta-input"
                        value={track.metadata.subtitle || ''}
                        placeholder="Ex: Radio Edit"
                        onChange={(e) => updateMetadata('subtitle', e.target.value)}
                    />
                </div>

                {/* Codes */}
                <div className="meta-item">
                    <span className="meta-label">ISRC <CopyButton text={track.metadata.isrc || ''} /></span>
                    <input
                        className="meta-input"
                        value={track.metadata.isrc || ''}
                        placeholder="BR-XXX-XX-XXXXX"
                        onChange={(e) => updateMetadata('isrc', e.target.value)}
                    />
                </div>
                <div className="meta-item">
                    <span className="meta-label">UPC/EAN <CopyButton text={track.metadata.upc || ''} /></span>
                    <input
                        className="meta-input"
                        value={track.metadata.upc || ''}
                        placeholder="0000000000000"
                        onChange={(e) => updateMetadata('upc', e.target.value)}
                    />
                </div>

                {/* Musical Details */}
                <div className="meta-item">
                    <span className="meta-label">Gênero</span>
                    <input
                        className="meta-input"
                        value={track.metadata.genre || ''}
                        onChange={(e) => updateMetadata('genre', e.target.value)}
                    />
                </div>
                <div className="meta-item">
                    <span className="meta-label">BPM</span>
                    <input
                        className="meta-input"
                        value={track.metadata.bpm || ''}
                        placeholder="120"
                        onChange={(e) => updateMetadata('bpm', e.target.value)}
                    />
                </div>
                <div className="meta-item">
                    <span className="meta-label">Tom (Key)</span>
                    <input
                        className="meta-input"
                        value={track.metadata.key || ''}
                        placeholder="Cm"
                        onChange={(e) => updateMetadata('key', e.target.value)}
                    />
                </div>
                <div className="meta-item">
                    <span className="meta-label">Idioma</span>
                    <input
                        className="meta-input"
                        value={track.metadata.language || ''}
                        placeholder="Português"
                        onChange={(e) => updateMetadata('language', e.target.value)}
                    />
                </div>

                {/* Release Info */}
                <div className="meta-item">
                    <span className="meta-label">Data de Lançamento</span>
                    <input
                        type="date"
                        className="meta-input"
                        value={track.release_date ? track.release_date.split('T')[0] : ''}
                        onChange={(e) => updateTrackField('release_date', e.target.value)}
                    />
                </div>
                <div className="meta-item">
                    <span className="meta-label">Gravadora/Selo</span>
                    <input
                        className="meta-input"
                        value={track.metadata.label || ''}
                        placeholder="Nome da Gravadora"
                        onChange={(e) => updateMetadata('label', e.target.value)}
                    />
                </div>
                <div className="meta-item">
                    <span className="meta-label">Tipo de Lançamento</span>
                    <select
                        className="meta-input"
                        value={track.metadata.release_type || 'single'}
                        onChange={(e) => updateMetadata('release_type', e.target.value)}
                        style={{ background: '#1e293b', border: 'none', color: 'white' }}
                    >
                        <option value="single">Single</option>
                        <option value="ep">EP</option>
                        <option value="album">Álbum</option>
                    </select>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Conteúdo Explícito</span>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                checked={track.metadata.explicit_content === true}
                                onChange={() => updateMetadata('explicit_content', true)}
                            /> Sim
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                checked={track.metadata.explicit_content === false}
                                onChange={() => updateMetadata('explicit_content', false)}
                            /> Não
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLyrics = () => (
        <div className="lyrics-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Letra da Música</h3>
                <Button size="sm" onClick={() => navigator.clipboard.writeText(track.metadata.lyrics || '')}>
                    📋 Copiar Letra
                </Button>
            </div>
            <textarea
                className="lyrics-textarea"
                placeholder="Digite ou cole a letra da música aqui..."
                value={track.metadata.lyrics || ''}
                onChange={(e) => updateMetadata('lyrics', e.target.value)}
            />
        </div>
    );

    const renderFiles = () => (
        <div className="files-list">
            {/* WAV */}
            <div className="file-item">
                <div className="file-info">
                    <div className="file-icon">🎵</div>
                    <div>
                        <div className="file-name">Master Final (WAV)</div>
                        <div className="file-meta">
                            {track.metadata.files?.wav ? 'Arquivo disponível' : 'Nenhum arquivo enviado'}
                        </div>
                    </div>
                </div>
                <div className="file-actions">
                    <input
                        type="file"
                        ref={wavInputRef}
                        style={{ display: 'none' }}
                        accept=".wav,audio/wav,audio/x-wav,audio/wave"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'wav')}
                    />
                    {track.metadata.files?.wav ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button variant="outline" size="sm" onClick={() => downloadFile(track.metadata.files?.wav!, `${track.title}_master.wav`)}>
                                ⬇️ Baixar
                            </Button>
                            <Button variant="outline" size="sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDeleteFile('wav')}>
                                🗑️
                            </Button>
                        </div>
                    ) : (
                        <Button variant="primary" size="sm" onClick={() => wavInputRef.current?.click()} disabled={uploading}>
                            ☁️ Upload WAV
                        </Button>
                    )}
                </div>
            </div>

            {/* MP3 */}
            <div className="file-item">
                <div className="file-info">
                    <div className="file-icon">🎧</div>
                    <div>
                        <div className="file-name">Streaming (MP3)</div>
                        <div className="file-meta">
                            {track.metadata.files?.mp3 ? 'Arquivo disponível' : 'Nenhum arquivo enviado'}
                        </div>
                    </div>
                </div>
                <div className="file-actions">
                    <input
                        type="file"
                        ref={mp3InputRef}
                        style={{ display: 'none' }}
                        accept=".mp3,audio/mpeg,audio/mp3"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'mp3')}
                    />
                    {track.metadata.files?.mp3 ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button variant="outline" size="sm" onClick={() => downloadFile(track.metadata.files?.mp3!, `${track.title}.mp3`)}>
                                ⬇️ Baixar
                            </Button>
                            <Button variant="outline" size="sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDeleteFile('mp3')}>
                                🗑️
                            </Button>
                        </div>
                    ) : (
                        <Button variant="primary" size="sm" onClick={() => mp3InputRef.current?.click()} disabled={uploading}>
                            ☁️ Upload MP3
                        </Button>
                    )}
                </div>
            </div>

            {/* STEMS */}
            <div className="file-item">
                <div className="file-info">
                    <div className="file-icon">🎹</div>
                    <div>
                        <div className="file-name">Stems / Multitrack</div>
                        <div className="file-meta">
                            {track.metadata.files?.stems ? 'Arquivo disponível' : 'Nenhum arquivo enviado'}
                        </div>
                    </div>
                </div>
                <div className="file-actions">
                    <input
                        type="file"
                        ref={stemsInputRef}
                        style={{ display: 'none' }}
                        accept=".zip,.rar,.7z"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'stems')}
                    />
                    {track.metadata.files?.stems ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button variant="outline" size="sm" onClick={() => downloadFile(track.metadata.files?.stems!, `${track.title}_stems.zip`)}>
                                ⬇️ Baixar
                            </Button>
                            <Button variant="outline" size="sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDeleteFile('stems')}>
                                🗑️
                            </Button>
                        </div>
                    ) : (
                        <Button variant="primary" size="sm" onClick={() => stemsInputRef.current?.click()} disabled={uploading}>
                            ☁️ Upload ZIP
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderTeam = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Participantes & Royalties</h3>
                <Button size="sm" onClick={() => setShowParticipantSelector(true)}>➕ Adicionar Participante</Button>
            </div>
            <table className="team-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Função</th>
                        <th>Split (%)</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {track.metadata.rights?.map((right: any, index: number) => (
                        <tr key={index}>
                            <td>
                                <div style={{ fontWeight: 600 }}>{right.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{right.email || 'Sem email'}</div>
                            </td>
                            <td><span className="role-badge">{right.role}</span></td>
                            <td style={{ width: '200px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{right.percentage}%</span>
                                </div>
                                <div className="percentage-bar">
                                    <div className="percentage-fill" style={{ width: `${right.percentage}%` }}></div>
                                </div>
                            </td>
                            <td>
                                <div className="approval-status status-approved">
                                    ✅ Aprovado
                                </div>
                            </td>
                            <td>
                                <Button variant="ghost" size="sm">✏️</Button>
                            </td>
                        </tr>
                    ))}
                    {(!track.metadata.rights || track.metadata.rights.length === 0) && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                                Nenhum participante registrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderDocs = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Documentos</h3>
                <input
                    type="file"
                    ref={docInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'doc')}
                />
                <Button size="sm" onClick={() => docInputRef.current?.click()} disabled={uploading}>
                    ➕ Upload Documento
                </Button>
            </div>
            <div className="files-list">
                {track.metadata.files?.docs?.map((doc: any, index: number) => (
                    <div className="file-item" key={index}>
                        <div className="file-info">
                            <div className="file-icon">📄</div>
                            <div>
                                <div className="file-name">{doc.name}</div>
                                <div className="file-meta">Enviado em {new Date(doc.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="file-actions">
                            <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                                👁️ Visualizar
                            </Button>
                        </div>
                    </div>
                ))}
                {(!track.metadata.files?.docs || track.metadata.files.docs.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        Nenhum documento enviado.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="track-dashboard-container">
            <div className="td-header">
                <div className="td-title-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <Button variant="ghost" onClick={() => navigate('/artist-hub/tracks')}>← Voltar</Button>
                        <select
                            className={`td-status-selector status-${track.status}`}
                            value={track.status}
                            onChange={(e) => {
                                updateTrackField('status', e.target.value);
                                setIsDirty(true);
                            }}
                        >
                            <option value="idea">💡 Ideia</option>
                            <option value="pre_production">🎹 Pré-Produção</option>
                            <option value="recording">🎙️ Gravação</option>
                            <option value="mixing">🎚️ Mixagem</option>
                            <option value="mastering">📀 Masterização</option>
                            <option value="release_ready">🚀 Pronto (Ready)</option>
                            <option value="released">✅ Lançado</option>
                        </select>
                    </div>
                    <h1>{track.title}</h1>
                    <div className="td-subtitle">
                        {track.artists?.name} • {track.version} • {track.metadata.subtitle || 'Sem subtítulo'}
                    </div>
                    {track.metadata.files?.mp3 && (
                        <div className="header-player" style={{ marginTop: '1rem', width: '100%', maxWidth: '500px' }}>
                            <Button
                                variant="outline"
                                size="sm"
                                style={{ marginTop: '0.5rem', width: '100%' }}
                                onClick={() => playTrack({
                                    id: track.id,
                                    url: track.metadata.files?.mp3!,
                                    title: track.title,
                                    artist: track.artists?.name || 'Artista',
                                    coverUrl: track.metadata.cover_url
                                })}
                            >
                                🔽 Tocar no Player (Rodapé)
                            </Button>
                        </div>
                    )}
                </div>
                <div className="td-actions">
                    <Button variant="outline" onClick={() => setShowShareModal(true)}>
                        🔗 Compartilhar
                    </Button>
                </div>
            </div>

            <div className="td-tabs">
                <button
                    className={`td-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Visão Geral
                </button>
                <button
                    className={`td-tab ${activeTab === 'lyrics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('lyrics')}
                >
                    Letra
                </button>
                <button
                    className={`td-tab ${activeTab === 'files' ? 'active' : ''}`}
                    onClick={() => setActiveTab('files')}
                >
                    Arquivos & Áudio
                </button>
                <button
                    className={`td-tab ${activeTab === 'team' ? 'active' : ''}`}
                    onClick={() => setActiveTab('team')}
                >
                    Equipe & Royalties
                </button>
                <button
                    className={`td-tab ${activeTab === 'docs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('docs')}
                >
                    Documentos
                </button>
                <button
                    className={`td-tab ${activeTab === 'financial' ? 'active' : ''}`}
                    onClick={() => setActiveTab('financial')}
                >
                    💰 Financeiro (Royalties)
                </button>
                <button
                    className={`td-tab ${activeTab === 'contracts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contracts')}
                >
                    📜 Contratos
                </button>
                <button
                    className={`td-tab ${activeTab === 'checklists' ? 'active' : ''}`}
                    onClick={() => setActiveTab('checklists')}
                >
                    Processos & Checklists
                </button>
            </div>

            <div className="td-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'lyrics' && renderLyrics()}
                {activeTab === 'files' && renderFiles()}
                {activeTab === 'team' && renderTeam()}
                {activeTab === 'docs' && renderDocs()}
                {activeTab === 'financial' && <RoyaltiesTab track={track} onUpdate={handleSave} />}
                {activeTab === 'contracts' && <ContractsTab track={track} />}
                {activeTab === 'checklists' && track && <TrackChecklists trackId={track.id} trackTitle={track.title} />}
            </div>

            {/* Floating Save Bar */}
            {isDirty && (
                <div className="floating-save-bar">
                    <div className="save-bar-content">
                        <span>⚠️ Você tem alterações não salvas</span>
                        <div className="save-bar-actions">
                            <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Salvando...' : '💾 Salvar Alterações'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>🔗 Compartilhar Música</h2>
                        <p>Gere um link seguro para compartilhar essa música com clientes ou parceiros.</p>

                        <div style={{ margin: '1.5rem 0' }}>
                            <label className="meta-label">Link de Acesso</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    className="meta-input"
                                    style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}
                                    readOnly
                                    value={track.metadata.share_token ? `${window.location.origin}/shared/${track.metadata.share_token}` : 'Nenhum link gerado'}
                                />
                                <Button onClick={copyShareLink} disabled={!track.metadata.share_token}>Copiar</Button>
                            </div>
                            {!track.metadata.share_token && (
                                <Button variant="outline" size="sm" style={{ marginTop: '0.5rem' }} onClick={generateShareLink}>
                                    🔄 Gerar Novo Link
                                </Button>
                            )}
                        </div>

                        <div style={{ margin: '1.5rem 0' }}>
                            <label className="meta-label">Senha de Acesso (Opcional)</label>
                            <input
                                className="meta-input"
                                style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}
                                placeholder="Definir senha..."
                                type="password"
                                value={sharePassword || track.metadata.share_password || ''}
                                onChange={(e) => {
                                    setSharePassword(e.target.value);
                                    updateMetadata('share_password', e.target.value);
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <Button variant="ghost" onClick={() => setShowShareModal(false)}>Fechar</Button>
                            <Button variant="primary" onClick={() => {
                                handleSave(); // Save token/password
                                setShowShareModal(false);
                            }}>Salvar & Compartilhar</Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Participant Selector */}
            {
                showParticipantSelector && (
                    <ParticipantSelector
                        isOpen={showParticipantSelector}
                        onClose={() => setShowParticipantSelector(false)}
                        onSelect={(artist, role, split) => {
                            const newParticipant = {
                                name: artist.name,
                                email: artist.email_contact,
                                role: role,
                                percentage: split,
                                artist_id: artist.id
                            };
                            const currentRights = track?.metadata.rights || [];
                            updateMetadata('rights', [...currentRights, newParticipant]);
                            setIsDirty(true);
                        }}
                    />
                )
            }
        </div >
    );
};
