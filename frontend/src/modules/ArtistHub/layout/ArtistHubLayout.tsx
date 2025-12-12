import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import './ArtistHubLayout.css';

export const ArtistHubLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="artist-hub-layout">
            <aside className="hub-sidebar">
                <div className="hub-logo" onClick={() => navigate('/dashboard')}>
                    🔙 Voltar ao Dashboard
                </div>
                <div className="hub-title">
                    🎸 Artista Hub
                </div>
                <nav className="hub-nav">
                    <NavLink to="/artist-hub" end className={({ isActive }) => isActive ? 'active' : ''}>
                        🏠 Home
                    </NavLink>
                    <NavLink to="/artist-hub/artists" className={({ isActive }) => isActive ? 'active' : ''}>
                        🎤 Artistas
                    </NavLink>
                    <NavLink to="/artist-hub/agenda" className={({ isActive }) => isActive ? 'active' : ''}>
                        📅 Agenda
                    </NavLink>
                    <NavLink to="/artist-hub/checklists" className={({ isActive }) => isActive ? 'active' : ''}>
                        ✅ Checklists
                    </NavLink>
                    <NavLink to="/artist-hub/tracks" className={({ isActive }) => isActive ? 'active' : ''}>
                        🎵 Músicas
                    </NavLink>
                    <NavLink to="/artist-hub/files" className={({ isActive }) => isActive ? 'active' : ''}>
                        📂 Arquivos
                    </NavLink>
                    <NavLink to="/artist-hub/financial" className={({ isActive }) => isActive ? 'active' : ''}>
                        💰 Financeiro
                    </NavLink>
                </nav>
                <div className="hub-footer">
                    <button onClick={logout} className="logout-btn-small">Sair</button>
                </div>
            </aside>
            <main className="hub-content">
                <Outlet />
            </main>
        </div>
    );
};
