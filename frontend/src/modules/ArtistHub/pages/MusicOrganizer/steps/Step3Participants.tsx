import React, { useState } from 'react';
import { Button } from '@components/common/Button';
<<<<<<< HEAD
import { ParticipantSelector } from '../../../components/ParticipantSelector';
=======
>>>>>>> 2515de915935a0055c33748ef425b911b5c2085d

interface Step3Props {
    data: any;
    updateData: (data: any) => void;
}

<<<<<<< HEAD


export const Step3Participants: React.FC<Step3Props> = ({ data, updateData }) => {
    const [showParticipantSelector, setShowParticipantSelector] = useState(false);
=======
const ROLES = [
    'Produtor Musical',
    'Beatmaker',
    'DJ',
    'Compositor - Letra',
    'Compositor - Melodia',
    'Instrumentista',
    'Mixagem',
    'Masterização',
    'Voz Adicional',
    'Outro'
];

export const Step3Participants: React.FC<Step3Props> = ({ data, updateData }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newParticipant, setNewParticipant] = useState<any>({
        name: '',
        role: 'Produtor Musical',
        observation: ''
    });

    const addParticipant = () => {
        if (!newParticipant.name) return;

        const updatedList = [...(data.participants || []), { ...newParticipant, id: Date.now().toString() }];
        updateData({ participants: updatedList });
        setNewParticipant({ name: '', role: 'Produtor Musical', observation: '' });
        setIsAdding(false);
    };
>>>>>>> 2515de915935a0055c33748ef425b911b5c2085d

    const removeParticipant = (id: string) => {
        const updatedList = data.participants.filter((p: any) => p.id !== id);
        updateData({ participants: updatedList });
    };

    return (
<<<<<<< HEAD
        <>
            <div className="step-container">
                <h2 className="step-title">Participantes / Colaboradores</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Adicione todos que contribuíram para esta obra.
                </p>

                <div className="participants-list">
                    {data.participants?.map((p: any) => (
                        <div key={p.id} className="participant-item">
                            <div>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.name}</span>
                                <span className="role-badge">{p.role}</span>
                                {p.observation && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        Obs: {p.observation}
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => removeParticipant(p.id)}>
                                🗑️
                            </Button>
                        </div>
                    ))}

                    {(!data.participants || data.participants.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                            Nenhum participante adicionado.
                        </div>
                    )}
                </div>

                <Button onClick={() => setShowParticipantSelector(true)} style={{ marginTop: '24px' }}>
                    + Adicionar Participante
                </Button>
            </div>

            {/* Participant Selector */}
            {showParticipantSelector && (
                <ParticipantSelector
                    isOpen={showParticipantSelector}
                    onClose={() => setShowParticipantSelector(false)}
                    onSelect={(artist, role, split) => {
                        const newP = {
                            id: Date.now().toString(),
                            name: artist.name,
                            role: role,
                            artist_id: artist.id,
                            observation: ''
                        };
                        const updatedList = [...(data.participants || []), newP];
                        updateData({ participants: updatedList });
                    }}
                />
            )}
        </>
=======
        <div className="step-container">
            <h2 className="step-title">Participantes / Colaboradores</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Adicione todos que contribuíram para esta obra.
            </p>

            <div className="participants-list">
                {data.participants?.map((p: any) => (
                    <div key={p.id} className="participant-item">
                        <div>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.name}</span>
                            <span className="role-badge">{p.role}</span>
                            {p.observation && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    Obs: {p.observation}
                                </div>
                            )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeParticipant(p.id)}>
                            🗑️
                        </Button>
                    </div>
                ))}

                {data.participants?.length === 0 && !isAdding && (
                    <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                        Nenhum participante adicionado.
                    </div>
                )}
            </div>

            {!isAdding ? (
                <Button onClick={() => setIsAdding(true)} style={{ marginTop: '24px' }}>
                    + Adicionar Participante
                </Button>
            ) : (
                <div className="add-participant-form" style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '24px',
                    borderRadius: '16px',
                    marginTop: '24px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h3>Novo Participante</h3>
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Nome do Colaborador</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Nome ou Artista"
                                value={newParticipant.name}
                                onChange={e => setNewParticipant({ ...newParticipant, name: e.target.value })}
                            />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Função</label>
                            <select
                                className="form-select"
                                value={newParticipant.role}
                                onChange={e => setNewParticipant({ ...newParticipant, role: e.target.value })}
                            >
                                {ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-section">
                        <label className="form-label">Observação (Opcional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ex: Solo de guitarra, Backing vocal no refrão..."
                            value={newParticipant.observation}
                            onChange={e => setNewParticipant({ ...newParticipant, observation: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
                        <Button onClick={addParticipant}>Adicionar</Button>
                    </div>
                </div>
            )}
        </div>
>>>>>>> 2515de915935a0055c33748ef425b911b5c2085d
    );
};
