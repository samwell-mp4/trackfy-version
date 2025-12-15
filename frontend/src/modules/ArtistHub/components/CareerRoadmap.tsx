import React, { useState, useEffect } from 'react';
import { Button } from '@components/common/Button';
import './CareerRoadmap.css';

interface ChecklistItem {
    id: string;
    label: string;
    completed: boolean;
}

interface Phase {
    id: number;
    title: string;
    icon: string;
    description: string;
    items: ChecklistItem[];
}

const INITIAL_PHASES: Phase[] = [
    {
        id: 1,
        title: 'Base do Artista',
        icon: '🎵',
        description: 'Fundamentos essenciais para iniciar a carreira.',
        items: [
            { id: 'p1_name', label: 'Nome artístico definido', completed: false },
            { id: 'p1_visual', label: 'Identidade visual básica', completed: false },
            { id: 'p1_bio', label: 'Bio profissional pronta', completed: false },
            { id: 'p1_photos', label: 'Fotos oficiais (press kit)', completed: false },
            { id: 'p1_links', label: 'Links principais organizados', completed: false },
        ]
    },
    {
        id: 2,
        title: 'Produção Musical',
        icon: '🎧',
        description: 'Do estúdio até a master final.',
        items: [
            { id: 'p2_beat', label: 'Beat registrado', completed: false },
            { id: 'p2_lyrics', label: 'Letra finalizada', completed: false },
            { id: 'p2_guide', label: 'Guia vocal gravado', completed: false },
            { id: 'p2_rec', label: 'Gravação oficial', completed: false },
            { id: 'p2_mix', label: 'Mixagem', completed: false },
            { id: 'p2_master', label: 'Masterização', completed: false },
            { id: 'p2_approved', label: 'Versão final aprovada', completed: false },
        ]
    },
    {
        id: 3,
        title: 'Organização',
        icon: '📁',
        description: 'Documentação e direitos garantidos.',
        items: [
            { id: 'p3_files', label: 'Arquivos organizados', completed: false },
            { id: 'p3_covers', label: 'Capas salvas', completed: false },
            { id: 'p3_lyrics', label: 'Letras documentadas', completed: false },
            { id: 'p3_credits', label: 'Créditos completos', completed: false },
            { id: 'p3_contracts', label: 'Contratos aceitos', completed: false },
        ]
    },
    {
        id: 4,
        title: 'Lançamento',
        icon: '🚀',
        description: 'Preparando o voo para o mundo.',
        items: [
            { id: 'p4_strategy', label: 'Estratégia definida', completed: false },
            { id: 'p4_date', label: 'Data de lançamento', completed: false },
            { id: 'p4_presave', label: 'Pré-save', completed: false },
            { id: 'p4_social', label: 'Conteúdos para redes', completed: false },
            { id: 'p4_clip', label: 'Clipe / visualizer', completed: false },
        ]
    },
    {
        id: 5,
        title: 'Pós-Lançamento',
        icon: '📊',
        description: 'Monitoramento e próximos passos.',
        items: [
            { id: 'p5_monitor', label: 'Monitoramento', completed: false },
            { id: 'p5_reports', label: 'Relatórios básicos', completed: false },
            { id: 'p5_royalty', label: 'Royalty registrado', completed: false },
            { id: 'p5_next', label: 'Planejamento do próximo lançamento', completed: false },
        ]
    }
];

export const CareerRoadmap: React.FC = () => {
    const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
    const [activePhaseId, setActivePhaseId] = useState<number>(1);

    useEffect(() => {
        // Load from local storage for persistence simulation
        const saved = localStorage.getItem('career_roadmap_progress');
        if (saved) {
            setPhases(JSON.parse(saved));
        }
    }, []);

    const saveProgress = (newPhases: Phase[]) => {
        setPhases(newPhases);
        localStorage.setItem('career_roadmap_progress', JSON.stringify(newPhases));
    };

    const toggleItem = (phaseId: number, itemId: string) => {
        const newPhases = phases.map(phase => {
            if (phase.id === phaseId) {
                return {
                    ...phase,
                    items: phase.items.map(item =>
                        item.id === itemId ? { ...item, completed: !item.completed } : item
                    )
                };
            }
            return phase;
        });
        saveProgress(newPhases);
    };

    const activePhase = phases.find(p => p.id === activePhaseId) || phases[0];

    // Calculate overall progress
    const totalItems = phases.reduce((acc, p) => acc + p.items.length, 0);
    const completedItems = phases.reduce((acc, p) => acc + p.items.filter(i => i.completed).length, 0);
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return (
        <div className="career-roadmap">
            <div className="cr-header">
                <div className="cr-title">
                    <h2>🚀 Checklist Impecável de Carreira</h2>
                    <p className="cr-subtitle">Seu guia passo-a-passo para o sucesso profissional.</p>
                </div>

            </div>

            {/* Phase Navigation (Tabs) */}
            <div className="cr-phases-nav">
                {phases.map(phase => {
                    const phaseCompleted = phase.items.filter(i => i.completed).length;
                    const phaseTotal = phase.items.length;
                    const isComplete = phaseCompleted === phaseTotal;

                    return (
                        <div
                            key={phase.id}
                            className={`cr-phase-tab ${activePhaseId === phase.id ? 'active' : ''} ${isComplete ? 'completed' : ''}`}
                            onClick={() => setActivePhaseId(phase.id)}
                        >
                            <div className="phase-icon">{isComplete ? '✅' : phase.icon}</div>
                            <div className="phase-info">
                                <span className="phase-name">{phase.title}</span>
                                <span className="phase-counter">{phaseCompleted}/{phaseTotal}</span>
                            </div>
                            <div className="phase-indicator"></div>
                        </div>
                    );
                })}
            </div>

            {/* Active Phase Content */}
            <div className="cr-phase-content">
                <div className="content-header">
                    <h3>{activePhase.icon} {activePhase.title}</h3>
                    <p>{activePhase.description}</p>
                </div>

                <div className="cr-checklist-grid">
                    {activePhase.items.map(item => (
                        <div
                            key={item.id}
                            className={`cr-checklist-item ${item.completed ? 'checked' : ''}`}
                            onClick={() => toggleItem(activePhase.id, item.id)}
                        >
                            <div className="checkbox-custom">
                                {item.completed && '✓'}
                            </div>
                            <span className="item-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
