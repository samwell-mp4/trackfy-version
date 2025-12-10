import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useVideo } from '@contexts/VideoContext';
import { Button } from '@components/common/Button';
import { Modal } from '@components/common/Modal';
import { Toggle } from '@components/common/Toggle';
import { ImageUpload } from '@components/dashboard/ImageUpload';

export const CreateVideo: React.FC = () => {
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [autoPhrase, setAutoPhrase] = useState(true);
    const [customPhrase, setCustomPhrase] = useState('');
    const { isGenerating, generateVideo } = useVideo();
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleImageSelect = (base64: string) => {
        setImages(prev => [...prev, base64]);
        setIsModalOpen(false);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerateVideo = async () => {
        if (images.length === 0) {
            setNotification({ type: 'error', message: 'Adicione pelo menos uma imagem.' });
            return;
        }

        if (!autoPhrase && !customPhrase.trim()) {
            setNotification({ type: 'error', message: 'Digite as frases para o vídeo.' });
            return;
        }

        setNotification(null);

        const backendUrl = import.meta.env.DEV ? '' : 'https://saas-video-saas-app.o9g2gq.easypanel.host';
        const token = localStorage.getItem('videosia_token');

        if (!token) {
            setNotification({ type: 'error', message: 'Usuário não autenticado' });
            return;
        }

        await generateVideo(
            token,
            backendUrl,
            {
                user,
                metodo: autoPhrase ? 'Automatico' : 'Manual',
                frase: autoPhrase ? null : customPhrase,
                images,
                autoPhrase,
                customPhrase
            },
            {
                onSuccess: (message) => {
                    setNotification({ type: 'success', message });
                    setImages([]);
                    setCustomPhrase('');
                },
                onError: (message) => {
                    setNotification({ type: 'error', message });
                },
                onLogout: () => {
                    logout();
                    setNotification({
                        type: 'error',
                        message: 'Sessão expirada. Por favor, faça login novamente.'
                    });
                }
            }
        );
    };

    return (
        <div className="dashboard-card create-video-card">
            <div className="card-header">
                <h2>Criar Novo Vídeo</h2>
                <p>Configure seu vídeo abaixo</p>
            </div>

            <div className="create-video-grid">
                <div className="video-settings-column">
                    <div className="settings-group">
                        <div className="setting-item">
                            <span className="setting-label">Frase Automática</span>
                            <Toggle
                                checked={autoPhrase}
                                onChange={setAutoPhrase}
                                label={autoPhrase ? 'Ativado' : 'Desativado'}
                                disabled={isGenerating}
                            />
                        </div>

                        {!autoPhrase && (
                            <div className="custom-phrase-input">
                                <label className="input-label">Digite suas frases</label>
                                <textarea
                                    className="phrase-textarea"
                                    placeholder="Digite aqui as frases que você quer no vídeo..."
                                    value={customPhrase}
                                    onChange={(e) => setCustomPhrase(e.target.value)}
                                    rows={4}
                                    disabled={isGenerating}
                                />
                                <span className="input-helper">
                                    Essas frases serão usadas para gerar o conteúdo do vídeo.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="video-media-column">
                    <div className="images-section">
                        <div className="section-header">
                            <h3>Imagens Selecionadas ({images.length})</h3>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsModalOpen(true)}
                                disabled={isGenerating}
                            >
                                + Adicionar Imagem
                            </Button>
                        </div>

                        {images.length > 0 ? (
                            <div className="image-grid">
                                {images.map((img, index) => (
                                    <div key={index} className="image-preview">
                                        <img src={img} alt={`Preview ${index + 1}`} />
                                        <button
                                            className="remove-image-btn"
                                            onClick={() => removeImage(index)}
                                            disabled={isGenerating}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>Nenhuma imagem selecionada</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="action-footer">
                <Button
                    fullWidth
                    size="lg"
                    onClick={handleGenerateVideo}
                    isLoading={isGenerating}
                    disabled={images.length === 0 || isGenerating}
                >
                    {isGenerating ? 'Gerando Vídeo...' : 'Gerar Vídeo'}
                </Button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Adicionar Imagem"
            >
                <ImageUpload onImageSelect={handleImageSelect} />
            </Modal>
        </div>
    );
};
