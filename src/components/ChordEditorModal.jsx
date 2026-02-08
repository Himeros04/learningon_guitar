import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { db } from '../db/db';

/**
 * ChordEditorModal - Modern visual chord editor
 * 
 * Features:
 * - Interactive fretboard grid with click-to-place dots
 * - Visual nut at top
 * - Click on fret intersection to place/remove finger
 * - Click on open string area to toggle open/muted
 */
const ChordEditorModal = ({ onClose, onSuccess, initialName = '', lockedName = false }) => {
    const [name, setName] = useState(initialName);
    const [category, setCategory] = useState('Standard');
    const [tags, setTags] = useState('');

    // strings[stringNum] = fret position (-1 = muted, 0 = open, 1-12 = fret)
    const [strings, setStrings] = useState({ 6: -1, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    // fingers[stringNum] = finger number (0 = none, 1-4 = finger)
    const [fingers, setFingers] = useState({ 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    const NUM_FRETS = 5;
    const STRING_NUMBERS = [6, 5, 4, 3, 2, 1]; // Left to right (low E to high e)

    const handleFretClick = (stringNum, fret) => {
        setStrings(prev => ({
            ...prev,
            [stringNum]: prev[stringNum] === fret ? 0 : fret
        }));
        // Auto-assign finger for non-open frets
        if (fret > 0) {
            setFingers(prev => ({
                ...prev,
                [stringNum]: prev[stringNum] === 0 ? 1 : prev[stringNum]
            }));
        } else {
            setFingers(prev => ({ ...prev, [stringNum]: 0 }));
        }
    };

    const handleOpenMuteClick = (stringNum) => {
        setStrings(prev => {
            const current = prev[stringNum];
            // Cycle: open (0) -> muted (-1) -> open (0)
            if (current === 0) return { ...prev, [stringNum]: -1 };
            if (current === -1) return { ...prev, [stringNum]: 0 };
            // If there's a fret, reset to open
            return { ...prev, [stringNum]: 0 };
        });
        setFingers(prev => ({ ...prev, [stringNum]: 0 }));
    };

    const handleFingerChange = (stringNum, finger) => {
        setFingers(prev => ({ ...prev, [stringNum]: finger }));
    };

    const handleReset = () => {
        setStrings({ 6: -1, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        setFingers({ 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    };

    const handleSave = async () => {
        if (!name) return alert('Nom requis');

        const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
        const fingering = { strings, fingers };

        const existingChord = await db.chords.where('name').equals(name).first();

        if (existingChord) {
            let newPositions = [];
            if (existingChord.data.positions) {
                newPositions = [...existingChord.data.positions];
            } else if (existingChord.data.strings) {
                newPositions = [existingChord.data];
            } else if (existingChord.data.frets) {
                newPositions = [existingChord.data];
            }
            newPositions.push(fingering);
            await db.chords.update(existingChord.id, { 'data.positions': newPositions });
        } else {
            await db.chords.add({
                name,
                category,
                tags: tagsArray,
                data: { positions: [fingering] }
            });
        }

        onSuccess();
        onClose();
    };

    return (
        <div className="chord-editor-backdrop">
            <div className="chord-editor-modal glass-panel">
                <button className="chord-editor-close" onClick={onClose} aria-label="Fermer">
                    <X size={24} />
                </button>

                <h2 className="chord-editor-title">Nouvel Accord</h2>

                <div className="chord-editor-form">
                    {/* Name Input */}
                    <div className="chord-editor-field">
                        <label>Nom de l'accord</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={lockedName}
                            placeholder="Ex: Cmaj7, Am, G7..."
                            autoComplete="off"
                        />
                    </div>

                    {/* Visual Fretboard */}
                    <div className="chord-editor-fretboard-container">
                        <div className="chord-editor-fretboard">
                            {/* Open/Mute indicators row */}
                            <div className="fretboard-open-row">
                                {STRING_NUMBERS.map(s => (
                                    <div
                                        key={s}
                                        className="fretboard-open-cell"
                                        onClick={() => handleOpenMuteClick(s)}
                                    >
                                        {strings[s] === 0 && <span className="open-indicator">○</span>}
                                        {strings[s] === -1 && <span className="mute-indicator">✕</span>}
                                    </div>
                                ))}
                            </div>

                            {/* Nut */}
                            <div className="fretboard-nut" />

                            {/* Frets */}
                            {[1, 2, 3, 4, 5].map(fret => (
                                <div key={fret} className="fretboard-fret-row">
                                    {STRING_NUMBERS.map(s => (
                                        <div
                                            key={s}
                                            className={`fretboard-cell ${strings[s] === fret ? 'active' : ''}`}
                                            onClick={() => handleFretClick(s, fret)}
                                        >
                                            {strings[s] === fret && (
                                                <div className="finger-dot">
                                                    {fingers[s] > 0 ? fingers[s] : ''}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <span className="fret-number">{fret}</span>
                                </div>
                            ))}

                            {/* String lines (visual) */}
                            <div className="fretboard-strings">
                                {STRING_NUMBERS.map(s => (
                                    <div key={s} className="fretboard-string" />
                                ))}
                            </div>
                        </div>

                        {/* Finger selector */}
                        <div className="finger-selector">
                            <span className="finger-label">Doigt:</span>
                            {[1, 2, 3, 4].map(f => (
                                <button
                                    key={f}
                                    className={`finger-btn ${Object.values(fingers).includes(f) ? 'used' : ''}`}
                                    onClick={() => {
                                        // Apply to currently selected string (last clicked with fret > 0)
                                        const activeString = STRING_NUMBERS.find(s => strings[s] > 0 && fingers[s] === 0);
                                        if (activeString) {
                                            handleFingerChange(activeString, f);
                                        }
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category and Tags */}
                    <div className="chord-editor-row">
                        <div className="chord-editor-field">
                            <label>Catégorie</label>
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="Standard">Standard</option>
                                <option value="Jazz">Jazz</option>
                                <option value="Rock">Rock</option>
                                <option value="Bossa Nova">Bossa Nova</option>
                                <option value="Flamenco">Flamenco</option>
                            </select>
                        </div>
                        <div className="chord-editor-field">
                            <label>Tags</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                placeholder="Majeur, Barré..."
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="chord-editor-actions">
                        <button className="btn-ghost" onClick={handleReset}>
                            <RotateCcw size={18} /> Réinitialiser
                        </button>
                        <button className="btn-primary" onClick={handleSave}>
                            <Save size={18} /> Enregistrer
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .chord-editor-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    z-index: var(--z-modal, 100);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(8px);
                    padding: 1rem;
                }

                .chord-editor-modal {
                    width: 100%;
                    max-width: 420px;
                    padding: 1.5rem;
                    border-radius: 16px;
                    position: relative;
                    border: 1px solid var(--border-subtle);
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .chord-editor-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.25rem;
                    transition: color 0.2s;
                }

                .chord-editor-close:hover {
                    color: white;
                }

                .chord-editor-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 1.5rem;
                }

                .chord-editor-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .chord-editor-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .chord-editor-field label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .chord-editor-field input,
                .chord-editor-field select {
                    padding: 0.75rem;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-subtle);
                    color: white;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .chord-editor-field input:focus,
                .chord-editor-field select:focus {
                    outline: none;
                    border-color: var(--accent-primary);
                }

                .chord-editor-field input:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .chord-editor-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                /* Fretboard Container */
                .chord-editor-fretboard-container {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    padding: 1rem;
                }

                .chord-editor-fretboard {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                /* Open/Mute row */
                .fretboard-open-row {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    height: 28px;
                    margin-bottom: 4px;
                }

                .fretboard-open-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .open-indicator {
                    color: #22c55e;
                    font-weight: bold;
                }

                .mute-indicator {
                    color: #ef4444;
                    font-weight: bold;
                }

                /* Nut */
                .fretboard-nut {
                    height: 6px;
                    background: linear-gradient(to bottom, #f5f5f5, #d4d4d4);
                    border-radius: 2px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                /* Fret rows */
                .fretboard-fret-row {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr) 30px;
                    height: 40px;
                    border-bottom: 2px solid #555;
                    position: relative;
                }

                .fretboard-fret-row:last-of-type {
                    border-bottom: none;
                }

                .fretboard-cell {
                    position: relative;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.15s;
                }

                .fretboard-cell:hover {
                    background: rgba(99, 102, 241, 0.2);
                }

                .fretboard-cell::before {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(to bottom, #888, #666);
                    transform: translateX(-50%);
                }

                .finger-dot {
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #333, #111);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.8rem;
                    font-weight: bold;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
                    z-index: 2;
                }

                .fret-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                /* Finger selector */
                .finger-selector {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    justify-content: center;
                }

                .finger-label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .finger-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px solid var(--border-subtle);
                    background: transparent;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .finger-btn:hover {
                    border-color: var(--accent-primary);
                    background: rgba(99, 102, 241, 0.1);
                }

                .finger-btn.used {
                    background: var(--accent-primary);
                    border-color: var(--accent-primary);
                }

                /* Actions */
                .chord-editor-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 0.5rem;
                }

                .chord-editor-actions .btn-ghost {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .chord-editor-actions .btn-primary {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                @media (max-width: 480px) {
                    .chord-editor-modal {
                        padding: 1rem;
                    }

                    .chord-editor-row {
                        grid-template-columns: 1fr;
                    }

                    .fretboard-fret-row {
                        height: 36px;
                    }

                    .finger-dot {
                        width: 24px;
                        height: 24px;
                        font-size: 0.7rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ChordEditorModal;
