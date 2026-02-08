import React, { useMemo, useState, useRef, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';
import { parseChordPro } from '../utils/chordProParser';
import { transposeChord } from '../utils/transposer';
import { getChordData } from '../db/chords';
import ChordDiagram from './ChordDiagram';
import { X, Lightbulb } from 'lucide-react';
import { subscribeChords } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { findSmartCapo } from '../services/SmartCapo';
import { useGamification } from '../contexts/GamificationContext';
const SmartSongRenderer = ({ content, fontSize = 16, transpose = 0, showSmartCapo = false }) => {
    const { user } = useAuth();
    const { addXp, unlockBadge } = useGamification();
    const lines = useMemo(() => parseChordPro(content), [content]);

    // Smart Capo Logic
    const [capoSuggestion, setCapoSuggestion] = useState(null);
    const [dismissedCapo, setDismissedCapo] = useState(false);

    // Debounce content updates to avoid recalculating on every keystroke
    const debouncedLines = useDebounce(lines, 1000);

    useEffect(() => {
        if (!debouncedLines || !showSmartCapo) return;

        try {
            // Extract all chords from content
            const allChords = [];
            debouncedLines.forEach(line => {
                if (line && line.tokens) {
                    line.tokens.forEach(token => {
                        if (token.type === 'chord') allChords.push(token.content);
                    });
                }
            });

            // Run Smart Capo algorithm
            const suggestion = findSmartCapo(allChords);
            setCapoSuggestion(suggestion);
        } catch (err) {
            console.error("Smart Capo Error:", err);
            // Non-fatal, just ignore
        }
    }, [debouncedLines, showSmartCapo]);

    const handleApplyCapo = () => {
        addXp(10, 'Smart Capo');
        unlockBadge('arrangeur_malin');
        setDismissedCapo(true);
        alert(`Conseil : Placez le Capodastre en case ${capoSuggestion.capo} et jouez comme si vous étiez en bas du manche !`);
    };

    // Fetch custom chords from Firebase
    const [customChords, setCustomChords] = useState([]);
    const hoverTimeoutRef = useRef(null);
    const [selectedChord, setSelectedChord] = useState(null);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (!user) {
            setCustomChords([]);
            return;
        }
        const unsubscribe = subscribeChords(user.uid, setCustomChords);
        return () => unsubscribe();
    }, [user]);

    // Handle both click and hover events
    const [tooltipState, setTooltipState] = useState({ x: 0, y: 0, placement: 'top' });

    const handleChordInteraction = (e, chordName, isClick = false) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        const cleanName = chordName.trim();
        const actualChord = transposeChord(cleanName, transpose);

        let data = null;
        if (customChords) {
            const customMatch = customChords.find(c => c.name === actualChord);
            if (customMatch && customMatch.data) {
                if (customMatch.data.positions) {
                    data = customMatch.data;
                } else {
                    data = { positions: [customMatch.data] };
                }
            }
        }

        if (!data) {
            data = getChordData(actualChord);
        }

        if (data) {
            const rect = e.currentTarget.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Default: Mobile Bottom
            let newState = { x: 0, y: 0, placement: 'mobile-bottom' };

            // Desktop Logic
            if (viewportWidth > 768) {
                const tooltipWidth = 140; // Approx
                // Try Right Side
                if (rect.right + tooltipWidth + 20 < viewportWidth) {
                    newState = {
                        x: rect.right + 10,
                        y: rect.top + (rect.height / 2),
                        placement: 'right'
                    };
                }
                // Fallback to Left Side
                else {
                    newState = {
                        x: rect.left - 10,
                        y: rect.top + (rect.height / 2),
                        placement: 'left'
                    };
                }
            }

            setTooltipState(newState);
            setSelectedChord({ name: actualChord, data });

            if (isClick) {
                setIsLocked(true);
            } else {
                setIsLocked(false);
            }
        }
    };

    const handleChordClick = (e, chordName) => {
        e.preventDefault();
        e.stopPropagation();
        handleChordInteraction(e, chordName, true);
    };

    const handleMouseEnter = (e, chordName) => {
        if (window.matchMedia('(hover: hover)').matches && !isLocked) {
            handleChordInteraction(e, chordName, false);
        }
    };

    const handleMouseLeave = () => {
        if (window.matchMedia('(hover: hover)').matches && !isLocked) {
            hoverTimeoutRef.current = setTimeout(() => {
                setSelectedChord(null);
            }, 300);
        }
    };

    const handleTooltipEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const handleTooltipLeave = () => {
        if (!isLocked) {
            hoverTimeoutRef.current = setTimeout(() => {
                setSelectedChord(null);
            }, 300);
        }
    };

    const closeTooltip = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setSelectedChord(null);
        setIsLocked(false);
    };

    // Helper to get style based on placement
    const getTooltipStyle = () => {
        const { x, y, placement } = tooltipState;

        if (placement === 'mobile-bottom') {
            return {
                left: '50%',
                bottom: '20px',
                top: 'auto',
                transform: 'translateX(-50%)',
                maxWidth: '90vw'
            };
        }

        if (placement === 'right') {
            return {
                left: x,
                top: y,
                transform: 'translateY(-50%)' // Vertically center
            };
        }

        if (placement === 'left') {
            return {
                left: x,
                top: y,
                transform: 'translate(-100%, -50%)' // Shift left and vertically center
            };
        }

        return {};
    };

    return (
        <div className="song-container" style={{ fontSize: `${fontSize}px` }}>
            {/* ... banner code ... */}

            {/* Chord Tooltip/Modal */}
            {selectedChord && (
                <>
                    {/* Backdrop - Only show if locked (clicked) or on mobile */}
                    {(isLocked || !window.matchMedia('(hover: hover)').matches) && (
                        <div
                            className="chord-tooltip-backdrop"
                            onClick={closeTooltip}
                            aria-hidden="true"
                        />
                    )}

                    <div
                        className="chord-tooltip"
                        style={getTooltipStyle()}
                        onMouseEnter={handleTooltipEnter}
                        onMouseLeave={handleTooltipLeave}
                    >
                        <div className="chord-tooltip-content glass-panel" style={{ position: 'relative' }}>
                            {/* Close button */}
                            <button
                                className="chord-tooltip-close"
                                onClick={closeTooltip}
                                aria-label="Fermer"
                            >
                                <X size={14} />
                            </button>
                            <div className="chord-tooltip-name">
                                {selectedChord.name}
                            </div>
                            <ChordDiagram chordData={selectedChord.data} width={100} height={120} />
                        </div>
                    </div>
                </>
            )}

            {lines.map((line, i) => {
                if (line.type === 'directive') return null;

                // Build chord/text groups from tokens
                const groups = [];
                let currentGroup = { chord: null, text: '' };

                // Defensive check for tokens
                if (line.tokens) {
                    line.tokens.forEach(token => {
                        if (token.type === 'chord') {
                            // If we have a pending group, push it
                            if (currentGroup.text || currentGroup.chord) {
                                groups.push(currentGroup);
                            }
                            currentGroup = { chord: token.content, text: '' };
                        } else {
                            currentGroup.text = token.content;
                            groups.push(currentGroup);
                            currentGroup = { chord: null, text: '' };
                        }
                    });
                }

                // Push any remaining group
                if (currentGroup.text || currentGroup.chord) groups.push(currentGroup);

                return (
                    <div key={i} className="song-line">
                        {groups.map((group, j) => {
                            const transposedChord = group.chord ? transposeChord(group.chord, transpose) : null;

                            return (
                                <span key={j} className="chord-group">
                                    {/* Chord annotation */}
                                    <span
                                        className={`chord ${!group.chord ? 'chord-empty' : ''}`}
                                        onClick={(e) => group.chord && handleChordClick(e, group.chord)}
                                        onMouseEnter={(e) => group.chord && handleMouseEnter(e, group.chord)}
                                        onMouseLeave={handleMouseLeave}
                                        role={group.chord ? 'button' : undefined}
                                        tabIndex={group.chord ? 0 : undefined}
                                        aria-label={group.chord ? `Accord ${transposedChord}` : undefined}
                                    >
                                        {transposedChord || '\u00A0'}
                                    </span>
                                    {/* Lyrics text */}
                                    <span className="lyrics">{group.text || ''}</span>
                                </span>
                            );
                        })}
                    </div>
                );
            })}

            <style>{`
                .smart-capo-banner {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1rem;
                    margin-bottom: 1.5rem;
                    border-radius: 12px;
                    border-left: 4px solid #facc15;
                    animation: slideDown 0.5s ease-out;
                }
                
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .capo-icon {
                    flex-shrink: 0;
                }
                
                .capo-content {
                    flex: 1;
                    font-size: 0.9rem;
                }
                
                .capo-content strong {
                    color: #facc15;
                    display: block;
                    margin-bottom: 2px;
                }
                
                .capo-content p {
                    margin: 0;
                    color: rgba(255,255,255,0.8);
                }
                
                .capo-close {
                    flex-shrink: 0;
                    padding: 0.25rem;
                }
            `}</style>
        </div>
    );
};

export default SmartSongRenderer;
