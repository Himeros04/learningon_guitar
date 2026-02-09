import React from 'react';
import { ChevronLeft, Eye, Save, Maximize2, Zap, Camera } from 'lucide-react';

const EditorMobileNav = ({
    title,
    setTitle,
    artist,
    setArtist,
    showPreview,
    setShowPreview,
    showDetails,
    setShowDetails,
    transpose,
    setTranspose,
    setIsFullscreen,
    handleSave,
    navigate,
    onFocusMode,
    onOpenOcr
}) => {
    return (
        <>
            {/* Mobile Header */}
            <div className="editor-mobile-header">
                <button className="btn-ghost" onClick={() => navigate('/library')} aria-label="Retour à la bibliothèque">
                    <ChevronLeft size={24} />
                </button>
                <div className="editor-mobile-title">
                    <input
                        type="text"
                        placeholder="Titre"
                        className="mobile-title-input"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Artiste"
                        className="mobile-artist-input"
                        value={artist}
                        onChange={e => setArtist(e.target.value)}
                    />
                </div>
                {!showPreview && (
                    <>
                        <button className="btn-ghost" onClick={onOpenOcr} style={{ padding: '0.5rem' }} aria-label="Scanner Photo">
                            <Camera size={20} />
                        </button>
                        <button className="btn-ghost" onClick={() => { setShowPreview(true); setShowDetails(false); }} style={{ padding: '0.5rem' }} aria-label="Voir l'aperçu">
                            <Eye size={20} />
                        </button>
                    </>
                )}
                <button className="btn-primary" onClick={handleSave} style={{ padding: '0.5rem' }} aria-label="Enregistrer">
                    <Save size={20} />
                </button>
            </div>

            {/* Mobile Controls Bar */}
            <div className={`editor-mobile-controls ${!showPreview && !showDetails ? 'hidden' : ''}`}>
                <button
                    className={`mobile-control-btn ${showPreview && !showDetails ? 'active' : ''}`}
                    onClick={() => { setShowPreview(true); setShowDetails(false); }}
                >
                    Aperçu
                </button>
                <button
                    className={`mobile-control-btn ${!showPreview && !showDetails ? 'active' : ''}`}
                    onClick={() => { setShowPreview(false); setShowDetails(false); }}
                >
                    Éditer
                </button>
                <button
                    className={`mobile-control-btn ${showDetails ? 'active' : ''}`}
                    onClick={() => { setShowDetails(true); }}
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
                {showPreview && (
                    <button
                        className="mobile-control-btn mode-scene-mobile"
                        onClick={onFocusMode}
                        aria-label="Mode Focus"
                        style={{ border: '1px solid #10b981', color: '#10b981' }}
                    >
                        <Zap size={16} />
                    </button>
                )}
            </div>
        </>
    );
};

export default EditorMobileNav;
