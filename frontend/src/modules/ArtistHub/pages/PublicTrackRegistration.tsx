import React, { useState } from 'react';
import { Button } from '@components/common/Button';
import './PublicTrackRegistration.css';

export const PublicTrackRegistration: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Track Info
        title: '',
        genre: '',
        bpm: '',
        observations: '',

        // Responsible Info
        responsibleName: '',
        email: '',
        phone: '',

        // Participants
        participants: [{ name: '', role: 'Artist', id: 1 }]
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const addParticipant = () => {
        setFormData({
            ...formData,
            participants: [...formData.participants, { name: '', role: 'Feat', id: Date.now() }]
        });
    };

    const updateParticipant = (id: number, field: string, value: string) => {
        const updated = formData.participants.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        );
        setFormData({ ...formData, participants: updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would call the API to create the track and user
        // await publicService.registerTrack(formData);

        alert('Música registrada com sucesso! Verifique seu e-mail para acessar o painel.');
        // clear form or redirect
    };

    return (
        <div className="public-registration-page">
            <div className="registration-container">
                <div className="reg-header">
                    <h1>🎵 Registro de Nova Música</h1>
                    <p>Envie sua música para a produtora e inicie o processo de lançamento.</p>
                </div>

                <div className="progress-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Música</div>
                    <div className="line"></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Responsável</div>
                    <div className="line"></div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Equipe</div>
                </div>

                <form onSubmit={handleSubmit} className="reg-form">
                    {step === 1 && (
                        <div className="form-section fade-in">
                            <h3>Sobre a Música</h3>
                            <div className="form-group">
                                <label>Nome da Música *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => handleInputChange('title', e.target.value)}
                                    placeholder="Ex: Minha Obra Prima"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gênero</label>
                                    <input
                                        type="text"
                                        value={formData.genre}
                                        onChange={e => handleInputChange('genre', e.target.value)}
                                        placeholder="Ex: Pop, Trap..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>BPM (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.bpm}
                                        onChange={e => handleInputChange('bpm', e.target.value)}
                                        placeholder="120"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Observações / Link da Demo</label>
                                <textarea
                                    value={formData.observations}
                                    onChange={e => handleInputChange('observations', e.target.value)}
                                    placeholder="Cole aqui links do Drive/Dropbox ou observações sobre a faixa..."
                                />
                            </div>
                            <div className="form-actions right">
                                <Button type="button" onClick={() => setStep(2)}>Próximo →</Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-section fade-in">
                            <h3>Seus Dados (Responsável)</h3>
                            <div className="form-group">
                                <label>Seu Nome Completo *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.responsibleName}
                                    onChange={e => handleInputChange('responsibleName', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>E-mail *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => handleInputChange('email', e.target.value)}
                                    placeholder="Enviaremos o acesso do painel aqui"
                                />
                            </div>
                            <div className="form-group">
                                <label>WhatsApp *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => handleInputChange('phone', e.target.value)}
                                />
                            </div>
                            <div className="form-actions">
                                <Button variant="outline" type="button" onClick={() => setStep(1)}>← Voltar</Button>
                                <Button type="button" onClick={() => setStep(3)}>Próximo →</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="form-section fade-in">
                            <h3>Participantes & Créditos</h3>
                            <p className="helper-text">Liste quem participou (Beatmaker, Feats, Compositores).</p>

                            <div className="participants-list">
                                {formData.participants.map((p, index) => (
                                    <div key={p.id} className="participant-row">
                                        <div className="form-group grow">
                                            <input
                                                type="text"
                                                placeholder="Nome do Artista"
                                                value={p.name}
                                                onChange={e => updateParticipant(p.id, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <select
                                                value={p.role}
                                                onChange={e => updateParticipant(p.id, 'role', e.target.value)}
                                            >
                                                <option>Artista Principal</option>
                                                <option>Feat</option>
                                                <option>Produtor</option>
                                                <option>Compositor</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="outline" size="sm" type="button" onClick={addParticipant} style={{ marginBottom: '2rem' }}>
                                + Adicionar Outro
                            </Button>

                            <div className="legal-check">
                                <label>
                                    <input type="checkbox" required />
                                    Declaro que sou responsável pelas informações e autorizo o início do processo.
                                </label>
                            </div>

                            <div className="form-actions">
                                <Button variant="outline" type="button" onClick={() => setStep(2)}>← Voltar</Button>
                                <Button type="submit" variant="primary">🚀 Registrar Música</Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
