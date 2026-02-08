import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, Image, Loader2, AlertCircle, Check } from 'lucide-react';
import { processOcrImage, compressImage, isOcrConfigured } from '../services/ocrService';
import { convertToChordPro, parseChordProMeta } from '../utils/chordProConverter';

/**
 * OCR Import Modal
 * 
 * Allows users to import songs by:
 * 1. Taking a photo or selecting from gallery
 * 2. Processing with Gemini Vision AI
 * 3. Converting to ChordPro format
 */
const OcrImportModal = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState('select'); // 'select' | 'preview' | 'processing' | 'result' | 'error'
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [processingMessage, setProcessingMessage] = useState('');
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Check if API is configured
    const apiConfigured = isOcrConfigured();

    const handleFileSelect = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Compress and preview
            const compressed = await compressImage(file);
            setSelectedImage(compressed);
            setImagePreview(compressed);
            setStep('preview');
        } catch (err) {
            setError('Erreur lors du chargement de l\'image');
            setStep('error');
        }
    }, []);

    const handleProcess = useCallback(async () => {
        if (!selectedImage) return;

        setStep('processing');
        setError(null);

        try {
            setProcessingMessage('Analyse de l\'image...');
            await new Promise(r => setTimeout(r, 500));

            setProcessingMessage('Extraction des accords et paroles...');
            const ocrResult = await processOcrImage(selectedImage);

            setProcessingMessage('Formatage ChordPro...');
            await new Promise(r => setTimeout(r, 300));

            const chordProContent = convertToChordPro(ocrResult);
            const meta = parseChordProMeta(chordProContent);

            setResult({
                title: ocrResult.title || 'Inconnu',
                artist: ocrResult.artist || 'Inconnu',
                content: meta.content || chordProContent,
                raw: ocrResult
            });
            setStep('result');
        } catch (err) {
            console.error('OCR Error:', err);
            setError(err.message || 'Erreur lors de l\'analyse');
            setStep('error');
        }
    }, [selectedImage]);

    const handleConfirm = useCallback(() => {
        if (result) {
            onSuccess(result);
            onClose();
        }
    }, [result, onSuccess, onClose]);

    const handleRetry = useCallback(() => {
        setStep('select');
        setSelectedImage(null);
        setImagePreview(null);
        setError(null);
        setResult(null);
    }, []);

    return (
        <div className="ocr-modal-backdrop">
            <div className="ocr-modal glass-panel">
                <button className="ocr-modal-close" onClick={onClose} aria-label="Fermer">
                    <X size={24} />
                </button>

                <h2 className="ocr-modal-title">Importer via Photo</h2>

                {/* API not configured warning */}
                {!apiConfigured && (
                    <div className="ocr-warning">
                        <AlertCircle size={20} />
                        <span>Clé API Gemini non configurée. Ajoutez VITE_GEMINI_API_KEY dans .env</span>
                    </div>
                )}

                {/* Step: Select Image */}
                {step === 'select' && (
                    <div className="ocr-select-step">
                        <p className="ocr-description">
                            Prenez une photo ou importez une image de partition pour extraire automatiquement les paroles et accords.
                        </p>

                        <div className="ocr-buttons">
                            <button
                                className="ocr-option-btn"
                                onClick={() => cameraInputRef.current?.click()}
                                disabled={!apiConfigured}
                            >
                                <Camera size={32} />
                                <span>Prendre une photo</span>
                            </button>

                            <button
                                className="ocr-option-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!apiConfigured}
                            >
                                <Image size={32} />
                                <span>Depuis la galerie</span>
                            </button>
                        </div>

                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>
                )}

                {/* Step: Preview */}
                {step === 'preview' && (
                    <div className="ocr-preview-step">
                        <div className="ocr-image-preview">
                            <img src={imagePreview} alt="Aperçu" />
                        </div>

                        <div className="ocr-preview-actions">
                            <button className="btn-ghost" onClick={handleRetry}>
                                Reprendre
                            </button>
                            <button className="btn-primary" onClick={handleProcess}>
                                Analyser
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Processing */}
                {step === 'processing' && (
                    <div className="ocr-processing-step">
                        <Loader2 className="ocr-spinner" size={48} />
                        <p className="ocr-processing-message">{processingMessage}</p>
                    </div>
                )}

                {/* Step: Error */}
                {step === 'error' && (
                    <div className="ocr-error-step">
                        <AlertCircle size={48} className="ocr-error-icon" />
                        <p className="ocr-error-message">{error}</p>
                        <button className="btn-primary" onClick={handleRetry}>
                            Réessayer
                        </button>
                    </div>
                )}

                {/* Step: Result */}
                {step === 'result' && result && (
                    <div className="ocr-result-step">
                        <div className="ocr-result-header">
                            <Check size={24} className="ocr-success-icon" />
                            <span>Extraction réussie !</span>
                        </div>

                        <div className="ocr-result-meta">
                            <p><strong>Titre :</strong> {result.title}</p>
                            <p><strong>Artiste :</strong> {result.artist}</p>
                        </div>

                        <div className="ocr-result-preview">
                            <pre>{result.content.slice(0, 300)}...</pre>
                        </div>

                        <div className="ocr-result-actions">
                            <button className="btn-ghost" onClick={handleRetry}>
                                Nouvelle image
                            </button>
                            <button className="btn-primary" onClick={handleConfirm}>
                                Éditer la chanson
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .ocr-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    z-index: var(--z-modal, 100);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    backdrop-filter: blur(8px);
                }

                .ocr-modal {
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 1.5rem;
                    border-radius: 16px;
                    position: relative;
                    border: 1px solid var(--border-subtle);
                }

                .ocr-modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .ocr-modal-close:hover {
                    color: white;
                }

                .ocr-modal-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 1.5rem;
                }

                .ocr-warning {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #ef4444;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                }

                .ocr-description {
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }

                .ocr-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .ocr-option-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 2rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-subtle);
                    border-radius: 12px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .ocr-option-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--accent-primary);
                }

                .ocr-option-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .ocr-image-preview {
                    max-height: 300px;
                    overflow: hidden;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .ocr-image-preview img {
                    width: 100%;
                    height: auto;
                    object-fit: contain;
                }

                .ocr-preview-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }

                .ocr-processing-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 3rem 1rem;
                }

                .ocr-spinner {
                    animation: spin 1s linear infinite;
                    color: var(--accent-primary);
                    margin-bottom: 1rem;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .ocr-processing-message {
                    color: var(--text-muted);
                }

                .ocr-error-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 2rem 1rem;
                    text-align: center;
                }

                .ocr-error-icon {
                    color: #ef4444;
                    margin-bottom: 1rem;
                }

                .ocr-error-message {
                    color: #ef4444;
                    margin-bottom: 1.5rem;
                }

                .ocr-result-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .ocr-success-icon {
                    color: #22c55e;
                }

                .ocr-result-meta {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .ocr-result-meta p {
                    margin: 0.25rem 0;
                }

                .ocr-result-preview {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 1rem;
                    border-radius: 8px;
                    max-height: 150px;
                    overflow-y: auto;
                    margin-bottom: 1rem;
                }

                .ocr-result-preview pre {
                    margin: 0;
                    font-family: monospace;
                    font-size: 0.85rem;
                    white-space: pre-wrap;
                    color: var(--text-muted);
                }

                .ocr-result-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }

                @media (max-width: 480px) {
                    .ocr-buttons {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default OcrImportModal;
