import React, { createContext, useState, useContext, type ReactNode } from 'react';

interface VideoContextType {
    isGenerating: boolean;
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
        },
        callbacks: {
            onSuccess: (message: string) => void;
            onError: (message: string) => void;
            onLogout: () => void;
        }
    ) => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isGenerating, setIsGenerating] = useState(false);

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
        },
        callbacks: {
            onSuccess: (message: string) => void;
            onError: (message: string) => void;
            onLogout: () => void;
        }
    ) => {
        setIsGenerating(true);
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
                    callbacks.onLogout();
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
                    callbacks.onLogout();
                    return;
                }
                throw new Error('Falha ao iniciar geração do vídeo');
            }

            const result = await n8nResponse.json();

            if (result.result && result.result.complete === 'true') {
                callbacks.onSuccess('O seus vídeos foi adicionado a sua galeria com sucesso.');
            } else {
                callbacks.onSuccess('Solicitação enviada! Aguarde o processamento.');
            }

        } catch (error) {
            console.error('Error generating video:', error);
            callbacks.onError('Erro ao enviar solicitação. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <VideoContext.Provider value={{ isGenerating, generateVideo }}>
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
