import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Music, Calendar, Star, Trash2 } from 'lucide-react';
import FolderList from './FolderList';
import ConfirmModal from './ConfirmModal';
import { useSongsByFolder } from '../hooks/useFirestore';
import { updateSong, deleteSong } from '../firebase/firestore';

const Library = () => {
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const { songs, loading } = useSongsByFolder(selectedFolderId);

    // Delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, songId: null, songTitle: '' });

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
                <Link to="/editor" className="btn-primary library-add-btn">
                    <Plus size={20} /> <span className="hide-mobile">Nouvelle Partition</span>
                </Link>
            </header>

            {/* Mobile Folder List - Horizontal scrollable */}
            <div className="show-mobile" style={{ marginBottom: '1rem' }}>
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
                    <p className="text-muted" style={{ marginBottom: '1rem' }}>
                        {songs.length} partition{songs.length !== 1 ? 's' : ''} {selectedFolderId ? 'dans ce dossier' : 'au total'}
                    </p>

                    {songs.length === 0 ? (
                        <div className="glass-panel library-empty">
                            <Music size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <h3>Aucune partition trouvée</h3>
                            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{selectedFolderId ? 'Ce dossier est vide.' : 'Commencez par créer votre première partition !'}</p>
                            <Link to="/editor" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                                <Music size={40} style={{ opacity: 0.1 }} />
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
                                            <span><Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
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

            <style>{`
                .library-container {
                    padding: 2rem;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .library-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .library-title {
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .library-add-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                }

                .library-content {
                    display: flex;
                    gap: 2rem;
                    flex: 1;
                    overflow: hidden;
                }

                .library-sidebar {
                    width: 250px;
                    flex-shrink: 0;
                    height: 100%;
                }

                .library-songs {
                    flex: 1;
                    overflow-y: auto;
                    padding-bottom: 2rem;
                }

                .library-empty {
                    padding: 3rem;
                    text-align: center;
                    border-radius: 16px;
                }

                .library-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .song-card {
                    display: block;
                    text-decoration: none;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: transform 0.2s;
                    color: inherit;
                    position: relative;
                }

                .song-card:hover {
                    transform: translateY(-4px);
                }

                .song-card-image {
                    height: 140px;
                    background: #2a2a30;
                    position: relative;
                }

                .song-card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .song-card-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .song-card-favorite {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: rgba(0,0,0,0.5);
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .song-card-favorite:hover {
                    transform: scale(1.1);
                }

                .song-card-gradient {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                }

                .song-card-info {
                    padding: 1rem;
                }

                .song-card-title {
                    font-weight: bold;
                    font-size: 1.1rem;
                    margin-bottom: 0.25rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .song-card-artist {
                    font-size: 0.9rem;
                }

                .song-card-meta {
                    margin-top: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8rem;
                    opacity: 0.5;
                }

                .song-card-delete {
                    background: transparent;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                    opacity: 0.7;
                    padding: 4px;
                    border-radius: 4px;
                    transition: opacity 0.2s, background 0.2s;
                }

                .song-card-delete:hover {
                    opacity: 1;
                    background: rgba(239, 68, 68, 0.1);
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .library-container {
                        padding: 1rem;
                    }

                    .library-title {
                        font-size: 1.5rem;
                    }

                    .library-content {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .library-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .song-card-image {
                        height: 120px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Library;
