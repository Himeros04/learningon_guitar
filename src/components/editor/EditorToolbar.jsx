import React from 'react';
import { Save, Maximize2, Zap } from 'lucide-react';

const EditorToolbar = ({
    title,
    setTitle,
    artist,
    setArtist,
    showPreview,
    setShowPreview,
    transpose,
    setTranspose,
    isFullscreen,
    setIsFullscreen,
    handleSave,
    loading,
    onFocusMode
}) => {
    return (
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
                    <Maximize2 size={18} /> Scène
                </button>
            )}

            {showPreview && (
                <button
                    className="btn-ghost mode-focus-btn"
                    onClick={onFocusMode}
                    aria-label="Mode Focus"
                    style={{ border: '1px solid #10b981', color: '#10b981' }}
                >
                    <Zap size={18} /> Focus
                </button>
            )}

            <button
                className="btn-primary save-btn"
                onClick={handleSave}
                disabled={loading}
            >
                <Save size={18} /> {loading ? '...' : 'Enregistrer'}
            </button>
        </div>
    );
};

export default EditorToolbar;
