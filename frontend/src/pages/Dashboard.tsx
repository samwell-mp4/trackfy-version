import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/common/Button';
import { Modal } from '@components/common/Modal';
import { Toggle } from '@components/common/Toggle';
import { ImageUpload } from '@components/dashboard/ImageUpload';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [autoPhrase, setAutoPhrase] = useState(true);
    const [customPhrase, setCustomPhrase] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleImageSelect = (base64: string) => {
        setImages(prev => [...prev, base64]);
        setIsModalOpen(false);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerateVideo = async () => {
        // Validação: Sempre precisa de imagens
        if (images.length === 0) {
            setNotification({ type: 'error', message: 'Adicione pelo menos uma imagem.' });
            return;
        }

        // Validação: Se não for automático, precisa da frase
        if (!autoPhrase && !customPhrase.trim()) {
            setNotification({ type: 'error', message: 'Digite as frases para o vídeo.' });
            return;
        }

        setIsGenerating(true);
        setNotification(null);

        try {
            const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL;

            if (!webhookUrl) {
                throw new Error('URL do webhook não configurada');
            }

            // Construção dinâmica do payload
            const payload: any = {
                user: user?.id || 'anonymous',
                metodo: autoPhrase ? 'Automatico' : 'Manual',
                // Remove o prefixo data:image/...;base64, para enviar apenas o hash
                images: images.map(img => img.split(',')[1])
            };

            // Só adiciona o campo frase se for Manual
            if (!autoPhrase) {
                payload.frase = customPhrase;
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Falha ao iniciar geração do vídeo');
            }

            setNotification({
                type: 'success',
                message: 'Solicitação enviada com sucesso! Seu vídeo será gerado em breve.'
            });
            setImages([]);
            setCustomPhrase('');
        } catch (error) {
            console.error('Error generating video:', error);
            setNotification({
                type: 'error',
                message: 'Erro ao enviar solicitação. Tente novamente.'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Bem-vindo, {user?.usuario}!</h1>
                <button onClick={logout} className="logout-btn">
                    Sair
                </button>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-card create-video-card">
                    <div className="card-header">
                        <h2>Criar Novo Vídeo</h2>
                        <p>Configure seu vídeo abaixo</p>
                    </div>

                    <div className="settings-group">
                        <div className="setting-item">
                            <span className="setting-label">Frase Automática</span>
                            <Toggle
                                checked={autoPhrase}
                                onChange={setAutoPhrase}
                                label={autoPhrase ? 'Ativado' : 'Desativado'}
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
                                />
                                <span className="input-helper">
                                    Essas frases serão usadas para gerar o conteúdo do vídeo.
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="images-section">
                        <div className="section-header">
                            <h3>Imagens Selecionadas ({images.length})</h3>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsModalOpen(true)}
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
                            disabled={images.length === 0}
                        >
                            Gerar Vídeo
                        </Button>
                    </div>
                </div>
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
