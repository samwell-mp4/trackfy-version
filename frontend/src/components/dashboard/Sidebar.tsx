import React from 'react';
import { Button } from '@components/common/Button';

interface SidebarProps {
    activeView: 'create' | 'gallery' | 'highlights';
    onNavigate: (view: 'create' | 'gallery' | 'highlights') => void;
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
                    {...({ 'data-variant': activeView === 'create' ? 'primary' : 'outline' } as any)}
                >
                    Criar Vídeo
                </Button>
                <Button
                    variant={activeView === 'gallery' ? 'primary' : 'outline'}
                    fullWidth
                    onClick={() => onNavigate('gallery')}
                    className="sidebar-btn"
                    {...({ 'data-variant': activeView === 'gallery' ? 'primary' : 'outline' } as any)}
                >
                    Galeria
                </Button>
                <Button
                    variant={activeView === 'highlights' ? 'primary' : 'outline'}
                    fullWidth
                    onClick={() => onNavigate('highlights')}
                    className="sidebar-btn"
                    {...({ 'data-variant': activeView === 'highlights' ? 'primary' : 'outline' } as any)}
                >
                    Destaques YouTube
                </Button>
            </div>
        </div>
    );
};
