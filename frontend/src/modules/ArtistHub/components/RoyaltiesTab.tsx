import React, { useState } from 'react';
import { Button } from '@components/common/Button';

interface RoyaltiesTabProps {
    track: any;
    onUpdate: () => void;
}

export const RoyaltiesTab: React.FC<RoyaltiesTabProps> = ({ track, onUpdate }) => {
    const participants = track.metadata.rights || [];

    const handleWhatsAppReminder = (participant: any) => {
        const phone = participant.phone || ''; // Assuming phone might be available or we prompt
        const message = `Ei ${participant.name}! 👋 Passando pra lembrar de conferir os royalties da faixa *${track.title}*. Qualquer atualização, registra no painel 😉`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const calculateTotal = () => {
        return participants.reduce((acc: number, curr: any) => acc + (Number(curr.percentage) || 0), 0);
    };

    const totalPercentage = calculateTotal();

    return (
        <div className="royalties-tab">
            <div className="rt-header">
                <h3>👑 Distribuição de Royalties</h3>
                <div className={`rt-total-badge ${totalPercentage === 100 ? 'valid' : 'invalid'}`}>
                    Total: {totalPercentage}%
                </div>
            </div>

            <p className="rt-description">
                Gerencie a divisão de direitos autorais e envie lembretes para os colaboradores.
            </p>

            <div className="rt-grid">
                {participants.length === 0 ? (
                    <div className="empty-state">
                        <p>Nenhum participante registrado nesta música.</p>
                        <Button variant="outline" onClick={() => document.querySelector<HTMLElement>('.td-tab:nth-child(4)')?.click()}>
                            Gerenciar Equipe
                        </Button>
                    </div>
                ) : (
                    participants.map((p: any, index: number) => (
                        <div key={index} className="rt-card">
                            <div className="rt-card-header">
                                <div className="rt-user-info">
                                    <div className="rt-avatar">{p.name.charAt(0)}</div>
                                    <div>
                                        <h4>{p.name}</h4>
                                        <span className="rt-role">{p.role}</span>
                                    </div>
                                </div>
                                <div className="rt-percentage">
                                    {p.percentage}%
                                </div>
                            </div>

                            <div className="rt-card-body">
                                <div className="rt-status">
                                    <span className="status-label">Status:</span>
                                    <span className="status-value pending">🟡 Pendente Confirmação</span>
                                </div>
                                <div className="rt-last-seen">
                                    Última atualização: {new Date().toLocaleDateString()}
                                </div>
                            </div>

                            <div className="rt-card-actions">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleWhatsAppReminder(p)}
                                    title="Enviar lembrete via WhatsApp"
                                >
                                    📢 Cobrar
                                </Button>
                                <Button variant="ghost" size="sm">
                                    Ver Detalhes
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="rt-automation-panel">
                <h4>⚡ Automação de Cobrança</h4>
                <div className="automation-row">
                    <span>Lembretes automáticos ativados (a cada 3 dias)</span>
                    <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            <style>{`
                .royalties-tab {
                    padding: 1rem;
                    color: white;
                }
                .rt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .rt-total-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                .rt-total-badge.valid {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                    border: 1px solid #10b981;
                }
                .rt-total-badge.invalid {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border: 1px solid #ef4444;
                }
                .rt-description {
                    color: #94a3b8;
                    margin-bottom: 2rem;
                    font-size: 0.95rem;
                }
                .rt-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .rt-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: all 0.2s;
                }
                .rt-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateY(-2px);
                }
                .rt-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .rt-user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .rt-avatar {
                    width: 40px;
                    height: 40px;
                    background: #8b5cf6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
                .rt-user-info h4 {
                    margin: 0;
                    color: #e2e8f0;
                }
                .rt-role {
                    font-size: 0.85rem;
                    color: #94a3b8;
                }
                .rt-percentage {
                    font-size: 1.25rem;
                    font-weight: bold;
                    color: #fff;
                }
                .rt-card-body {
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                }
                .rt-status {
                    margin-bottom: 0.5rem;
                }
                .status-value.pending {
                    color: #fbbf24;
                }
                .rt-last-seen {
                    color: #64748b;
                    font-size: 0.8rem;
                }
                .rt-card-actions {
                    display: flex;
                    gap: 1rem;
                }
                .rt-automation-panel {
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                }
                .automation-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1rem;
                }
                /* Toggle Switch */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #334155;
                    transition: .4s;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                }
                input:checked + .slider {
                    background-color: #8b5cf6;
                }
                input:checked + .slider:before {
                    transform: translateX(26px);
                }
                .slider.round {
                    border-radius: 34px;
                }
                .slider.round:before {
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};
