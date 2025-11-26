import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Sidebar } from '@components/dashboard/Sidebar';
import { CreateVideo } from '@components/dashboard/CreateVideo';
import { Gallery } from '@components/dashboard/Gallery';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState<'create' | 'gallery'>('create');

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Bem-vindo, {user?.usuario}!</h1>
                <button onClick={logout} className="logout-btn">
                    Sair
                </button>
            </div>

            <div className="dashboard-layout">
                <Sidebar activeView={activeView} onNavigate={setActiveView} />

                <div className="dashboard-content">
                    {activeView === 'create' ? <CreateVideo /> : <Gallery />}
                </div>
            </div>
        </div>
    );
};
