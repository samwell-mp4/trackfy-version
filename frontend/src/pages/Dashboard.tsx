import React from 'react';
import { useAuth } from '@hooks/useAuth';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Bem-vindo, {user?.usuario}!</h1>
                <button onClick={logout} className="logout-btn">
                    Sair
                </button>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-card">
                    <h2>Dashboard</h2>
                    <p>Em desenvolvimento...</p>
                    <p className="user-info">Email: {user?.email}</p>
                </div>
            </div>
        </div>
    );
};
