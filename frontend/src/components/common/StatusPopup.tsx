import React from 'react';
import './StatusPopup.css';

interface StatusPopupProps {
    isVisible: boolean;
    status?: 'idle' | 'generating' | 'success' | 'error';
}

export const StatusPopup: React.FC<StatusPopupProps & { notification?: { type: 'success' | 'error', message: string } | null }> = ({ isVisible, status = 'generating', notification }) => {
    if (!isVisible && status !== 'success' && !notification) return null;
    if (status === 'idle' && !notification) return null;

    const isSuccess = status === 'success' || notification?.type === 'success';
    const isError = status === 'error' || notification?.type === 'error';

    return (
        <div className={`status-popup ${isSuccess ? 'success' : ''} ${isError ? 'error' : ''}`}>
            {isSuccess ? (
                <div className="status-icon success">✓</div>
            ) : isError ? (
                <div className="status-icon error">✕</div>
            ) : (
                <div className="status-spinner"></div>
            )}
            <div className="status-content">
                <span className="status-title">
                    {notification ? (isSuccess ? 'Sucesso!' : 'Atenção') : (isSuccess ? 'Vídeo Finalizado!' : 'Gerando Vídeo...')}
                </span>
                <span className="status-desc">
                    {notification ? notification.message : (isSuccess ? 'Veja na galeria.' : 'Isso pode levar alguns minutos.')}
                </span>
            </div>
        </div>
    );
};
