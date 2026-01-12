import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { analyzeBodyImage } from '../../services/openai';
import { BottomNav } from '../../components/BottomNav';
import './BodyAnalysis.css';

interface AnalysisResult {
    biotipo: string;
    areasParaFocar: string[];
    postura: string;
    sugestoesTreino: string[];
    observacoes: string;
}

export const BodyAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState('');

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            setResult(null);
            setError('');
        }
    };

    // Open camera
    const handleTakePhoto = () => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment');
            fileInputRef.current.click();
        }
    };

    // Open gallery
    const handleChooseFromGallery = () => {
        if (fileInputRef.current) {
            fileInputRef.current.removeAttribute('capture');
            fileInputRef.current.click();
        }
    };

    // Cancel preview
    const handleCancelPreview = () => {
        setSelectedImage(null);
        setSelectedFile(null);
    };

    // Analyze image with AI
    const handleAnalyze = async () => {
        if (!selectedImage || !selectedFile) {
            setError('Selecione uma imagem primeiro');
            return;
        }

        setAnalyzing(true);
        setError('');

        try {
            // Get user from Supabase Auth
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                throw new Error('Usuário não autenticado');
            }

            console.log('Iniciando análise para user:', authUser.id);

            // 1. Analyze with AI first (don't wait for upload)
            console.log('Enviando para a IA...');
            const analysisResult = await analyzeBodyImage(selectedImage);
            console.log('Resultado da IA:', analysisResult);

            if (!analysisResult.success) {
                throw new Error(analysisResult.error || 'Erro na análise');
            }

            setResult(analysisResult.data!);

            // 2. Upload image to Supabase Storage (optional, don't block UI)
            try {
                const fileName = `${authUser.id}/${Date.now()}.jpg`;
                console.log('Fazendo upload para:', fileName);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('body-images')
                    .upload(fileName, selectedFile, {
                        contentType: selectedFile.type,
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Erro no upload:', uploadError);
                } else if (uploadData) {
                    // Get public URL and save to database
                    const { data: urlData } = supabase.storage
                        .from('body-images')
                        .getPublicUrl(fileName);

                    const imageUrl = urlData.publicUrl;
                    console.log('URL da imagem:', imageUrl);

                    // 3. Save analysis to database
                    const { error: dbError } = await supabase.from('body_analyses').insert({
                        user_id: authUser.id,
                        image_url: imageUrl,
                        analysis_result: analysisResult.data,
                        created_at: new Date().toISOString()
                    });

                    if (dbError) {
                        console.error('Erro ao salvar no banco:', dbError);
                    } else {
                        console.log('Análise salva com sucesso!');
                    }
                }
            } catch (storageErr) {
                console.error('Erro no storage:', storageErr);
                // Don't throw - analysis already completed
            }

        } catch (err: any) {
            console.error('Análise falhou:', err);
            setError(err.message || 'Erro ao analisar imagem');
        } finally {
            setAnalyzing(false);
        }
    };

    // New analysis
    const handleNewAnalysis = () => {
        setSelectedImage(null);
        setSelectedFile(null);
        setResult(null);
        setError('');
    };

    return (
        <div className="body-analysis">
            {/* Header */}
            <header className="body-analysis__header">
                <button className="body-analysis__back-btn" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <span className="body-analysis__step">Análise IA</span>
                <button className="body-analysis__help-btn">
                    <span className="material-symbols-outlined">help</span>
                </button>
            </header>

            {/* Content */}
            <main className="body-analysis__content">
                {/* Headline */}
                <div className="body-analysis__headline">
                    <h1 className="body-analysis__title">Análise Corporal IA</h1>
                    <p className="body-analysis__subtitle">
                        Nossa IA processará sua foto para gerar métricas de composição corporal precisas.
                    </p>
                </div>

                {/* Scanner / Preview / Result */}
                {result ? (
                    /* Result Card */
                    <div className="body-analysis__result">
                        <div className="body-analysis__result-header">
                            <div className="body-analysis__result-icon">
                                <span className="material-symbols-outlined">analytics</span>
                            </div>
                            <h2 className="body-analysis__result-title">Resultado da Análise</h2>
                        </div>

                        <div className="body-analysis__result-content">
                            {/* Biotipo */}
                            <div className="body-analysis__result-section">
                                <h3 className="body-analysis__result-section-title">🏋️ Biotipo</h3>
                                <p className="body-analysis__result-section-text">{result.biotipo}</p>
                            </div>

                            {/* Áreas para Focar */}
                            <div className="body-analysis__result-section">
                                <h3 className="body-analysis__result-section-title">🎯 Áreas para Focar</h3>
                                <ul className="body-analysis__result-suggestions">
                                    {result.areasParaFocar.map((area, index) => (
                                        <li key={index} className="body-analysis__result-suggestion">
                                            <span className="material-symbols-outlined body-analysis__result-suggestion-icon">
                                                fitness_center
                                            </span>
                                            {area}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Postura */}
                            <div className="body-analysis__result-section">
                                <h3 className="body-analysis__result-section-title">🧍 Postura</h3>
                                <p className="body-analysis__result-section-text">{result.postura}</p>
                            </div>

                            {/* Sugestões de Treino */}
                            <div className="body-analysis__result-section">
                                <h3 className="body-analysis__result-section-title">💪 Sugestões de Treino</h3>
                                <ul className="body-analysis__result-suggestions">
                                    {result.sugestoesTreino.map((sugestao, index) => (
                                        <li key={index} className="body-analysis__result-suggestion">
                                            <span className="material-symbols-outlined body-analysis__result-suggestion-icon">
                                                check_circle
                                            </span>
                                            {sugestao}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Observações */}
                            {result.observacoes && (
                                <div className="body-analysis__result-section">
                                    <h3 className="body-analysis__result-section-title">📝 Observações</h3>
                                    <p className="body-analysis__result-section-text">{result.observacoes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : analyzing ? (
                    /* Loading */
                    <div className="body-analysis__scanner">
                        <div className="body-analysis__loading">
                            <div className="body-analysis__loading-spinner"></div>
                            <p className="body-analysis__loading-text">
                                Analisando sua foto...<br />
                                Isso pode levar alguns segundos.
                            </p>
                        </div>
                    </div>
                ) : selectedImage ? (
                    /* Preview */
                    <div className="body-analysis__scanner">
                        <div className="body-analysis__preview">
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="body-analysis__preview-image"
                            />
                            <div className="body-analysis__preview-overlay">
                                <button
                                    className="body-analysis__preview-btn body-analysis__preview-btn--cancel"
                                    onClick={handleCancelPreview}
                                >
                                    <span className="material-symbols-outlined">close</span>
                                    Cancelar
                                </button>
                                <button
                                    className="body-analysis__preview-btn body-analysis__preview-btn--analyze"
                                    onClick={handleAnalyze}
                                >
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Analisar
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Scanner */
                    <div className="body-analysis__scanner">
                        <img
                            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop"
                            alt=""
                            className="body-analysis__scanner-image"
                        />
                        <div className="body-analysis__scanner-overlay"></div>
                        <div className="body-analysis__scanner-frame">
                            <div className="body-analysis__scanner-corners">
                                <div className="body-analysis__scanner-corner body-analysis__scanner-corner--tl"></div>
                                <div className="body-analysis__scanner-corner body-analysis__scanner-corner--tr"></div>
                            </div>
                            <span className="material-symbols-outlined body-analysis__scanner-icon">
                                accessibility_new
                            </span>
                            <div className="body-analysis__scanner-corners">
                                <div className="body-analysis__scanner-corner body-analysis__scanner-corner--bl"></div>
                                <div className="body-analysis__scanner-corner body-analysis__scanner-corner--br"></div>
                            </div>
                        </div>
                        <div className="body-analysis__scan-line"></div>
                        <div className="body-analysis__scanner-labels">
                            <span className="body-analysis__scanner-label">
                                <span className="body-analysis__scanner-label-dot"></span>
                                <span className="body-analysis__scanner-label-text">Boa Iluminação</span>
                            </span>
                            <span className="body-analysis__scanner-label">
                                <span className="body-analysis__scanner-label-dot"></span>
                                <span className="body-analysis__scanner-label-text">Corpo Inteiro</span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="body-analysis__guidelines" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>❌ {error}</p>
                    </div>
                )}

                {/* Guidelines */}
                {!result && !analyzing && (
                    <div className="body-analysis__guidelines">
                        <div className="body-analysis__guidelines-header">
                            <span className="material-symbols-outlined body-analysis__guidelines-icon">
                                check_circle
                            </span>
                            <h3 className="body-analysis__guidelines-title">Guia rápido</h3>
                        </div>
                        <ul className="body-analysis__guidelines-list">
                            <li className="body-analysis__guideline-item">
                                <span className="body-analysis__guideline-bullet"></span>
                                <p className="body-analysis__guideline-text">
                                    Use roupas justas ou de banho para melhor precisão nas medidas.
                                </p>
                            </li>
                            <li className="body-analysis__guideline-item">
                                <span className="body-analysis__guideline-bullet"></span>
                                <p className="body-analysis__guideline-text">
                                    Posicione o celular na altura do peito, reto e estável.
                                </p>
                            </li>
                            <li className="body-analysis__guideline-item">
                                <span className="body-analysis__guideline-bullet"></span>
                                <p className="body-analysis__guideline-text">
                                    Fique com os pés na largura dos ombros e braços relaxados.
                                </p>
                            </li>
                        </ul>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="body-analysis__footer">
                {result ? (
                    <button
                        className="body-analysis__btn-primary"
                        onClick={handleNewAnalysis}
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Nova Análise
                    </button>
                ) : !selectedImage && !analyzing && (
                    <>
                        <button
                            className="body-analysis__btn-primary"
                            onClick={handleTakePhoto}
                        >
                            <span className="material-symbols-outlined">photo_camera</span>
                            Tirar Foto Agora
                        </button>
                        <button
                            className="body-analysis__btn-secondary"
                            onClick={handleChooseFromGallery}
                        >
                            Escolher da Galeria
                        </button>
                    </>
                )}

                <div className="body-analysis__privacy">
                    <span className="material-symbols-outlined body-analysis__privacy-icon">lock</span>
                    <p className="body-analysis__privacy-text">
                        Suas fotos são criptografadas e armazenadas com segurança.
                    </p>
                </div>
            </footer>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
