import React, { useEffect, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import './Gallery.css';

interface Video {
    id: string;
    name: string;
    thumbnail: string;
    downloadLink: string;
    createdAt: string;
    size: string;
    mimeType?: string;
}

export const Gallery: React.FC = () => {
    const { token, user } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVideos = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use VITE_BACKEND_URL if available, otherwise relative path (proxy in dev, direct in prod)
            const backendUrl = import.meta.env.DEV ? '' : 'https://saas-video-saas-app.o9g2gq.easypanel.host';
            const response = await fetch(`${backendUrl}/api/gallery`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar vídeos');
            }

            const data = await response.json();
            setVideos(data.videos || []);
        } catch (err) {
            console.error('Erro ao buscar vídeos:', err);
            setError('Não foi possível carregar sua galeria no momento.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchVideos();
        }
    }, [token]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatSize = (bytes: string) => {
        const size = parseInt(bytes);
        if (isNaN(size)) return 'N/A';
        const i = Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    };

    return (
        <div className="dashboard-card gallery-card">
            <div className="card-header">
                <div>
                    <h2>Minha Galeria</h2>
                    <p>Seus vídeos gerados e salvos no Google Drive.</p>
                </div>
                <button
                    onClick={fetchVideos}
                    className="refresh-btn"
                    disabled={loading}
                    title="Atualizar lista"
                >
                    🔄
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <p>Carregando vídeos...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchVideos} className="retry-btn">Tentar Novamente</button>
                </div>
            ) : videos.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum vídeo encontrado 📂</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Seus vídeos gerados aparecerão aqui automaticamente.
                    </p>
                    <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-gray-600">
                        <p>Debug Info:</p>
                        <p>User ID: {user?.id}</p>
                        <p>Email: {user?.email}</p>
                    </div>
                </div>
            ) : (
                <div className="gallery-grid">
                    {videos.map((video) => (
                        <div key={video.id} className="video-card">
                            <div className="video-thumbnail">
                                {video.thumbnail ? (
                                    <img src={video.thumbnail} alt={video.name} referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.src.includes('drive.google.com/thumbnail')) {
                                                target.src = `https://drive.google.com/thumbnail?id=${video.id}&sz=w600`;
                                            } else {
                                                target.src = 'https://placehold.co/600x400/png?text=No+Thumbnail';
                                            }
                                        }}
                                    />
                                ) : (
                                    <img src="https://placehold.co/600x400/png?text=Video+Preview" alt="Placeholder" />
                                )}
                            </div>
                            <div className="video-info">
                                <h3 className="video-title" title={video.name}>{video.name}</h3>
                                <div className="video-meta">
                                    <span>📅 {formatDate(video.createdAt)}</span>
                                    <span>💾 {formatSize(video.size)}</span>
                                    <span className="text-xs text-gray-400 block mt-1" title={video.mimeType}>
                                        Type: {video.mimeType?.split('/').pop() || 'Unknown'}
                                    </span>
                                </div>
                                <div className="video-actions">

                                    <a
                                        href={video.downloadLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-download"
                                    >
                                        <span>⬇</span> Baixar
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
