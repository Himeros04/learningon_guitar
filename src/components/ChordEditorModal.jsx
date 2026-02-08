import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { addChord, updateChord, getChords } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

/**
 * ChordEditorModal - Redesigned
 * 
 * Layout:
 * - Left: Mini Guitar Neck (Position Selector)
 * - Right: Main Chord Grid (5 frets window)
 */
const ChordEditorModal = ({ onClose, onSuccess, initialName = '', lockedName = false }) => {
    const { user } = useAuth();
    const [name, setName] = useState(initialName);
    const [category, setCategory] = useState('Standard');
    const [tags, setTags] = useState('');
    const [baseFret, setBaseFret] = useState(1); // Top fret of the current view

    // strings[stringNum] = fret position (-1 = muted, 0 = open, 1+ = fret)
    const [strings, setStrings] = useState({ 6: -1, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    // fingers[stringNum] = finger number (0 = none, 1-4 = finger)
    const [fingers, setFingers] = useState({ 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    const STRING_NAMES = { 6: 'E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'e' };
    const STRING_NUMBERS = [6, 5, 4, 3, 2, 1];

    const handleFretClick = (stringNum, relativeFret) => {
        const absoluteFret = baseFret + relativeFret - 1;

        setStrings(prev => ({
            ...prev,
            [stringNum]: prev[stringNum] === absoluteFret ? 0 : absoluteFret
        }));

        if (absoluteFret > 0) {
            // Auto-assign finger logic (simplified)
            setFingers(prev => ({
                ...prev,
                [stringNum]: prev[stringNum] === 0 ? 1 : prev[stringNum]
            }));
        } else {
            setFingers(prev => ({ ...prev, [stringNum]: 0 }));
        }
    };

    const handleMuteToggle = (stringNum) => {
        setStrings(prev => ({
            ...prev,
            [stringNum]: prev[stringNum] === -1 ? 0 : -1
        }));
        setFingers(prev => ({ ...prev, [stringNum]: 0 }));
    };

    const handleFingerChange = (stringNum, finger) => {
        setFingers(prev => ({ ...prev, [stringNum]: finger }));
    };

    const handleReset = () => {
        setStrings({ 6: -1, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        setFingers({ 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        setBaseFret(1);
    };

    const handleSave = async () => {
        if (!name) return alert('Nom requis');
        if (!user) return alert('Vous devez être connecté');

        const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
        const fingering = { strings, fingers, baseFret };

        // Fetch existing chords to check for duplicates
        const existingChords = await getChords(user.uid);
        const existingChord = existingChords.find(c => c.name === name);

        if (existingChord) {
            let newPositions = existingChord.data.positions
                ? [...existingChord.data.positions, fingering]
                : [existingChord.data, fingering];

            await updateChord(existingChord.id, { data: { positions: newPositions } });
        } else {
            await addChord(user.uid, {
                name,
                category,
                tags: tagsArray,
                data: { positions: [fingering] }
            });
        }
        onSuccess(name);
        onClose();
    };

    return (
        <div className="chord-editor-backdrop">
            <div className="chord-editor-modal glass-panel">
                <button className="chord-editor-close" onClick={onClose}><X size={24} /></button>

                <h2 className="chord-editor-title">Éditeur d'accord</h2>

                <div className="chord-editor-content">
                    {/* LEFT COLUMN: Mini Neck (Navigator) */}
                    <div className="mini-neck-column">
                        <div className="mini-neck">
                            <div className="mini-nut" />
                            {[...Array(12)].map((_, i) => {
                                const fretNum = i + 1;
                                const isActive = fretNum >= baseFret && fretNum < baseFret + 5;
                                return (
                                    <div
                                        key={fretNum}
                                        className={`mini-fret ${isActive ? 'active-zone' : ''}`}
                                        onClick={() => setBaseFret(Math.max(1, Math.min(12, fretNum - 2)))}
                                    >
                                        <span className="mini-fret-num">{fretNum}</span>
                                        <div className="mini-strings">
                                            {[...Array(6)].map((_, s) => (
                                                <div key={s} className="mini-string" />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Highlight Box Overlay */}
                            <div
                                className="mini-highlight"
                                style={{ top: `${(baseFret - 1) * 20 + 6}px` }}
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Main Editor */}
                    <div className="main-editor-column">
                        {/* String Names Header */}
                        <div className="editor-header-strings">
                            {STRING_NUMBERS.map(s => (
                                <span key={s} className="string-name">{STRING_NAMES[s]}</span>
                            ))}
                        </div>

                        {/* Main Grid */}
                        <div className="main-grid-container">
                            <div className="main-grid">
                                {/* Nut (only if baseFret === 1) */}
                                {baseFret === 1 && <div className="main-nut" />}

                                {[1, 2, 3, 4, 5].map(relFret => {
                                    const absFret = baseFret + relFret - 1;
                                    return (
                                        <div key={relFret} className="grid-row">
                                            <span className="grid-fret-num">{absFret}</span>
                                            {STRING_NUMBERS.map(s => {
                                                const isDepressed = strings[s] === absFret;
                                                return (
                                                    <div
                                                        key={s}
                                                        className={`grid-cell ${isDepressed ? 'active' : ''}`}
                                                        onClick={() => handleFretClick(s, relFret)}
                                                    >
                                                        <div className="grid-string-line" />
                                                        {isDepressed && (
                                                            <div className="finger-dot-large">
                                                                {fingers[s] || ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* X / O Markers (Bottom) */}
                        <div className="editor-markers">
                            {STRING_NUMBERS.map(s => (
                                <button
                                    key={s}
                                    className={`marker-btn ${strings[s] === -1 ? 'muted' : 'open'}`}
                                    onClick={() => handleMuteToggle(s)}
                                >
                                    {strings[s] === -1 ? <X size={16} /> : (strings[s] === 0 ? '○' : '')}
                                </button>
                            ))}
                        </div>

                        {/* Finger Selector (optional, but good for detail) */}
                        <div className="finger-selector-row">
                            <span className="text-muted text-sm">Doigt :</span>
                            {[1, 2, 3, 4].map(f => (
                                <button
                                    key={f}
                                    className="finger-select-btn"
                                    onClick={() => {
                                        // Find currently selected string(s) and apply
                                        const activeS = STRING_NUMBERS.find(s => strings[s] >= baseFret && strings[s] < baseFret + 5);
                                        if (activeS) handleFingerChange(activeS, f);
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Inputs */}
                <div className="chord-form-row">
                    <input
                        className="chord-input-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nom (ex: Am7)"
                        disabled={lockedName}
                    />
                    <button className="btn-primary" onClick={handleSave}>
                        <Save size={18} /> {lockedName ? 'Mettre à jour' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            <style>{`
                .chord-editor-backdrop {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.9);
                    z-index: 100; display: flex; align-items: center; justify-content: center;
                    backdrop-filter: blur(5px);
                }
                .chord-editor-modal {
                    width: 100%; max-width: 600px; padding: 2rem;
                    background: #1e1e24; border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex; flex-direction: column; gap: 1.5rem;
                    position: relative;
                }
                .chord-editor-close {
                    position: absolute; top: 1.5rem; right: 1.5rem;
                    background: none; border: none; color: #666; cursor: pointer;
                }
                .chord-editor-close:hover { color: white; }
                .chord-editor-title { text-align: center; margin: 0; font-size: 1.25rem; }

                .chord-editor-content {
                    display: grid;
                    grid-template-columns: 80px 1fr;
                    gap: 2rem;
                    justify-content: center;
                }

                /* Mini Neck */
                .mini-neck {
                    width: 40px;
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 4px;
                    position: relative;
                    margin: 0 auto;
                    cursor: pointer;
                }
                .mini-nut { height: 4px; background: #ddd; }
                .mini-fret {
                    height: 20px;
                    border-bottom: 1px solid #333;
                    position: relative;
                    display: flex; justify-content: center;
                }
                .mini-fret.active-zone { background: rgba(99, 102, 241, 0.1); }
                .mini-strings {
                    position: absolute; inset: 0 4px;
                    display: flex; justify-content: space-between;
                }
                .mini-string { width: 1px; background: #444; height: 100%; }
                .mini-highlight {
                    position: absolute; left: -4px; right: -4px; height: 100px; /* 5 frets * 20px */
                    border: 2px solid var(--accent-primary);
                    border-radius: 6px;
                    pointer-events: none;
                    transition: top 0.2s ease;
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
                }

                /* Main Editor */
                .main-editor-column {
                    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
                }
                .editor-header-strings {
                    display: grid; grid-template-columns: repeat(6, 40px); justify-items: center;
                    color: #888; font-size: 0.9rem; font-weight: bold; margin-bottom: 0.5rem;
                }
                
                .main-grid-container {
                    position: relative;
                    background: #f5f5f0; /* Light bg for grid like reference */
                    border-radius: 4px;
                    padding: 0 4px;
                    box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
                }
                /* Dark Mode Override for Premium look */
                .main-grid-container {
                    background: #25252a; /* Darker fretboard */
                }

                .main-grid {
                    display: flex; flex-direction: column;
                }
                .main-nut {
                    height: 8px; background: #ddd; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    z-index: 10;
                }

                .grid-row {
                    display: grid; grid-template-columns: repeat(6, 40px);
                    height: 50px;
                    border-bottom: 2px solid #444; /* Fret wire */
                    position: relative;
                }
                .grid-row:last-child { border-bottom: none; }
                
                .grid-fret-num {
                    position: absolute; left: -30px; top: 15px;
                    color: #666; font-size: 0.9rem; font-weight: bold;
                }

                .grid-cell {
                    position: relative; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                }
                .grid-cell:hover { background: rgba(255,255,255,0.05); }
                .grid-string-line {
                    position: absolute; top:0; bottom:0; width: 2px;
                    background: #555; /* String color */
                }
                /* String thickness simulation */
                .grid-cell:nth-child(2) .grid-string-line { width: 3px; } /* E */
                .grid-cell:nth-child(3) .grid-string-line { width: 2.5px; } /* A */
                
                .finger-dot-large {
                    width: 32px; height: 32px;
                    background: #d4b57e; /* Gold/Wood color for dot like reference? Or Accent? */
                    background: var(--accent-primary);
                    border-radius: 50%;
                    z-index: 5;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.4);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: bold; color: white;
                }

                .editor-markers {
                    display: grid; grid-template-columns: repeat(6, 40px); justify-items: center;
                    margin-top: 1rem;
                }
                .marker-btn {
                    width: 30px; height: 30px; border: none; background: transparent;
                    color: #666; cursor: pointer; display: flex; align-items: center; justify-content: center;
                    font-size: 1.2rem;
                }
                .marker-btn:hover { color: white; }
                .marker-btn.muted { color: #f87171; }
                .marker-btn.open { color: #4ade80; }

                .chord-form-row {
                    display: flex; gap: 1rem; margin-top: 1rem;
                }
                .chord-input-name {
                    flex: 1; padding: 0.8rem; border-radius: 8px;
                    background: rgba(0,0,0,0.2); border: 1px solid #444; color: white;
                }
                
                .finger-selector-row {
                    display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem;
                }
                .finger-select-btn {
                    width: 24px; height: 24px; border-radius: 50%; border: 1px solid #555;
                    background: transparent; color: #888; font-size: 0.8rem; cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default ChordEditorModal;
