import React, { createContext, useState, useContext, type ReactNode } from 'react';

interface VideoContextType {
    isGenerating: boolean;
    notification: { type: 'success' | 'error', message: string } | null;
    clearNotification: () => void;
    generateVideo: (
        token: string,
        backendUrl: string,
        payload: {
            user: any;
            metodo: string;
            frase: string | null;
            images: string[];
            autoPhrase: boolean;
            customPhrase: string;
        }
    ) => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const clearNotification = () => setNotification(null);

    const generateVideo = async (
        token: string,
        backendUrl: string,
        payload: {
            user: any;
            metodo: string;
            frase: string | null;
            images: string[];
            autoPhrase: boolean;
            customPhrase: string;
        }
    ) => {
        setIsGenerating(true);
        setNotification(null);

        try {
            // 1. Salvar requisição no backend
            const saveResponse = await fetch(`${backendUrl}/api/video-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    metodo: payload.metodo,
                    frase: payload.frase,
                    num_images: payload.images.length
                })
            });

            if (!saveResponse.ok) {
                if (saveResponse.status === 403) {
                    setNotification({
                        type: 'error',
                        message: 'Sessão expirada. Por favor, faça login novamente.'
                    });
                    return;
                }
                throw new Error('Erro ao salvar requisição');
            }

            const { request } = await saveResponse.json();
            console.log('Requisição salva:', request);

            // 2. Acionar n8n via proxy do backend
            const n8nPayload: any = {
                request_id: request.id,
                user: payload.user?.id || 'anonymous',
                metodo: payload.metodo,
                images: payload.images.map(img => img.split(',')[1])
            };

            if (!payload.autoPhrase) {
                n8nPayload.frase = payload.customPhrase;
            }

            const n8nResponse = await fetch(`${backendUrl}/api/trigger-n8n`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(n8nPayload),
            });

            if (!n8nResponse.ok) {
                if (n8nResponse.status === 403) {
                    setNotification({
                        type: 'error',
                        message: 'Sessão expirada. Por favor, faça login novamente.'
                    });
                    return;
                }
                throw new Error('Falha ao iniciar geração do vídeo');
            }

            const result = await n8nResponse.json();

            if (result.result && result.result.complete === 'true') {
                setNotification({
                    type: 'success',
                    message: 'O seus vídeos foi adicionado a sua galeria com sucesso.'
                });
            } else {
                setNotification({
                    type: 'success',
                    message: 'Solicitação enviada! Aguarde o processamento.'
                });
            }

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
        <VideoContext.Provider value={{ isGenerating, generateVideo, notification, clearNotification }}>
            {children}
        </VideoContext.Provider>
    );
};

export const useVideo = () => {
    const context = useContext(VideoContext);
    if (context === undefined) {
        throw new Error('useVideo must be used within a VideoProvider');
    }
    return context;
};
