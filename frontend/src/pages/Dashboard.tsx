import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Sidebar } from '@components/dashboard/Sidebar';
import { BottomNav } from '@components/dashboard/BottomNav';
import { CreateVideo } from '@components/dashboard/CreateVideo';
import { Gallery } from '@components/dashboard/Gallery';
import { YouTubeHighlights } from '@components/dashboard/YouTubeHighlights';
import { Music, ArrowRight } from 'lucide-react';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState<'create' | 'gallery' | 'highlights'>('create');

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Olá, {user?.usuario?.split(' ')[0]}! 👋</h1>
                    <p className="subtitle">O que vamos criar hoje?</p>
                </div>
                <button onClick={logout} className="logout-btn">
                    Sair
                </button>
            </div>

            <div className="dashboard-layout">
                <Sidebar activeView={activeView} onNavigate={setActiveView} />

                <div className="dashboard-content">
                    {/* Artist Hub Hero Card - Mobile Only/Prominent */}
                    <div className="artist-hub-hero" onClick={() => navigate('/artist-hub')}>
                        <div className="hero-content">
                            <div className="hero-icon">
                                <Music size={32} />
                            </div>
                            <div className="hero-text">
                                <h2>Artist Hub</h2>
                                <p>Gerencie seus artistas, lançamentos e agenda.</p>
                            </div>
                        </div>
                        <div className="hero-action">
                            <ArrowRight size={24} />
                        </div>
                    </div>

                    {activeView === 'create' && <CreateVideo />}
                    {activeView === 'gallery' && <Gallery />}
                    {activeView === 'highlights' && <YouTubeHighlights />}
                </div>
            </div>

            <BottomNav activeView={activeView} onNavigate={setActiveView} />
        </div>
    );
};
