import React, { useState } from 'react';
import { Folder, FolderPlus, Trash, Star, X } from 'lucide-react';
import { useFolders, useFavoriteCount } from '../hooks/useFirestore';
import { addFolder, deleteFolder } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from './ConfirmModal';

const FolderList = ({ selectedFolderId, onSelectFolder, horizontal = false }) => {
    const { user } = useAuth();
    const { folders, loading } = useFolders();
    const favoriteCount = useFavoriteCount();
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, folderId: null, folderName: '' });

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (newFolderName.trim() && user) {
            await addFolder(user.uid, {
                name: newFolderName,
                parentId: null
            });
            setNewFolderName('');
            setIsCreating(false);
        }
    };

    // Open delete confirmation
    const openDeleteModal = (e, folderId, folderName) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, folderId, folderName });
    };

    // Confirm folder deletion
    const confirmDeleteFolder = async () => {
        if (deleteModal.folderId && user) {
            await deleteFolder(user.uid, deleteModal.folderId);
            if (selectedFolderId === deleteModal.folderId) onSelectFolder(null);
        }
    };

    if (loading) return null;

    // Horizontal mode for mobile
    if (horizontal) {
        return (
            <>
                <div className="folder-list-horizontal">
                    {/* All Songs */}
                    <button
                        className={`folder-chip ${selectedFolderId === null ? 'active' : ''}`}
                        onClick={() => onSelectFolder(null)}
                    >
                        <Folder size={14} />
                        <span>Toutes</span>
                    </button>

                    {/* Favorites */}
                    <button
                        className={`folder-chip favorites ${selectedFolderId === 'favorites' ? 'active' : ''}`}
                        onClick={() => onSelectFolder('favorites')}
                    >
                        <Star size={14} fill={selectedFolderId === 'favorites' ? '#fbbf24' : 'none'} />
                        <span>Favoris</span>
                        {favoriteCount > 0 && <span className="folder-chip-count">{favoriteCount}</span>}
                    </button>

                    {/* Regular folders */}
                    {folders.map(folder => (
                        <button
                            key={folder.id}
                            className={`folder-chip ${selectedFolderId === folder.id ? 'active' : ''}`}
                            onClick={() => onSelectFolder(folder.id)}
                        >
                            <Folder size={14} />
                            <span>{folder.name}</span>
                        </button>
                    ))}

                    {/* Add folder button */}
                    <button
                        className="folder-chip add"
                        onClick={() => setIsCreating(true)}
                    >
                        <FolderPlus size={14} />
                    </button>
                </div>

                {/* Create folder modal overlay for mobile */}
                {isCreating && (
                    <div className="folder-create-overlay">
                        <form onSubmit={handleCreateFolder} className="folder-create-form">
                            <input
                                autoFocus
                                type="text"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                placeholder="Nom du dossier..."
                            />
                            <button type="submit" className="btn-primary">Créer</button>
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => { setNewFolderName(''); setIsCreating(false); }}
                            >
                                <X size={18} />
                            </button>
                        </form>
                    </div>
                )}

                <style>{`
                    .folder-list-horizontal {
                        display: flex;
                        gap: 0.5rem;
                        overflow-x: auto;
                        padding: 0.5rem;
                        background: rgba(255,255,255,0.03);
                        border-radius: 12px;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none;
                    }

                    .folder-list-horizontal::-webkit-scrollbar {
                        display: none;
                    }

                    .folder-chip {
                        display: flex;
                        align-items: center;
                        gap: 0.35rem;
                        padding: 0.5rem 0.75rem;
                        border-radius: 20px;
                        border: 1px solid rgba(255,255,255,0.1);
                        background: rgba(255,255,255,0.05);
                        color: var(--text-muted);
                        font-size: 0.85rem;
                        white-space: nowrap;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .folder-chip:hover {
                        background: rgba(255,255,255,0.1);
                    }

                    .folder-chip.active {
                        background: rgba(99, 102, 241, 0.2);
                        border-color: var(--accent-primary);
                        color: white;
                    }

                    .folder-chip.favorites.active {
                        background: rgba(251, 191, 36, 0.2);
                        border-color: #fbbf24;
                        color: #fbbf24;
                    }

                    .folder-chip.add {
                        background: transparent;
                        border-style: dashed;
                    }

                    .folder-chip-count {
                        font-size: 0.7rem;
                        background: rgba(251, 191, 36, 0.3);
                        padding: 1px 5px;
                        border-radius: 10px;
                        color: #fbbf24;
                    }

                    .folder-create-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 1rem;
                    }

                    .folder-create-form {
                        display: flex;
                        gap: 0.5rem;
                        width: 100%;
                        max-width: 400px;
                    }

                    .folder-create-form input {
                        flex: 1;
                        background: rgba(255,255,255,0.1);
                        border: 1px solid var(--accent-primary);
                        color: white;
                        padding: 0.75rem;
                        border-radius: 8px;
                        font-size: 1rem;
                    }
                `}</style>
            </>
        );
    }

    // Vertical mode (desktop)
    return (
        <>
            <div className="glass-panel" style={{ padding: '1rem', height: '100%', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Dossiers</h3>
                    <button
                        className="btn-ghost"
                        style={{ padding: '4px' }}
                        onClick={() => setIsCreating(true)}
                        title="Nouveau dossier"
                    >
                        <FolderPlus size={18} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {/* All Songs (Root) */}
                    <div
                        className="folder-item"
                        style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: selectedFolderId === null ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            color: selectedFolderId === null ? 'white' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                        onClick={() => onSelectFolder(null)}
                    >
                        <Folder size={16} />
                        <span>Toutes les partitions</span>
                    </div>

                    {/* Favoris (virtual folder) */}
                    <div
                        className="folder-item"
                        style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: selectedFolderId === 'favorites' ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                            color: selectedFolderId === 'favorites' ? '#fbbf24' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                        onClick={() => onSelectFolder('favorites')}
                    >
                        <Star size={16} fill={selectedFolderId === 'favorites' ? '#fbbf24' : 'none'} />
                        <span>Favoris</span>
                        {favoriteCount > 0 && (
                            <span style={{
                                marginLeft: 'auto',
                                fontSize: '0.75rem',
                                background: 'rgba(251, 191, 36, 0.2)',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                color: '#fbbf24'
                            }}>
                                {favoriteCount}
                            </span>
                        )}
                    </div>

                    {/* Regular folders */}
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            className="folder-item"
                            style={{
                                padding: '0.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: selectedFolderId === folder.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                color: selectedFolderId === folder.id ? 'white' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                            onClick={() => onSelectFolder(folder.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Folder size={16} />
                                <span>{folder.name}</span>
                            </div>
                            <button
                                className="btn-ghost"
                                style={{ padding: '2px', opacity: 0.5 }}
                                onClick={(e) => openDeleteModal(e, folder.id, folder.name)}
                            >
                                <Trash size={14} />
                            </button>
                        </div>
                    ))}

                    {isCreating && (
                        <form onSubmit={handleCreateFolder} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <input
                                autoFocus
                                type="text"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                placeholder="Nom du dossier..."
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--accent-primary)',
                                    color: 'white',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    width: '100%',
                                    fontSize: '0.9rem'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setNewFolderName('');
                                        setIsCreating(false);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="btn-ghost"
                                style={{ padding: '4px', color: 'var(--text-muted)' }}
                                onClick={() => {
                                    setNewFolderName('');
                                    setIsCreating(false);
                                }}
                                title="Annuler"
                            >
                                ✕
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Delete Folder Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, folderId: null, folderName: '' })}
                onConfirm={confirmDeleteFolder}
                title="Supprimer le dossier"
                message={`Supprimer le dossier "${deleteModal.folderName}" ? Les chansons ne seront pas supprimées mais déplacées à la racine.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                variant="warning"
            />
        </>
    );
};

export default FolderList;
