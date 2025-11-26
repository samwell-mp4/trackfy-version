import React from 'react';
import { Button } from '@components/common/Button';

interface SidebarProps {
    activeView: 'create' | 'gallery';
    onNavigate: (view: 'create' | 'gallery') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
    return (
        <div className="dashboard-sidebar">
            <div className="sidebar-nav">
                <Button
                    variant={activeView === 'create' ? 'primary' : 'outline'}
                    fullWidth
                    onClick={() => onNavigate('create')}
                    className="sidebar-btn"
                >
                    Criar Vídeo
                </Button>
                <Button
                    variant={activeView === 'gallery' ? 'primary' : 'outline'}
                    fullWidth
                    onClick={() => onNavigate('gallery')}
                    className="sidebar-btn"
                >
                    Galeria
                </Button>
            </div>
        </div>
    );
};
