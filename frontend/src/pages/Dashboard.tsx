import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useMobile } from '@hooks/useMobile';
import { Sidebar } from '@components/dashboard/Sidebar';
import { BottomNav } from '@components/dashboard/BottomNav';
import { MobileSidebar } from '@components/dashboard/MobileSidebar';
import { CreateVideo } from '@components/dashboard/CreateVideo';
import { Gallery } from '@components/dashboard/Gallery';
import { YouTubeHighlights } from '@components/dashboard/YouTubeHighlights';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState<'create' | 'gallery' | 'highlights'>('create');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useMobile();

    return (
        <div className="dashboard">
            {/* Desktop Header */}
            {!isMobile && (
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1>Olá, {user?.usuario?.split(' ')[0]}! 👋</h1>
                        <p className="subtitle">O que vamos criar hoje?</p>
                    </div>
                    <button onClick={logout} className="logout-btn">
                        Sair
                    </button>
                </div>
            )}

            <div className="dashboard-layout">
                {/* Desktop Sidebar */}
                {!isMobile && <Sidebar activeView={activeView} onNavigate={setActiveView} />}

                <div className="dashboard-content">
                    {/* Active View Content */}
                    <div className="active-view-container">
                        {activeView === 'create' && <CreateVideo />}
                        {activeView === 'gallery' && <Gallery />}
                        {activeView === 'highlights' && <YouTubeHighlights />}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {isMobile && (
                <MobileSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    user={user}
                    onLogout={logout}
                />
            )}

            {/* Mobile Bottom Nav */}
            {isMobile && (
                <BottomNav
                    activeView={activeView}
                    onNavigate={setActiveView}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
            )}
        </div>
    );
};
