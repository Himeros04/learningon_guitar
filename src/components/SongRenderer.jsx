import React, { useMemo, useState } from 'react';
import { parseChordPro } from '../utils/chordProParser';
import { transposeChord } from '../utils/transposer';
import { getChordData } from '../db/chords';
import ChordDiagram from './ChordDiagram';
import { X } from 'lucide-react';

const SmartSongRenderer = ({ content, fontSize = 16, transpose = 0 }) => {
    const lines = useMemo(() => parseChordPro(content), [content]);
    const [selectedChord, setSelectedChord] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Handle both click and hover
    const handleChordInteraction = (e, chordName, isClick = false) => {
        const cleanName = chordName.trim();
        const actualChord = transposeChord(cleanName, transpose);
        const data = getChordData(actualChord);

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
        }
    };

    const handleChordClick = (e, chordName) => {
        e.preventDefault();
        e.stopPropagation();
        handleChordInteraction(e, chordName, true);
    };

    const handleMouseEnter = (e, chordName) => {
        // Only use hover on non-touch devices
        if (window.matchMedia('(hover: hover)').matches) {
            handleChordInteraction(e, chordName, false);
        }
    };

    const handleMouseLeave = () => {
        // Only clear on hover if it wasn't a click
        if (window.matchMedia('(hover: hover)').matches) {
            setSelectedChord(null);
        }
    };

    const closeTooltip = () => {
        setSelectedChord(null);
    };

    if (!content) return <div className="text-muted">Aucun contenu à afficher</div>;

    return (
        <div className="song-container" style={{ fontSize: `${fontSize}px` }}>
            {/* Chord Tooltip/Modal */}
            {selectedChord && (
                <>
                    {/* Backdrop for mobile - click to close */}
                    <div
                        className="chord-tooltip-backdrop"
                        onClick={closeTooltip}
                        aria-hidden="true"
                    />
                    <div
                        className="chord-tooltip"
                        style={{
                            left: tooltipPos.x,
                            top: tooltipPos.y,
                            transform: 'translate(-50%, -100%) translateY(-10px)'
                        }}
                    >
                        <div className="chord-tooltip-content glass-panel" style={{ position: 'relative' }}>
                            {/* Close button for mobile */}
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
