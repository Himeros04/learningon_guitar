/**
 * Reference Chord Database
 * Position format: [E, A, D, G, B, e]
 * -1 = Muted (X)
 * 0 = Open string
 * > 0 = Fret number
 */

export const CHORD_DB = {
    // Major
    'C': {
        positions: [
            { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] }, // Open
            { frets: [3, 3, 5, 5, 5, 3], fingers: [1, 1, 2, 3, 4, 1], barre: 3 }, // Barre A-shape
            { frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], barre: 8 } // Barre E-shape
        ]
    },
    'D': { positions: [{ frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] }] },
    'E': { positions: [{ frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] }] },
    'F': { positions: [{ frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: 1 }] },
    'G': {
        positions: [
            { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] }, // Open
            { frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], barre: 3 } // Barre E-shape
        ]
    },
    'A': { positions: [{ frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] }] },
    'B': { positions: [{ frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: 2 }] },

    // Minor
    'Cm': { positions: [{ frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: 3 }] },
    'Dm': { positions: [{ frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] }] },
    'Em': { positions: [{ frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] }] },
    'Fm': { positions: [{ frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: 1 }] },
    'Gm': { positions: [{ frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: 3 }] },
    'Am': {
        positions: [
            { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] }, // Open
            { frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], barre: 5 } // Barre E-shape
        ]
    },
    'Bm': { positions: [{ frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: 2 }] },

    // Sharps/Flats (Common mappings)
    'C#m': { positions: [{ frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: 4 }] },
    'F#m': { positions: [{ frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: 2 }] },

    // 7th
    'E7': { positions: [{ frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] }] },
    'A7': { positions: [{ frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] }] },
    'D7': { positions: [{ frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] }] },
    'G7': { positions: [{ frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] }] },
};

export const getChordData = (chordName) => {
    // Normalize (handling generic cases like mapping Bb to A# if needed)
    // For now simple lookup
    return CHORD_DB[chordName];
};
