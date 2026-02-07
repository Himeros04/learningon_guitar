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
        <div style={{ fontSize: `${fontSize}px`, fontFamily: 'Inter, sans-serif', position: 'relative' }}>
            {/* Chord Tooltip/Modal */}
            {selectedChord && (
                <>
                    {/* Backdrop for mobile - click to close */}
                    <div
                        onClick={closeTooltip}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 9998,
                            background: 'rgba(0,0,0,0.3)'
                        }}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            left: tooltipPos.x,
                            top: tooltipPos.y,
                            transform: 'translate(-50%, -100%) translateY(-10px)',
                            zIndex: 9999,
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
                        }}
                    >
                        <div
                            className="glass-panel"
                            style={{
                                padding: '0.8rem',
                                borderRadius: '12px',
                                background: 'rgba(25, 25, 30, 0.98)',
                                border: '1px solid var(--border-subtle)',
                                minWidth: '120px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative'
                            }}
                        >
                            {/* Close button for mobile */}
                            <button
                                onClick={closeTooltip}
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={14} />
                            </button>
                            <div style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                                fontSize: '1.2rem',
                                color: 'var(--accent-primary)'
                            }}>
                                {selectedChord.name}
                            </div>
                            <ChordDiagram chordData={selectedChord.data} width={100} height={120} />
                        </div>
                    </div>
                </>
            )}

            {lines.map((line, i) => {
                if (line.type === 'directive') return null;

                const groups = [];
                let currentGroup = { chord: null, text: '' };

                line.tokens.forEach(token => {
                    if (token.type === 'chord') {
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
                if (currentGroup.text || currentGroup.chord) groups.push(currentGroup);

                return (
                    <div key={i} style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1.5em', alignItems: 'flex-end', lineHeight: '1.2' }}>
                        {groups.map((group, j) => (
                            <div key={j} style={{ display: 'flex', flexDirection: 'column', marginRight: group.text ? '0' : '0.5ch' }}>
                                <span
                                    onClick={(e) => group.chord && handleChordClick(e, group.chord)}
                                    onMouseEnter={(e) => group.chord && handleMouseEnter(e, group.chord)}
                                    onMouseLeave={handleMouseLeave}
                                    style={{
                                        color: 'var(--accent-primary)',
                                        fontWeight: 'bold',
                                        fontSize: '0.9em',
                                        height: '1.2em',
                                        marginBottom: '0.2em',
                                        minWidth: '1em',
                                        cursor: group.chord ? 'pointer' : 'default',
                                        transition: 'color 0.2s',
                                        textDecoration: group.chord ? 'underline' : 'none',
                                        textDecorationColor: 'rgba(99, 102, 241, 0.3)',
                                        textUnderlineOffset: '2px',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}
                                >
                                    {group.chord ? transposeChord(group.chord, transpose) : '\u00A0'}
                                </span>
                                <span style={{ whiteSpace: 'pre', color: 'var(--text-main)' }}>{group.text || ''}</span>
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}

export default SmartSongRenderer;
