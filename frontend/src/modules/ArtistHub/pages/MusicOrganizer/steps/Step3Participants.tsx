import React, { useState } from 'react';
import { Button } from '@components/common/Button';
import { ParticipantSelector } from '../../../components/ParticipantSelector';

interface Step3Props {
    data: any;
    updateData: (data: any) => void;
}


export const Step3Participants: React.FC<Step3Props> = ({ data, updateData }) => {
    const [showParticipantSelector, setShowParticipantSelector] = useState(false);


    const removeParticipant = (id: string) => {
        const updatedList = data.participants.filter((p: any) => p.id !== id);
        updateData({ participants: updatedList });
    };

    return (
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
                            percentage: split,
                            observation: ''
                        };
                        const updatedList = [...(data.participants || []), newP];
                        updateData({ participants: updatedList });
                    }}
                />
            )}
        </>

    );
};
