import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // Assuming this hook exists

interface VideoContextType {
    isGenerating: boolean;
    generationStatus: 'idle' | 'generating' | 'success' | 'error';
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
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const { token } = useAuth(); // Get token from AuthContext

    const clearNotification = () => {
        setNotification(null);
    };

    const checkStatus = async (requestId: number, currentToken: string, backendUrl: string) => {
        try {
            const response = await fetch(`${backendUrl}/api/video-requests?status=pending`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });

            if (response.ok) {
                const { requests } = await response.json();
                const pendingRequest = requests.find((r: any) => r.id === requestId);

                if (!pendingRequest) {
                    // If not found in pending, assume completed (or check completed list if needed)
                    // For now, if it's gone from pending, we treat as success/done
                    setGenerationStatus('success');
                    setIsGenerating(false);
                    setNotification({
                        type: 'success',
                        message: 'Vídeo finalizado! Veja na galeria.'
                    });
                    setTimeout(() => setGenerationStatus('idle'), 5000);
                    return true;
                }
                // Still pending
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
        return false;
    };

    // Check for any pending requests on mount/login
    useEffect(() => {
        if (!token) return;

        const backendUrl = import.meta.env.DEV ? '' : 'https://saas-video-saas-app.o9g2gq.easypanel.host';

        const checkInitialPending = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/video-requests?status=pending`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const { requests } = await response.json();
                    if (requests && requests.length > 0) {
                        // Found a pending request!
                        const pending = requests[0];
                        setIsGenerating(true);
                        setGenerationStatus('generating');

                        // Start polling for this request
                        const pollInterval = setInterval(async () => {
                            const isDone = await checkStatus(pending.id, token, backendUrl);
                            if (isDone) clearInterval(pollInterval);
                        }, 5000);
                    }
                }
            } catch (error) {
                console.error('Erro ao verificar pendentes iniciais:', error);
            }
        };

        checkInitialPending();
    }, [token]);

    const generateVideo = async (
        tokenArg: string, // Kept for compatibility but we have token from hook too
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
        if (isGenerating) return;

        setIsGenerating(true);
        setGenerationStatus('generating');
        setNotification(null);

        try {
            const saveResponse = await fetch(`${backendUrl}/api/video-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenArg}`
                },
                body: JSON.stringify({
                    metodo: payload.metodo,
                    frase: payload.frase,
                    num_images: payload.images.length
                })
            });

            if (!saveResponse.ok) throw new Error('Erro ao salvar requisição');

            const { request } = await saveResponse.json();

            // Start polling immediately
            const pollInterval = setInterval(async () => {
                const isDone = await checkStatus(request.id, tokenArg, backendUrl);
                if (isDone) clearInterval(pollInterval);
            }, 5000);

            // Trigger N8N
            const n8nPayload: any = {
                request_id: request.id,
                user: payload.user?.id || 'anonymous',
                metodo: payload.metodo,
                images: payload.images.map(img => img.split(',')[1])
            };

            if (!payload.autoPhrase) n8nPayload.frase = payload.customPhrase;

            fetch(`${backendUrl}/api/trigger-n8n`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenArg}`
                },
                body: JSON.stringify(n8nPayload),
            }).catch(console.error);

        } catch (error) {
            console.error('Error generating video:', error);
            setGenerationStatus('error');
            setIsGenerating(false);
            setNotification({ type: 'error', message: 'Erro ao enviar solicitação.' });
        }
    };

    return (
        <VideoContext.Provider value={{ isGenerating, generationStatus, generateVideo, notification, clearNotification }}>
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
