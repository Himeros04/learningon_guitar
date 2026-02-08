import React from 'react';
import ImageUploader from '../ImageUploader';

const EditorMetaPanel = ({
    showDetails,
    imageUrl,
    setImageUrl,
    artist,
    setArtist,
    folderId,
    setFolderId,
    folders
}) => {
    return (
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
    );
};

export default EditorMetaPanel;
