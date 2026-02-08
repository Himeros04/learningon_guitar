import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Music, Calendar, Star, Trash2, Camera } from 'lucide-react';
import FolderList from './FolderList';
import ConfirmModal from './ConfirmModal';
import OcrImportModal from './OcrImportModal';
import { useSongsByFolder } from '../hooks/useFirestore';
import { updateSong, deleteSong } from '../firebase/firestore';

const Library = () => {
    const navigate = useNavigate();
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const { songs, loading } = useSongsByFolder(selectedFolderId);

    // Delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, songId: null, songTitle: '' });

    // OCR import modal state
    const [showOcrModal, setShowOcrModal] = useState(false);

    // Toggle favorite status
    const toggleFavorite = async (e, songId, currentStatus) => {
        e.preventDefault();
        e.stopPropagation();
        await updateSong(songId, { isFavorite: !currentStatus });
    };

    // Open delete confirmation modal
    const openDeleteModal = (e, songId, songTitle) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ isOpen: true, songId, songTitle });
    };

    // Confirm deletion
    const confirmDelete = async () => {
        if (deleteModal.songId) {
            await deleteSong(deleteModal.songId);
        }
    };

    // Handle OCR success - navigate to editor with pre-filled data
    const handleOcrSuccess = (ocrData) => {
        navigate('/editor', {
            state: {
                ocrData: {
                    title: ocrData.title,
                    artist: ocrData.artist,
                    content: ocrData.content
                }
            }
        });
    };

    // Helper to format date (handles Firestore Timestamp)
    const formatDate = (date) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    };


    if (loading) return <div className="p-8 text-muted">Chargement...</div>;

    return (
        <div className="library-container">
            <header className="library-header">
                <div>
                    <h1 className="library-title">Bibliothèque</h1>
                </div>
                <div className="library-header-actions">
                    <button
                        onClick={() => setShowOcrModal(true)}
                        className="btn-ghost library-ocr-btn"
                        title="Importer via photo"
                    >
                        <Camera size={20} />
                        <span className="hide-mobile">Photo</span>
                    </button>
                    <Link to="/editor" className="btn-primary library-add-btn">
                        <Plus size={20} /> <span className="hide-mobile">Nouvelle Partition</span>
                    </Link>
                </div>
            </header>

            {/* Mobile Folder List - Horizontal scrollable */}
            <div className="show-mobile library-mobile-folders">
                <FolderList
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={setSelectedFolderId}
                    horizontal={true}
                />
            </div>

            <div className="library-content">
                {/* Desktop Sidebar for Folders */}
                <div className="library-sidebar hide-mobile">
                    <FolderList selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />
                </div>

                {/* Grid Area */}
                <div className="library-songs">
                    <p className="text-muted library-count">
                        {songs.length} partition{songs.length !== 1 ? 's' : ''} {selectedFolderId ? 'dans ce dossier' : 'au total'}
                    </p>

                    {songs.length === 0 ? (
                        <div className="glass-panel library-empty">
                            <Music size={48} className="library-empty-icon" />
                            <h3>Aucune partition trouvée</h3>
                            <p className="text-muted library-empty-text">{selectedFolderId ? 'Ce dossier est vide.' : 'Commencez par créer votre première partition !'}</p>
                            <Link to="/editor" className="btn-primary library-create-btn">
                                Créer une chanson
                            </Link>
                        </div>
                    ) : (
                        <div className="library-grid">
                            {songs.map(song => (
                                <Link to={`/editor/${song.id}`} key={song.id} className="song-card glass-panel">
                                    <div className="song-card-image">
                                        {song.image ? (
                                            <img src={song.image} alt={song.title} />
                                        ) : (
                                            <div className="song-card-placeholder">
                                                <Music size={40} className="song-card-placeholder-icon" />
                                            </div>
                                        )}
                                        {/* Favorite Star */}
                                        <button
                                            onClick={(e) => toggleFavorite(e, song.id, song.isFavorite)}
                                            className="song-card-favorite"
                                        >
                                            <Star
                                                size={18}
                                                fill={song.isFavorite ? '#fbbf24' : 'none'}
                                                color={song.isFavorite ? '#fbbf24' : 'white'}
                                            />
                                        </button>
                                        <div className="song-card-gradient" />
                                    </div>
                                    <div className="song-card-info">
                                        <h3 className="song-card-title">{song.title}</h3>
                                        <p className="text-muted song-card-artist">{song.artist || 'Artiste inconnu'}</p>
                                        <div className="song-card-meta">
                                            <span><Calendar size={12} className="song-card-date-icon" />
                                                {formatDate(song.updatedAt)}
                                            </span>
                                            <button
                                                onClick={(e) => openDeleteModal(e, song.id, song.title)}
                                                className="song-card-delete"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, songId: null, songTitle: '' })}
                onConfirm={confirmDelete}
                title="Supprimer la partition"
                message={`Êtes-vous sûr de vouloir supprimer "${deleteModal.songTitle}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                variant="danger"
            />

            {/* OCR Import Modal */}
            {showOcrModal && (
                <OcrImportModal
                    onClose={() => setShowOcrModal(false)}
                    onSuccess={handleOcrSuccess}
                />
            )}
        </div>
    );
};

export default Library;
