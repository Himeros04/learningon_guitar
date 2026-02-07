import React from 'react';
import { normalizeToFretsArray } from '../utils/chordNormalizer';

const ChordDiagram = ({ chordData, width = 100, height = 120 }) => {
    // Robust check for data existence
    if (!chordData) {
        return <div style={{ width, height, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '10px' }}>?</div>;
    }

    // Use centralized normalizer to handle all chord data formats
    const frets = normalizeToFretsArray(chordData);

    // Extract barre info if available
    let barre = null;
    if (chordData.positions && chordData.positions.length > 0) {
        barre = chordData.positions[0].barre;
    }

    // Check if we have valid fret data
    if (!frets || frets.length === 0 || frets.every(f => f === -1)) {
        return <div style={{ width, height, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '10px' }}>No Data</div>;
    }

    // Dimensions
    const numStrings = 6;
    const numFrets = 5;
    const paddingX = 15;
    const paddingY = 20;

    const w = width - 2 * paddingX;
    const h = height - 2 * paddingY;

    const stringSpacing = w / (numStrings - 1);
    const fretSpacing = h / numFrets;

    // Detect if we need a base fret (if all frets are high, e.g. > 2)
    const activeFrets = frets.filter(f => f > 0);
    const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 0;
    const baseFret = minFret > 2 ? minFret - 1 : 1;

    // If baseFret > 1, show it
    const showBaseFret = baseFret > 1;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'white', borderRadius: '4px' }}>
            {/* Nut (Upper bar) or Fret Label */}
            {showBaseFret ? (
                <text x={paddingX - 8} y={paddingY + fretSpacing / 2} fontSize="10" fontWeight="bold" fill="black">{baseFret}fr</text>
            ) : (
                <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="black" strokeWidth="4" />
            )}

            {/* Frets */}
            {[...Array(numFrets + 1)].map((_, i) => (
                <line
                    key={`fret-${i}`}
                    x1={paddingX}
                    y1={paddingY + i * fretSpacing}
                    x2={width - paddingX}
                    y2={paddingY + i * fretSpacing}
                    stroke="#444"
                    strokeWidth="1"
                />
            ))}

            {/* Strings */}
            {[...Array(numStrings)].map((_, i) => (
                <line
                    key={`string-${i}`}
                    x1={paddingX + i * stringSpacing}
                    y1={paddingY}
                    x2={paddingX + i * stringSpacing}
                    y2={height - paddingY}
                    stroke="#444"
                    strokeWidth={i > 2 ? 1 : 1.5}
                />
            ))}

            {/* Dots and Markers */}
            {frets.map((fret, stringIndex) => {
                const x = paddingX + stringIndex * stringSpacing;

                // Muted string (X) aka -1
                if (fret === -1) {
                    return (
                        <text key={`mute-${stringIndex}`} x={x} y={paddingY - 5} textAnchor="middle" fontSize="12" fill="red">X</text>
                    );
                }

                // Open string (0) - Only show if Nut is visible (baseFret 1)
                // If baseFret > 1, open string 0 implies it's way behind? Or maybe handled as 0 relative?
                // Usually open strings are 0 regardless of barre.
                if (fret === 0) {
                    // If baseFret is high, displaying 0 is tricky visually, but typically open is open.
                    // We draw it above nut.
                    return (
                        <circle key={`open-${stringIndex}`} cx={x} cy={paddingY - 8} r="3" stroke="black" fill="white" strokeWidth="1" />
                    );
                }

                // Fretted note
                // Adjust for baseFret
                const relativeFret = fret - (baseFret - 1);

                if (relativeFret > 0 && relativeFret <= numFrets) {
                    return (
                        <circle
                            key={`note-${stringIndex}`}
                            cx={x}
                            cy={paddingY + (relativeFret - 0.5) * fretSpacing}
                            r="5"
                            fill="black"
                        />
                    );
                }
                return null;
            })}
        </svg>
    );
};

export default ChordDiagram;
