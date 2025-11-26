import React from 'react';

export const Gallery: React.FC = () => {
    return (
        <div className="dashboard-card gallery-card">
            <div className="card-header">
                <h2>Minha Galeria</h2>
                <p>Seus vídeos gerados aparecerão aqui.</p>
            </div>

            <div className="empty-state">
                <p>Galeria em construção... 🚧</p>
                <p className="text-sm text-gray-500 mt-2">
                    Em breve você poderá visualizar seus vídeos do Google Drive aqui.
                </p>
            </div>
        </div>
    );
};
