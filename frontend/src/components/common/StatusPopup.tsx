import React from 'react';
import './StatusPopup.css';

interface StatusPopupProps {
    isVisible: boolean;
    status?: 'idle' | 'generating' | 'success' | 'error';
}

export const StatusPopup: React.FC<StatusPopupProps> = ({ isVisible, status = 'generating' }) => {
    if (!isVisible && status !== 'success') return null;
    if (status === 'idle') return null;

    const isSuccess = status === 'success';

    return (
        <div className={`status-popup ${isSuccess ? 'success' : ''}`}>
            {isSuccess ? (
                <div className="status-icon success">✓</div>
            ) : (
                <div className="status-spinner"></div>
            )}
            <div className="status-content">
                <span className="status-title">
                    {isSuccess ? 'Vídeo Finalizado!' : 'Gerando Vídeo...'}
                </span>
                <span className="status-desc">
                    {isSuccess ? 'Veja na galeria.' : 'Isso pode levar alguns minutos.'}
                </span>
            </div>
        </div>
    );
};
