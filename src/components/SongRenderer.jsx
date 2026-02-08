import React, { useMemo, useState, useRef, useEffect } from 'react';
import { parseChordPro } from '../utils/chordProParser';
import { transposeChord } from '../utils/transposer';
import { getChordData } from '../db/chords';
import ChordDiagram from './ChordDiagram';
import { X } from 'lucide-react';
import { subscribeChords } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const SmartSongRenderer = ({ content, fontSize = 16, transpose = 0 }) => {
    const { user } = useAuth();
    const lines = useMemo(() => parseChordPro(content), [content]);

    // Fetch custom chords from Firebase
    const [customChords, setCustomChords] = useState([]);

    useEffect(() => {
        if (!user) {
            setCustomChords([]);
            return;
        }
        const unsubscribe = subscribeChords(user.uid, setCustomChords);
        return () => unsubscribe();
    }, [user]);

    const [selectedChord, setSelectedChord] = useState(null);
    const [isLocked, setIsLocked] = useState(false); // Track if tooltip was opened via click
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const hoverTimeoutRef = useRef(null);

    // Handle both click and hover events
    const handleChordInteraction = (e, chordName, isClick = false) => {
        // Clear any pending close timer
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        const cleanName = chordName.trim();
        const actualChord = transposeChord(cleanName, transpose);

        // 1. Try to find in custom DB first
        let data = null;
        if (customChords) {
            const customMatch = customChords.find(c => c.name === actualChord);
            if (customMatch && customMatch.data) {
                // Normalize custom data structure for diagram
                // DB stores { positions: [...] } or { strings: ... }
                // Diagram expects { positions: [...] } preferred
                if (customMatch.data.positions) {
                    data = customMatch.data;
                } else {
                    // Legacy wrapper
                    data = { positions: [customMatch.data] };
                }
            }
        }

        // 2. Fallback to static DB
        if (!data) {
            data = getChordData(actualChord);
        }

        if (data) {
            const rect = e.currentTarget.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Calculate position, keeping tooltip on screen
            let x = rect.left + (rect.width / 2);
            let y = rect.top;

            // Keep tooltip within viewport
            const tooltipWidth = 140;
            const tooltipHeight = 180;

            if (x - tooltipWidth / 2 < 10) x = tooltipWidth / 2 + 10;
            if (x + tooltipWidth / 2 > viewportWidth - 10) x = viewportWidth - tooltipWidth / 2 - 10;
            if (y - tooltipHeight < 10) y = rect.bottom + tooltipHeight + 20;

            setTooltipPos({ x, y });
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
        // Only use hover on non-touch devices and if not already locked on another chord
        if (window.matchMedia('(hover: hover)').matches && !isLocked) {
            handleChordInteraction(e, chordName, false);
        }
    };

    const handleMouseLeave = () => {
        // Only close on hover if not locked
        if (window.matchMedia('(hover: hover)').matches && !isLocked) {
            // Add delay before closing to allow moving into tooltip
            hoverTimeoutRef.current = setTimeout(() => {
                setSelectedChord(null);
            }, 300); // 300ms delay
        }
    };

    const handleTooltipEnter = () => {
        // If entering tooltip, cancel the close timer
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const handleTooltipLeave = () => {
        // Resume close timer when leaving tooltip, unless locked
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

    if (!content) return <div className="text-muted">Aucun contenu à afficher</div>;

    return (
        <div className="song-container" style={{ fontSize: `${fontSize}px` }}>
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
                        style={{
                            left: tooltipPos.x,
                            top: tooltipPos.y,
                            transform: 'translate(-50%, -100%) translateY(-10px)'
                        }}
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

            {/* Song Lines - P0 Fix: New rendering approach */}
            {lines.map((line, i) => {
                if (line.type === 'directive') return null;

                // Build chord/text groups from tokens
                const groups = [];
                let currentGroup = { chord: null, text: '' };

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
        </div>
    );
};

export default SmartSongRenderer;
