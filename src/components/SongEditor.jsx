import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SmartSongRenderer from './SongRenderer';
import { Save, ChevronLeft, Maximize2 } from 'lucide-react';
import AutoScroller from './AutoScroller';
import FullscreenReader from './FullscreenReader';
import ImageUploader from './ImageUploader';
import { useFolders } from '../hooks/useFirestore';
import { getSong, addSong, updateSong } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const SongEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [duration, setDuration] = useState(180);
    const [showPreview, setShowPreview] = useState(true);
    const [transpose, setTranspose] = useState(0);
    const [folderId, setFolderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { folders } = useFolders();
    const scrollContainerRef = useRef(null);

    // Load existing song if ID is present
    useEffect(() => {
        if (id) {
            setLoading(true);
            getSong(id).then(song => {
                if (song) {
                    setTitle(song.title || '');
                    setArtist(song.artist || '');
                    setContent(song.content || '');
                    setImageUrl(song.image || '');
                    setDuration(song.durationSec || 180);
                    setFolderId(song.folderId || '');
                    setIsFavorite(song.isFavorite || false);
                }
                setLoading(false);
            }).catch(err => {
                console.error('Error loading song:', err);
                setLoading(false);
            });
        }
    }, [id]);

    const handleSave = async () => {
        if (!title) return alert('Le titre est requis');
        if (!user) return alert('Vous devez être connecté');

        const songData = {
            title,
            artist,
            content,
            image: imageUrl,
            durationSec: parseInt(duration) || 0,
            folderId: folderId || null,
            type: 'chordpro',
            isFavorite
        };

        try {
            if (id) {
                await updateSong(id, songData);
            } else {
                await addSong(user.uid, songData);
            }
            navigate('/library');
        } catch (err) {
            console.error('Error saving song:', err);
            alert('Erreur lors de la sauvegarde');
        }
    };

    if (loading) {
        return <div className="p-8 text-muted">Chargement...</div>;
    }

    return (
        <div className="editor-container">
            {/* Mobile Header - P0 Fix: Uses own responsive styles, not show-mobile */}
            <div className="editor-mobile-header">
                <button className="btn-ghost" onClick={() => navigate('/library')} aria-label="Retour à la bibliothèque">
                    <ChevronLeft size={24} />
                </button>
                <div className="editor-mobile-title">
                    <input
                        type="text"
                        placeholder="Titre"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>
                <button className="btn-primary" onClick={handleSave} style={{ padding: '0.5rem' }} aria-label="Enregistrer">
                    <Save size={20} />
                </button>
            </div>

            {/* Desktop Toolbar */}
            <div className="editor-toolbar glass-panel hide-mobile">
                <input
                    type="text"
                    placeholder="Titre de la chanson"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="editor-title-input"
                    autoComplete="off"
                />
                <input
                    type="text"
                    placeholder="Artiste"
                    value={artist}
                    onChange={e => setArtist(e.target.value)}
                    className="editor-artist-input"
                    autoComplete="off"
                />

                <button className="btn-ghost" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? 'Voir Code' : 'Voir Aperçu'}
                </button>

                {showPreview && (
                    <div className="transpose-controls">
                        <button className="btn-ghost" onClick={() => setTranspose(t => t - 1)}>-</button>
                        <span className={transpose !== 0 ? 'active' : ''}>
                            {transpose > 0 ? `+${transpose}` : transpose}
                        </span>
                        <button className="btn-ghost" onClick={() => setTranspose(t => t + 1)}>+</button>
                    </div>
                )}

                {showPreview && (
                    <button
                        className="btn-ghost mode-scene-btn"
                        onClick={() => setIsFullscreen(true)}
                        aria-label="Mode Scène"
                    >
                        <Maximize2 size={18} /> Mode Scène
                    </button>
                )}

                <button className="btn-primary save-btn" onClick={handleSave}>
                    <Save size={18} /> Enregistrer
                </button>
            </div>

            {/* Mobile Controls Bar - P0 Fix: Uses own responsive styles */}
            <div className="editor-mobile-controls">
                <button
                    className={`mobile-control-btn ${showPreview ? 'active' : ''}`}
                    onClick={() => setShowPreview(true)}
                >
                    Aperçu
                </button>
                <button
                    className={`mobile-control-btn ${!showPreview ? 'active' : ''}`}
                    onClick={() => setShowPreview(false)}
                >
                    Éditer
                </button>
                <button
                    className={`mobile-control-btn ${showDetails ? 'active' : ''}`}
                    onClick={() => setShowDetails(!showDetails)}
                >
                    Détails
                </button>
                {showPreview && (
                    <div className="mobile-transpose">
                        <button onClick={() => setTranspose(t => t - 1)}>-</button>
                        <span>{transpose}</span>
                        <button onClick={() => setTranspose(t => t + 1)}>+</button>
                    </div>
                )}
                {showPreview && (
                    <button
                        className="mobile-control-btn mode-scene-mobile"
                        onClick={() => setIsFullscreen(true)}
                        aria-label="Mode Scène"
                    >
                        <Maximize2 size={16} />
                    </button>
                )}
            </div>

            {/* Details Panel (collapsible on mobile) */}
            <div className={`editor-details ${showDetails ? 'show' : ''}`}>
                {/* Image Upload */}
                <div className="detail-section">
                    <label>Image de couverture</label>
                    <ImageUploader
                        currentImage={imageUrl}
                        onImageChange={setImageUrl}
                        folder="covers"
                        placeholder="Glissez une image ou cliquez"
                    />
                    <input
                        type="text"
                        placeholder="Ou collez une URL d'image..."
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        className="url-input"
                    />
                </div>

                {/* Mobile Artist Input */}
                <div className="detail-section detail-section-mobile">
                    <label>Artiste</label>
                    <input
                        type="text"
                        placeholder="Nom de l'artiste"
                        value={artist}
                        onChange={e => setArtist(e.target.value)}
                        className="url-input"
                    />
                </div>

                <div className="detail-row">
                    <span className="text-muted">Durée (sec) :</span>
                    <input
                        type="number"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        className="duration-input"
                    />
                    <span className="text-muted duration-display">({Math.floor(duration / 60)}m {duration % 60}s)</span>
                </div>

                <div className="detail-section">
                    <select
                        value={folderId}
                        onChange={e => setFolderId(e.target.value)}
                        className="folder-select"
                    >
                        <option value="">-- Aucun dossier --</option>
                        {folders?.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="editor-main">
                {/* Editor Area */}
                <div className={`editor-textarea glass-panel ${showPreview ? 'hidden' : ''}`}>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Saisissez les paroles et accords ici... Ex: [Am]Hello [C]World"
                    />
                </div>

                {/* Preview Area */}
                <div
                    ref={scrollContainerRef}
                    className={`editor-preview glass-panel ${showPreview ? '' : 'hidden'}`}
                >
                    <div className="preview-header">
                        {imageUrl && <img src={imageUrl} alt="Cover" className="preview-cover" />}
                        <h1>{title || 'Titre'}</h1>
                        <h3 className="text-muted">{artist || 'Artiste'}</h3>
                    </div>
                    <div className="preview-content">
                        <SmartSongRenderer content={content} fontSize={18} transpose={transpose} />
                    </div>
                </div>

                {/* Auto Scroller */}
                {showPreview && !isFullscreen && (
                    <AutoScroller
                        durationSeconds={parseInt(duration) || 180}
                        targetRef={scrollContainerRef}
                    />
                )}
            </div>

            {/* P1 Feature: Fullscreen Reading Mode */}
            {isFullscreen && (
                <FullscreenReader
                    content={content}
                    title={title || 'Sans titre'}
                    artist={artist || 'Artiste inconnu'}
                    transpose={transpose}
                    onTransposeChange={setTranspose}
                    duration={parseInt(duration) || 180}
                    onClose={() => setIsFullscreen(false)}
                />
            )}

            <style>{`
                .editor-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    padding: 1rem;
                }

                .editor-toolbar {
                    padding: 1rem;
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }

                .editor-title-input {
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    font-size: 1.2rem;
                    font-weight: bold;
                    flex: 1;
                    min-width: 150px;
                    padding: 0.5rem 0;
                    transition: border-color 0.2s;
                }

                .editor-title-input:focus {
                    outline: none;
                    border-bottom-color: var(--accent-primary);
                }

                .editor-artist-input {
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
                    color: #94a3b8;
                    flex: 0.5;
                    min-width: 100px;
                    padding: 0.5rem 0;
                    transition: border-color 0.2s;
                }

                .editor-artist-input:focus {
                    outline: none;
                    border-bottom-color: var(--accent-primary);
                    color: white;
                }

                .transpose-controls {
                    display: flex;
                    align-items: center;
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    padding: 0 0.5rem;
                }

                .transpose-controls span {
                    margin: 0 0.5rem;
                    min-width: 1.5rem;
                    text-align: center;
                    font-size: 0.9rem;
                }

                .transpose-controls span.active {
                    color: var(--accent-primary);
                }

                .transpose-controls button {
                    padding: 0.25rem 0.5rem;
                }

                .save-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .mode-scene-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1px solid var(--accent-primary);
                    color: var(--accent-primary);
                }

                .mode-scene-btn:hover {
                    background: rgba(99, 102, 241, 0.1);
                    color: white;
                }

                .mode-scene-mobile {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem !important;
                    min-width: 44px;
                    flex: 0 !important;
                }

                .editor-details {
                    padding: 0 0 1rem 0;
                }

                .detail-section {
                    margin-bottom: 1rem;
                }

                .detail-section label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.7);
                }

                .url-input {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 0.5rem;
                    border-radius: 6px;
                    width: 100%;
                    font-size: 0.85rem;
                    margin-top: 0.5rem;
                }

                .detail-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    opacity: 0.7;
                    margin-bottom: 0.5rem;
                    flex-wrap: wrap;
                }

                .duration-input {
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: white;
                    padding: 0.5rem;
                    border-radius: 4px;
                    width: 80px;
                }

                .duration-display {
                    font-size: 0.8rem;
                }

                .folder-select {
                    background: #1e1e24;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 0.5rem;
                    border-radius: 4px;
                    width: 100%;
                    cursor: pointer;
                }

                .folder-select option {
                    background: #1e1e24;
                    color: white;
                }

                .editor-main {
                    display: flex;
                    flex: 1;
                    gap: 1rem;
                    overflow: hidden;
                    position: relative;
                }

                .editor-textarea {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .editor-textarea.hidden {
                    display: none;
                }

                .editor-textarea textarea {
                    flex: 1;
                    background: transparent;
                    color: #fff;
                    border: none;
                    padding: 1rem;
                    resize: none;
                    font-family: monospace;
                    line-height: 1.5;
                    outline: none;
                    font-size: 16px;
                }

                .editor-preview {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    scroll-behavior: smooth;
                }

                .editor-preview.hidden {
                    display: none;
                }

                .preview-header {
                    padding: 2rem;
                    text-align: center;
                }

                .preview-cover {
                    width: 150px;
                    height: 150px;
                    object-fit: cover;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                }

                .preview-header h1 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .preview-content {
                    padding: 0 2rem 100vh 2rem;
                }

                /* Mobile Header */
                .editor-mobile-header {
                    display: none;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0;
                    margin-bottom: 0.5rem;
                }

                .editor-mobile-header .editor-mobile-title {
                    flex: 1;
                }

                .editor-mobile-header input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: bold;
                }

                /* Mobile Controls */
                .editor-mobile-controls {
                    display: none;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    flex-wrap: wrap;
                }

                .mobile-control-btn {
                    flex: 1;
                    padding: 0.5rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 60px;
                }

                .mobile-control-btn.active {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: var(--accent-primary);
                    color: white;
                }

                .mobile-transpose {
                    display: flex;
                    align-items: center;
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .mobile-transpose button {
                    padding: 0.5rem 0.75rem;
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1rem;
                    cursor: pointer;
                }

                .mobile-transpose span {
                    padding: 0 0.5rem;
                    color: var(--accent-primary);
                    font-weight: bold;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .editor-container {
                        padding: 0.5rem;
                    }

                    .editor-mobile-header {
                        display: flex;
                    }

                    .editor-mobile-controls {
                        display: flex;
                    }

                    .editor-details {
                        display: none;
                        padding: 1rem;
                        background: rgba(255,255,255,0.03);
                        border-radius: 12px;
                        margin-bottom: 0.75rem;
                    }

                    .editor-details.show {
                        display: block;
                    }

                    .preview-header {
                        padding: 1rem;
                    }

                    .preview-cover {
                        width: 100px;
                        height: 100px;
                    }

                    .preview-header h1 {
                        font-size: 1.5rem;
                    }

                    .preview-content {
                        padding: 0 1rem 50vh 1rem;
                    }

                    /* P0 Fix: Mobile-only sections */
                    .detail-section-mobile {
                        display: block;
                    }
                }

                /* Hide mobile-only sections on desktop */
                .detail-section-mobile {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default SongEditor;
