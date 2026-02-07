import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { db } from '../db/db';

const ChordEditorModal = ({ onClose, onSuccess, initialName = '', lockedName = false }) => {
    const [name, setName] = useState(initialName);
    const [category, setCategory] = useState('Standard');
    const [tags, setTags] = useState('');
    // Default E A D G B e (Strings 6 to 1)
    const [fingering, setFingering] = useState({
        strings: { 6: -1, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, // -1 = Mute, 0 = Open
        fingers: { 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }  // 0 = No finger
    });

    const handleSave = async () => {
        if (!name) return alert('Nom requis');

        const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);

        // Check if chord exists
        const existingChord = await db.chords.where('name').equals(name).first();

        if (existingChord) {
            // Merge Logic
            let newPositions = [];

            // Normalize existing data
            if (existingChord.data.positions) {
                newPositions = [...existingChord.data.positions];
            } else if (existingChord.data.strings) {
                newPositions = [existingChord.data];
            } else if (existingChord.data.frets) {
                // Handle legacy legacy format if any
                newPositions = [existingChord.data];
            }

            // Add new variation (Transform 'strings' format to 'frets' format if we want consistency? 
            // Or just push the 'strings' object. ChordDiagram handles both. 
            // But 'Set Default' logic prefers one or the other.
            // Let's standardise on passing the 'fingering' object directly but wrapping it if we want consistency.
            // Actually, let's keep it simple: push the object we have.
            newPositions.push(fingering);

            await db.chords.update(existingChord.id, {
                'data.positions': newPositions,
                // Optional: merge tags?
            });
            // alert('Variation ajoutée à l\'accord existant !');
        } else {
            // Create New
            // For consistency, let's start saving as { positions: [...] } structure
            await db.chords.add({
                name,
                category,
                tags: tagsArray,
                data: { positions: [fingering] } // Start with array structure
            });
        }

        onSuccess();
        onClose();
    };

    const handleStringChange = (stringNum, field, value) => {
        setFingering(prev => ({
            ...prev,
            [field]: { ...prev[field], [stringNum]: parseInt(value) || 0 }
        }));
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
            <div className="glass-panel" style={{ width: '500px', padding: '2rem', borderRadius: '16px', position: 'relative', border: '1px solid var(--border-subtle)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Nouvel Accord</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Nom (ex: Cmaj7)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={lockedName}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: lockedName ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-subtle)',
                                color: lockedName ? 'var(--text-muted)' : 'white',
                                cursor: lockedName ? 'not-allowed' : 'text'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Catégorie</label>
                        <input list="categories" value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'white' }} />
                        <datalist id="categories">
                            <option value="Standard" />
                            <option value="Rock" />
                            <option value="Jazz" />
                            <option value="Bossa Nova" />
                            <option value="Flamenco" />
                            <option value="Reggae" />
                        </datalist>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Tags (séparés par virgule)</label>
                        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Majeur, Barré..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'white' }} />
                    </div>

                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>Configuration (Corde 6 Grave → Corde 1 Aiguë)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(6, 1fr)', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corde</span>
                            {[6, 5, 4, 3, 2, 1].map(s => <span key={s} style={{ textAlign: 'center', fontWeight: 'bold' }}>{s}</span>)}

                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frette (-1=X)</span>
                            {[6, 5, 4, 3, 2, 1].map(s => (
                                <input
                                    key={s}
                                    type="number"
                                    value={fingering.strings[s]}
                                    onChange={e => handleStringChange(s, 'strings', e.target.value)}
                                    style={{ width: '100%', padding: '4px', textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px' }}
                                />
                            ))}

                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doigt (1-4)</span>
                            {[6, 5, 4, 3, 2, 1].map(s => (
                                <input
                                    key={s}
                                    type="number"
                                    value={fingering.fingers[s]}
                                    onChange={e => handleStringChange(s, 'fingers', e.target.value)}
                                    style={{ width: '100%', padding: '4px', textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px' }}
                                />
                            ))}
                        </div>
                    </div>

                    <button onClick={handleSave} className="btn-primary" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={20} /> Enregistrer l'Accord
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChordEditorModal;
