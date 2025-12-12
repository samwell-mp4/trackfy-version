import React, { useState, useEffect } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { useNavigate } from 'react-router-dom';
import './HubDashboard.css';

interface DashboardStats {
    totalArtists: number;
    totalTracks: number;
    pendingTasks: number;
    completedTasks: number;
    totalTasks: number;
}

interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

export const HubDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalArtists: 0,
        totalTracks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        totalTasks: 0
    });
    const [recentTracks, setRecentTracks] = useState<any[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [financials, setFinancials] = useState({
        revenue: 0,
        expenses: 0,
        profit: 0,
        topExpenses: [] as Transaction[],
        topInvestment: { category: '', amount: 0 }
    });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
        loadFinancialData();
    }, []);

    const loadFinancialData = () => {
        const saved = localStorage.getItem('financial_transactions');
        if (saved) {
            const transactions: Transaction[] = JSON.parse(saved);

            const revenue = transactions
                .filter(t => t.type === 'income')
                .reduce((acc, curr) => acc + curr.amount, 0);

            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((acc, curr) => acc + curr.amount, 0);

            // Top 3 Expenses
            const topExpenses = transactions
                .filter(t => t.type === 'expense')
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3);

            // Top Investment Category
            const expensesByCategory: Record<string, number> = {};
            transactions.filter(t => t.type === 'expense').forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });

            let topCat = '';
            let topCatAmount = 0;
            Object.entries(expensesByCategory).forEach(([cat, amount]) => {
                if (amount > topCatAmount) {
                    topCatAmount = amount;
                    topCat = cat;
                }
            });

            setFinancials({
                revenue,
                expenses,
                profit: revenue - expenses,
                topExpenses,
                topInvestment: { category: topCat, amount: topCatAmount }
            });
        }
    };

    const loadDashboardData = async () => {
        try {
            const [artists, tracks, events, checklists] = await Promise.all([
                artistHubService.getArtists(),
                artistHubService.getTracks(),
                artistHubService.getEvents(),
                artistHubService.getChecklists()
            ]);

            // Calculate Task Stats
            let pending = 0;
            let completed = 0;
            checklists.forEach((list: any) => {
                if (list.tasks) {
                    list.tasks.forEach((task: any) => {
                        if (task.status === 'done') completed++;
                        else pending++;
                    });
                }
            });

            setStats({
                totalArtists: artists.length,
                totalTracks: tracks.length,
                pendingTasks: pending,
                completedTasks: completed,
                totalTasks: pending + completed
            });

            // Recent Tracks (Last 3)
            setRecentTracks(tracks.slice(-3).reverse());

            // Upcoming Events (Next 3)
            const now = new Date();
            const futureEvents = events
                .filter((e: any) => new Date(e.start_time) >= now)
                .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .slice(0, 3);
            setUpcomingEvents(futureEvents);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getCategoryLabel = (catId: string) => {
        const labels: Record<string, string> = {
            video: 'Produção de Vídeo',
            marketing: 'Marketing',
            transport: 'Transporte',
            equipment: 'Equipamentos',
            studio: 'Estúdio',
            team: 'Equipe'
        };
        return labels[catId] || catId;
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Dashboard do Artista</h1>
                <p>Bem-vindo ao seu hub de gerenciamento musical.</p>
            </header>

            <div className="dashboard-grid">
                {/* Stats Row */}
                <div className="glass-card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <span className="card-title">Tarefas & Metas</span>
                        <div className="card-icon">✅</div>
                    </div>
                    <div className="stat-value">{stats.pendingTasks}</div>
                    <div className="stat-trend trend-neutral">
                        Tarefas Pendentes
                    </div>
                    <div className="task-progress-ring">
                        <div
                            className="task-progress-fill"
                            style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                        ></div>
                    </div>
                    <div className="task-stats-row">
                        <span>{stats.completedTasks} Concluídas</span>
                        <span>{Math.round(stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0)}%</span>
                    </div>
                </div>

                <div className="glass-card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <span className="card-title">Total de Artistas</span>
                        <div className="card-icon">🎤</div>
                    </div>
                    <div className="stat-value">{stats.totalArtists}</div>
                    <div className="stat-trend trend-up">
                        <span>+1 essa semana</span>
                    </div>
                </div>

                <div className="glass-card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <span className="card-title">Catálogo Musical</span>
                        <div className="card-icon">🎵</div>
                    </div>
                    <div className="stat-value">{stats.totalTracks}</div>
                    <div className="stat-trend trend-up">
                        <span>Músicas Cadastradas</span>
                    </div>
                </div>

                {/* Middle Row - Widgets */}
                <div className="glass-card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <span className="card-title">Agenda Próxima</span>
                        <button className="badge badge-new" onClick={() => navigate('/artist-hub/calendar')}>Ver Tudo</button>
                    </div>
                    <div className="widget-list">
                        {upcomingEvents.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nenhum evento próximo.</p>
                        ) : (
                            upcomingEvents.map(event => (
                                <div key={event.id} className="widget-item">
                                    <div className="item-icon">📅</div>
                                    <div className="item-info">
                                        <div className="item-title">{event.title}</div>
                                        <div className="item-subtitle">
                                            {new Date(event.start_time).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass-card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <span className="card-title">Maiores Despesas</span>
                        <button className="badge badge-pending" onClick={() => navigate('/artist-hub/financial')}>Gerenciar</button>
                    </div>
                    <div className="widget-list">
                        {financials.topExpenses.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nenhuma despesa registrada.</p>
                        ) : (
                            financials.topExpenses.map(expense => (
                                <div key={expense.id} className="widget-item">
                                    <div className="item-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>💸</div>
                                    <div className="item-info">
                                        <div className="item-title">{expense.title}</div>
                                        <div className="item-subtitle">{getCategoryLabel(expense.category)}</div>
                                    </div>
                                    <div className="item-amount amount-expense">
                                        -{formatCurrency(expense.amount)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass-card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <span className="card-title">Últimos Lançamentos</span>
                        <button className="badge badge-new" onClick={() => navigate('/artist-hub/tracks')}>Ver Tudo</button>
                    </div>
                    <div className="widget-list">
                        {recentTracks.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nenhuma música lançada.</p>
                        ) : (
                            recentTracks.map((track: any) => (
                                <div key={track.id} className="widget-item">
                                    <div className="item-icon">🎵</div>
                                    <div className="item-info">
                                        <div className="item-title">{track.title}</div>
                                        <div className="item-subtitle">
                                            {track.artist || 'Artista Principal'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Financial Overview Section - REDESIGNED STRIP */}
                <div className="glass-card financial-section">
                    <div className="card-header">
                        <span className="card-title">Visão Geral Financeira</span>
                        <div className="card-icon">💰</div>
                    </div>

                    <div className="financial-strip">
                        <div className="fin-metric">
                            <div className="fin-label">Saldo em Caixa</div>
                            <div className="fin-value highlight">{formatCurrency(financials.profit)}</div>
                            <div className="fin-trend">Disponível</div>
                        </div>

                        <div className="fin-divider"></div>

                        <div className="fin-metric">
                            <div className="fin-label">Entradas (Mês)</div>
                            <div className="fin-value positive">+{formatCurrency(financials.revenue)}</div>
                            <div className="fin-trend trend-up">↗ Receita</div>
                        </div>

                        <div className="fin-divider"></div>

                        <div className="fin-metric">
                            <div className="fin-label">Saídas (Mês)</div>
                            <div className="fin-value negative">-{formatCurrency(financials.expenses)}</div>
                            <div className="fin-trend trend-down">↘ Despesas</div>
                        </div>

                        <div className="fin-divider"></div>

                        <div className="fin-metric">
                            <div className="fin-label">Principal Investimento</div>
                            <div className="fin-value">{financials.topInvestment.amount > 0 ? getCategoryLabel(financials.topInvestment.category) : '-'}</div>
                            <div className="fin-trend" style={{ color: '#a78bfa' }}>
                                {financials.topInvestment.amount > 0 ? formatCurrency(financials.topInvestment.amount) : 'Sem dados'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
