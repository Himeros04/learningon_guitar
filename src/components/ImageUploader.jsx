import React, { useState, useRef } from 'react';
import { Upload, X, Maximize2, Loader } from 'lucide-react';
import { uploadImage, validateImageFile } from '../firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import ImageViewer from './ImageViewer';

/**
 * Image Uploader Component
 * Drag & drop or click to upload images to Firebase Storage
 */
const ImageUploader = ({
    currentImage,
    onImageChange,
    folder = 'covers',
    placeholder = 'Glissez une image ou cliquez pour sélectionner'
}) => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = async (file) => {
        if (!user) {
            setError('Vous devez être connecté');
            return;
        }

        // Validate
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const url = await uploadImage(user.uid, file, folder);
            onImageChange(url);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Erreur lors de l\'upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleClick = () => {
        if (!currentImage) {
            fileInputRef.current?.click();
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onImageChange('');
    };

    const handleOpenViewer = (e) => {
        e.stopPropagation();
        setShowViewer(true);
    };

    return (
        <div style={{ marginBottom: '1rem' }}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                    border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '12px',
                    padding: currentImage ? '0' : '2rem',
                    textAlign: 'center',
                    cursor: currentImage ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    background: dragOver ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: currentImage ? '150px' : 'auto'
                }}
            >
                {uploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem' }}>
                        <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                        <span className="text-muted">Conversion et upload...</span>
                    </div>
                ) : currentImage ? (
                    <>
                        <img
                            src={currentImage}
                            alt="Cover"
                            onClick={handleOpenViewer}
                            style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '10px',
                                cursor: 'pointer'
                            }}
                            title="Cliquer pour agrandir"
                        />
                        {/* Zoom button */}
                        <button
                            onClick={handleOpenViewer}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                background: 'rgba(0,0,0,0.7)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                            title="Agrandir l'image"
                        >
                            <Maximize2 size={14} />
                        </button>
                        {/* Remove button */}
                        <button
                            onClick={handleRemove}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(0,0,0,0.7)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                            title="Supprimer l'image"
                        >
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Upload size={24} color="var(--accent-primary)" />
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>{placeholder}</p>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', margin: 0 }}>
                            JPG, PNG, WebP, GIF, HEIC • Max 10MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {error}
                </p>
            )}

            {/* Image Viewer Modal */}
            <ImageViewer
                imageUrl={currentImage}
                isOpen={showViewer}
                onClose={() => setShowViewer(false)}
            />

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ImageUploader;
