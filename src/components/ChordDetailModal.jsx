import React, { useState, useEffect } from 'react';
import { X, Check, Star, Plus, Trash2 } from 'lucide-react';
import ChordDiagram from './ChordDiagram';
import ConfirmModal from './ConfirmModal';
import { updateChord, deleteChord as deleteChordFirebase, subscribeChords } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ChordDetailModal = ({ chord: initialChord, onClose, onAddVariation }) => {
    const { user } = useAuth();
    // Determine ID safely
    const chordId = initialChord?.id;

    // Live subscription to listen for changes (e.g. Set Default reorder)
    const [displayChord, setDisplayChord] = useState(initialChord);

    useEffect(() => {
        if (!user || !chordId) return;

        const unsubscribe = subscribeChords(user.uid, (chords) => {
            const found = chords.find(c => c.id === chordId);
            if (found) setDisplayChord(found);
        });

        return () => unsubscribe();
    }, [user, chordId]);

    // Guard clause: if data is missing, don't render content to avoid crash
    if (!displayChord || !displayChord.data) return null;

    // Normalize variations from DB data
    let variations = [];
    if (displayChord.data.positions) {
        variations = displayChord.data.positions;
    } else if (displayChord.data.strings) {
        // Legacy single chord format -> wrap in array
        variations = [displayChord.data];
    } else if (displayChord.data.frets) {
        // Another legacy possibility
        variations = [displayChord.data];
    }

    // View state for carousel
    const [selectedIdx, setSelectedIdx] = useState(0);

    const handleSetDefault = async (index) => {
        // Reorder variations so the selected one becomes index 0 (default)
        if (!displayChord.id) return;

        let newPositions = [...variations];

        // Safety check index
        if (index < 0 || index >= newPositions.length) return;

        const selectedVar = newPositions.splice(index, 1)[0];
        newPositions.unshift(selectedVar);

        await updateChord(displayChord.id, {
            data: { positions: newPositions }
        });

        // Reset view to default (0)
        setSelectedIdx(0);
    };

    // --- Deletion Logic ---
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: null, // 'chord' or 'variation'
        index: null
    });

    const handleDeleteClick = (type, index = null) => {
        // If deleting the ONLY variation, switch to full chord delete context
        if (type === 'variation' && variations.length <= 1) {
            setDeleteModal({
                isOpen: true,
                type: 'chord',
                index: null
            });
            return;
        }

        setDeleteModal({
            isOpen: true,
            type,
            index
        });
    };

    const confirmDelete = async () => {
        if (!displayChord.id) return;

        if (deleteModal.type === 'chord') {
            await deleteChordFirebase(displayChord.id);
            onClose(); // Close modal immediately
        } else if (deleteModal.type === 'variation' && deleteModal.index !== null) {
            const newPositions = [...variations];
            newPositions.splice(deleteModal.index, 1);

            await updateChord(displayChord.id, {
                data: { positions: newPositions }
            });

            // Adjust selected index if needed
            if (selectedIdx >= newPositions.length) {
                setSelectedIdx(Math.max(0, newPositions.length - 1));
            }
        }

        setDeleteModal({ isOpen: false, type: null, index: null });
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
            <div className="glass-panel" style={{ width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '0', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {displayChord.name} <span style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 'normal', border: '1px solid currentColor', padding: '1px 6px', borderRadius: '4px' }}>{displayChord.category}</span>
                        </h2>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Choisissez la variation par défaut</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => handleDeleteClick('chord')}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px' }}
                            title="Supprimer cet accord"
                            className="btn-ghost-danger"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem', display: 'flex', gap: '2rem', overflowX: 'auto', alignItems: 'stretch' }}>

                    {/* Variations List */}
                    {variations.map((variant, idx) => {
                        // Prepare data for ChordDiagram. It expects { strings: ... } OR { positions: [...] } OR { frets: ... } (legacy handling in Diagram)
                        // If 'variant' is a raw position object { frets: ... } or { strings: ... }, we pass it directly.
                        // However, ChordDiagram standardises on checking .strings or .positions[0].
                        // If we pass a raw object { frets: ... }, ChordDiagram might render default "?" if it expects root structure.
                        // Let's wrap it in { positions: [variant] } just to be safe if it's fret-based.
                        // If it's string-based (from DB legacy), it has .strings.

                        const isStringBased = !!variant.strings;
                        const displayData = isStringBased ? variant : { positions: [variant] };

                        const isSelected = idx === selectedIdx;
                        const isDefault = idx === 0;

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedIdx(idx)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    minWidth: '120px',
                                    cursor: 'pointer',
                                    opacity: isSelected ? 1 : 0.5,
                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    padding: '1rem',
                                    background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    borderRadius: '8px',
                                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent'
                                }}>
                                    <ChordDiagram chordData={displayData} width={100} height={120} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                    {isDefault ? (
                                        <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                                            <Check size={14} /> Par défaut
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-ghost"
                                                onClick={(e) => { e.stopPropagation(); handleSetDefault(idx); }}
                                                style={{ fontSize: '0.8rem', padding: '0.25rem', flex: 1 }}
                                            >
                                                Définir par défaut
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick('variation', idx); }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    padding: '0.25rem',
                                                    opacity: 0.7
                                                }}
                                                title="Supprimer cette variation"
                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '120px' }}>
                        <button
                            onClick={onAddVariation}
                            style={{
                                width: '50px', height: '50px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--text-muted)',
                                color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            title="Ajouter une variation"
                        >
                            <Plus />
                        </button>
                    </div>

                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title={deleteModal.type === 'chord' ? "Supprimer l'accord" : "Supprimer la variation"}
                message={deleteModal.type === 'chord'
                    ? `Êtes-vous sûr de vouloir supprimer définitivement l'accord "${displayChord.name}" et toutes ses variations ?`
                    : "Êtes-vous sûr de vouloir supprimer cette variation ?"}
                confirmText="Supprimer"
                variant="danger"
            />
        </div >
    );
};

export default ChordDetailModal;
