import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Image, Youtube, Music } from 'lucide-react';
import './BottomNav.css';

interface BottomNavProps {
    activeView: 'create' | 'gallery' | 'highlights';
    onNavigate: (view: 'create' | 'gallery' | 'highlights') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
    const navigate = useNavigate();

    return (
        <div className="bottom-nav-container">
            <div className="bottom-nav">
                <button
                    className={`nav-item ${activeView === 'create' ? 'active' : ''}`}
                    onClick={() => onNavigate('create')}
                >
                    <div className="icon-wrapper">
                        <Video size={24} />
                    </div>
                    <span>Criar</span>
                </button>

                <button
                    className={`nav-item ${activeView === 'gallery' ? 'active' : ''}`}
                    onClick={() => onNavigate('gallery')}
                >
                    <div className="icon-wrapper">
                        <Image size={24} />
                    </div>
                    <span>Galeria</span>
                </button>

                <div className="nav-center-action">
                    <button
                        className="artist-hub-fab"
                        onClick={() => navigate('/artist-hub')}
                    >
                        <Music size={28} />
                    </button>
                    <span>Artist Hub</span>
                </div>

                <button
                    className={`nav-item ${activeView === 'highlights' ? 'active' : ''}`}
                    onClick={() => onNavigate('highlights')}
                >
                    <div className="icon-wrapper">
                        <Youtube size={24} />
                    </div>
                    <span>Destaques</span>
                </button>

                {/* Placeholder for symmetry or future feature */}
                <button
                    className="nav-item"
                    onClick={() => { }} // Future: Profile or Settings
                    style={{ opacity: 0.5 }}
                >
                    <div className="icon-wrapper">
                        <div className="avatar-placeholder">👤</div>
                    </div>
                    <span>Perfil</span>
                </button>
            </div>
        </div>
    );
};
