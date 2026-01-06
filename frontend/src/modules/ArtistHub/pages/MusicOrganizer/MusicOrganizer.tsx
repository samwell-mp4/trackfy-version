import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { artistHubService } from '../../../../services/artistHubService';
import './MusicOrganizer.css';

// Steps
import { Step1General } from './steps/Step1General';
import { Step2Artist } from './steps/Step2Artist';
import { Step3Participants } from './steps/Step3Participants';
import { Step4Rights } from './steps/Step4Rights';
import { Step5Upload } from './steps/Step5Upload';
import { Step6Summary } from './steps/Step6Summary';

interface ArtistData {
    id?: string;
    name: string;
    full_name?: string;
    cpf?: string;
    rg?: string;
    email?: string;
    instagram?: string;
    isNew?: boolean;
}

interface Participant {
    name: string;
    role: string;
    observation?: string;
}

interface Right {
    id: string;
    name: string;
    role: string;
    percentage: number;
}

interface FormData {
    title: string;
    subtitle: string;
    genre: string;
    releaseDate: string;
    coverImage: File | null;
    coverPreview: string;
    explicit: boolean;
    mainArtist: ArtistData | null;
    participants: Participant[];
    rights: Right[];
    audioFile: File | null;
    audioUrl: string;
    duration: number;
}

export const MusicOrganizer: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        // Step 1
        title: '',
        subtitle: '',
        genre: '',
        releaseDate: '',
        coverImage: null,
        coverPreview: '',
        explicit: false,
        // Step 2
        mainArtist: null,
        // Step 3
        participants: [],
        // Step 4
        rights: [],
        // Step 5
        audioFile: null,
        audioUrl: '',
        duration: 0
    });

    const updateData = (newData: any) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                if (!formData.title) return alert('O título é obrigatório.');
                if (!formData.coverImage) return alert('A capa é obrigatória.');
                return true;
            case 2:
                if (!formData.mainArtist) return alert('Selecione ou cadastre o artista principal.');
                // @ts-ignore
                if (formData.mainArtist.isNew && (!formData.mainArtist.name || !formData.mainArtist.full_name || !formData.mainArtist.cpf)) {
                    return alert('Preencha os campos obrigatórios do artista (Nome, Nome Completo, CPF).');
                }
                return true;
            case 5:
                if (!formData.audioFile) return alert('O upload do áudio é obrigatório.');
                return true;
            default:
                return true;
        }
    };

    const handleSave = async () => {
        console.log('handleSave initiated', formData);
        try {
            // 1. Handle Artist (Create if new)
            let artistId = formData.mainArtist?.id;

            // @ts-ignore
            if (formData.mainArtist?.isNew) {
                console.log('Creating new artist...');
                try {
                    const newArtist = await artistHubService.createArtist({
                        name: formData.mainArtist.name,
                        full_name: formData.mainArtist.full_name,
                        cpf: formData.mainArtist.cpf,
                        rg: formData.mainArtist.rg,
                        email: formData.mainArtist.email,
                        instagram: formData.mainArtist.instagram,
                        status: 'active'
                    });
                    console.log('New artist created:', newArtist);
                    artistId = newArtist.id;
                } catch (error) {
                    console.error('Error creating artist:', error);
                    alert('Erro ao cadastrar novo artista. Tente novamente.');
                    return;
                }
            }

            console.log('Artist ID:', artistId);

            // 2. Upload Audio File if present
            let finalAudioUrl = formData.audioUrl;
            let fileType = 'mp3'; // Default

            if (formData.audioFile) {
                console.log('Uploading audio file...');
                try {
                    // Determine type based on file
                    if (formData.audioFile.type.includes('wav')) {
                        fileType = 'wav';
                    } else if (formData.audioFile.name.endsWith('.wav')) {
                        fileType = 'wav';
                    }

                    const uploadResult: any = await artistHubService.uploadFile(formData.audioFile);
                    console.log('Audio uploaded:', uploadResult);
                    finalAudioUrl = uploadResult.url;
                } catch (uploadError) {
                    console.error('Error uploading audio:', uploadError);
                    alert('Erro ao fazer upload do arquivo de áudio. A música será salva sem o arquivo.');
                    // Continue saving without the file url if upload fails? 
                    // Or return? Let's continue but warn.
                    finalAudioUrl = '';
                }
            }

            // 3. Prepare Track Data
            // The database schema uses a 'metadata' JSONB column for extra fields
            const trackData = {
                title: formData.title,
                artist_id: artistId,
                release_date: formData.releaseDate || null,
                status: 'pre_production',
                metadata: {
                    subtitle: formData.subtitle,
                    genre: formData.genre,
                    cover_url: formData.coverPreview || 'https://via.placeholder.com/300',
                    explicit_content: formData.explicit,
                    participants: formData.participants.map((p: any) => ({
                        name: p.name,
                        role: p.role,
                        observation: p.observation
                    })),
                    rights: formData.rights.map((r: any) => ({
                        collaborator_id: r.id,
                        name: r.name,
                        role: r.role,
                        percentage: r.percentage
                    })),
                    audio_file_url: finalAudioUrl,
                    duration: formData.duration,
                    files: {
                        [fileType]: finalAudioUrl // Assign to mp3 or wav
                    }
                }
            };

            console.log('Track Data to send:', trackData);

            // 3. Save Track
            const savedTrack = await artistHubService.createTrack(trackData);
            console.log('Track saved successfully:', savedTrack);

            alert('Música organizada com sucesso! 🎵');
            navigate('/artist-hub/tracks');

        } catch (error) {
            console.error('Error saving track:', error);
            alert('Erro ao salvar música. Verifique o console para mais detalhes.');
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1General data={formData} updateData={updateData} />;
            case 2: return <Step2Artist data={formData} updateData={updateData} />;
            case 3: return <Step3Participants data={formData} updateData={updateData} />;
            case 4: return <Step4Rights data={formData} updateData={updateData} />;
            case 5: return <Step5Upload data={formData} updateData={updateData} />;
            case 6: return <Step6Summary data={formData} />;
            default: return null;
        }
    };

    return (
        <div className="music-organizer-container">
            <div className="mo-header">
                <h1>Organizador Musical</h1>
                <p>Passo {currentStep} de 6</p>
            </div>

            <div className="mo-stepper">
                {[1, 2, 3, 4, 5, 6].map(step => (
                    <div
                        key={step}
                        className={`step-indicator ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
                    >
                        {step < currentStep ? '✓' : step}
                    </div>
                ))}
            </div>

            <div className="mo-content">
                {renderStep()}

                <div className="mo-actions">
                    <button
                        className="btn-nav btn-prev"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
                    >
                        Voltar
                    </button>

                    {currentStep < 6 ? (
                        <button className="btn-nav btn-next" onClick={nextStep}>
                            Próximo
                        </button>
                    ) : (
                        <button className="btn-nav btn-next" onClick={handleSave} style={{ background: '#10b981' }}>
                            💾 Salvar Música
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
