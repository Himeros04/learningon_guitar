/**
 * Common Chords Database
 * 
 * Static database of 50+ common guitar chords with fingering data.
 * Used for local lookup before AI fallback.
 * 
 * Schema follows ChordDefinition:
 * - name: Full chord name (e.g., "Am7")
 * - key: Root note (e.g., "A")
 * - suffix: Chord type (e.g., "m7")
 * - startingFret: Fret position (1 for open chords)
 * - strings: [E, A, D, G, B, e] - fret numbers (-1=mute, 0=open, 1-12=fret)
 * - fingers: [E, A, D, G, B, e] - finger numbers (0=none, 1-4=finger)
 */

export const commonChords = {
    // Major chords
    'C': {
        name: 'C', key: 'C', suffix: '', startingFret: 1,
        strings: [-1, 3, 2, 0, 1, 0],
        fingers: [0, 3, 2, 0, 1, 0]
    },
    'D': {
        name: 'D', key: 'D', suffix: '', startingFret: 1,
        strings: [-1, -1, 0, 2, 3, 2],
        fingers: [0, 0, 0, 1, 3, 2]
    },
    'E': {
        name: 'E', key: 'E', suffix: '', startingFret: 1,
        strings: [0, 2, 2, 1, 0, 0],
        fingers: [0, 2, 3, 1, 0, 0]
    },
    'F': {
        name: 'F', key: 'F', suffix: '', startingFret: 1,
        strings: [1, 3, 3, 2, 1, 1],
        fingers: [1, 3, 4, 2, 1, 1]
    },
    'G': {
        name: 'G', key: 'G', suffix: '', startingFret: 1,
        strings: [3, 2, 0, 0, 0, 3],
        fingers: [2, 1, 0, 0, 0, 3]
    },
    'A': {
        name: 'A', key: 'A', suffix: '', startingFret: 1,
        strings: [-1, 0, 2, 2, 2, 0],
        fingers: [0, 0, 1, 2, 3, 0]
    },
    'B': {
        name: 'B', key: 'B', suffix: '', startingFret: 2,
        strings: [-1, 2, 4, 4, 4, 2],
        fingers: [0, 1, 2, 3, 4, 1]
    },

    // Minor chords
    'Am': {
        name: 'Am', key: 'A', suffix: 'm', startingFret: 1,
        strings: [-1, 0, 2, 2, 1, 0],
        fingers: [0, 0, 2, 3, 1, 0]
    },
    'Bm': {
        name: 'Bm', key: 'B', suffix: 'm', startingFret: 2,
        strings: [-1, 2, 4, 4, 3, 2],
        fingers: [0, 1, 3, 4, 2, 1]
    },
    'Cm': {
        name: 'Cm', key: 'C', suffix: 'm', startingFret: 3,
        strings: [-1, 3, 5, 5, 4, 3],
        fingers: [0, 1, 3, 4, 2, 1]
    },
    'Dm': {
        name: 'Dm', key: 'D', suffix: 'm', startingFret: 1,
        strings: [-1, -1, 0, 2, 3, 1],
        fingers: [0, 0, 0, 2, 3, 1]
    },
    'Em': {
        name: 'Em', key: 'E', suffix: 'm', startingFret: 1,
        strings: [0, 2, 2, 0, 0, 0],
        fingers: [0, 2, 3, 0, 0, 0]
    },
    'Fm': {
        name: 'Fm', key: 'F', suffix: 'm', startingFret: 1,
        strings: [1, 3, 3, 1, 1, 1],
        fingers: [1, 3, 4, 1, 1, 1]
    },
    'Gm': {
        name: 'Gm', key: 'G', suffix: 'm', startingFret: 3,
        strings: [3, 5, 5, 3, 3, 3],
        fingers: [1, 3, 4, 1, 1, 1]
    },

    // Seventh chords
    'A7': {
        name: 'A7', key: 'A', suffix: '7', startingFret: 1,
        strings: [-1, 0, 2, 0, 2, 0],
        fingers: [0, 0, 1, 0, 2, 0]
    },
    'B7': {
        name: 'B7', key: 'B', suffix: '7', startingFret: 1,
        strings: [-1, 2, 1, 2, 0, 2],
        fingers: [0, 2, 1, 3, 0, 4]
    },
    'C7': {
        name: 'C7', key: 'C', suffix: '7', startingFret: 1,
        strings: [-1, 3, 2, 3, 1, 0],
        fingers: [0, 3, 2, 4, 1, 0]
    },
    'D7': {
        name: 'D7', key: 'D', suffix: '7', startingFret: 1,
        strings: [-1, -1, 0, 2, 1, 2],
        fingers: [0, 0, 0, 2, 1, 3]
    },
    'E7': {
        name: 'E7', key: 'E', suffix: '7', startingFret: 1,
        strings: [0, 2, 0, 1, 0, 0],
        fingers: [0, 2, 0, 1, 0, 0]
    },
    'F7': {
        name: 'F7', key: 'F', suffix: '7', startingFret: 1,
        strings: [1, 3, 1, 2, 1, 1],
        fingers: [1, 3, 1, 2, 1, 1]
    },
    'G7': {
        name: 'G7', key: 'G', suffix: '7', startingFret: 1,
        strings: [3, 2, 0, 0, 0, 1],
        fingers: [3, 2, 0, 0, 0, 1]
    },

    // Minor seventh chords
    'Am7': {
        name: 'Am7', key: 'A', suffix: 'm7', startingFret: 1,
        strings: [-1, 0, 2, 0, 1, 0],
        fingers: [0, 0, 2, 0, 1, 0]
    },
    'Bm7': {
        name: 'Bm7', key: 'B', suffix: 'm7', startingFret: 2,
        strings: [-1, 2, 4, 2, 3, 2],
        fingers: [0, 1, 3, 1, 2, 1]
    },
    'Dm7': {
        name: 'Dm7', key: 'D', suffix: 'm7', startingFret: 1,
        strings: [-1, -1, 0, 2, 1, 1],
        fingers: [0, 0, 0, 2, 1, 1]
    },
    'Em7': {
        name: 'Em7', key: 'E', suffix: 'm7', startingFret: 1,
        strings: [0, 2, 0, 0, 0, 0],
        fingers: [0, 1, 0, 0, 0, 0]
    },
    'Gm7': {
        name: 'Gm7', key: 'G', suffix: 'm7', startingFret: 3,
        strings: [3, 5, 3, 3, 3, 3],
        fingers: [1, 3, 1, 1, 1, 1]
    },

    // Major seventh chords
    'Cmaj7': {
        name: 'Cmaj7', key: 'C', suffix: 'maj7', startingFret: 1,
        strings: [-1, 3, 2, 0, 0, 0],
        fingers: [0, 3, 2, 0, 0, 0]
    },
    'Dmaj7': {
        name: 'Dmaj7', key: 'D', suffix: 'maj7', startingFret: 1,
        strings: [-1, -1, 0, 2, 2, 2],
        fingers: [0, 0, 0, 1, 1, 1]
    },
    'Emaj7': {
        name: 'Emaj7', key: 'E', suffix: 'maj7', startingFret: 1,
        strings: [0, 2, 1, 1, 0, 0],
        fingers: [0, 3, 1, 2, 0, 0]
    },
    'Fmaj7': {
        name: 'Fmaj7', key: 'F', suffix: 'maj7', startingFret: 1,
        strings: [-1, -1, 3, 2, 1, 0],
        fingers: [0, 0, 3, 2, 1, 0]
    },
    'Gmaj7': {
        name: 'Gmaj7', key: 'G', suffix: 'maj7', startingFret: 1,
        strings: [3, 2, 0, 0, 0, 2],
        fingers: [2, 1, 0, 0, 0, 3]
    },
    'Amaj7': {
        name: 'Amaj7', key: 'A', suffix: 'maj7', startingFret: 1,
        strings: [-1, 0, 2, 1, 2, 0],
        fingers: [0, 0, 2, 1, 3, 0]
    },

    // Sus chords
    'Asus2': {
        name: 'Asus2', key: 'A', suffix: 'sus2', startingFret: 1,
        strings: [-1, 0, 2, 2, 0, 0],
        fingers: [0, 0, 1, 2, 0, 0]
    },
    'Asus4': {
        name: 'Asus4', key: 'A', suffix: 'sus4', startingFret: 1,
        strings: [-1, 0, 2, 2, 3, 0],
        fingers: [0, 0, 1, 2, 3, 0]
    },
    'Dsus2': {
        name: 'Dsus2', key: 'D', suffix: 'sus2', startingFret: 1,
        strings: [-1, -1, 0, 2, 3, 0],
        fingers: [0, 0, 0, 1, 2, 0]
    },
    'Dsus4': {
        name: 'Dsus4', key: 'D', suffix: 'sus4', startingFret: 1,
        strings: [-1, -1, 0, 2, 3, 3],
        fingers: [0, 0, 0, 1, 2, 3]
    },
    'Esus4': {
        name: 'Esus4', key: 'E', suffix: 'sus4', startingFret: 1,
        strings: [0, 2, 2, 2, 0, 0],
        fingers: [0, 1, 2, 3, 0, 0]
    },
    'Gsus4': {
        name: 'Gsus4', key: 'G', suffix: 'sus4', startingFret: 1,
        strings: [3, 3, 0, 0, 1, 3],
        fingers: [2, 3, 0, 0, 1, 4]
    },

    // Add chords
    'Cadd9': {
        name: 'Cadd9', key: 'C', suffix: 'add9', startingFret: 1,
        strings: [-1, 3, 2, 0, 3, 0],
        fingers: [0, 2, 1, 0, 3, 0]
    },
    'Dadd9': {
        name: 'Dadd9', key: 'D', suffix: 'add9', startingFret: 1,
        strings: [-1, -1, 0, 2, 3, 0],
        fingers: [0, 0, 0, 1, 2, 0]
    },
    'Eadd9': {
        name: 'Eadd9', key: 'E', suffix: 'add9', startingFret: 1,
        strings: [0, 2, 2, 1, 0, 2],
        fingers: [0, 2, 3, 1, 0, 4]
    },
    'Gadd9': {
        name: 'Gadd9', key: 'G', suffix: 'add9', startingFret: 1,
        strings: [3, 0, 0, 2, 0, 3],
        fingers: [2, 0, 0, 1, 0, 3]
    },

    // Sharp/Flat variations
    'F#m': {
        name: 'F#m', key: 'F#', suffix: 'm', startingFret: 2,
        strings: [2, 4, 4, 2, 2, 2],
        fingers: [1, 3, 4, 1, 1, 1]
    },
    'C#m': {
        name: 'C#m', key: 'C#', suffix: 'm', startingFret: 4,
        strings: [-1, 4, 6, 6, 5, 4],
        fingers: [0, 1, 3, 4, 2, 1]
    },
    'Bb': {
        name: 'Bb', key: 'Bb', suffix: '', startingFret: 1,
        strings: [-1, 1, 3, 3, 3, 1],
        fingers: [0, 1, 2, 3, 4, 1]
    },
    'Eb': {
        name: 'Eb', key: 'Eb', suffix: '', startingFret: 3,
        strings: [-1, -1, 5, 3, 4, 3],
        fingers: [0, 0, 3, 1, 2, 1]
    },
    'Ab': {
        name: 'Ab', key: 'Ab', suffix: '', startingFret: 4,
        strings: [4, 6, 6, 5, 4, 4],
        fingers: [1, 3, 4, 2, 1, 1]
    },

    // Diminished
    'Bdim': {
        name: 'Bdim', key: 'B', suffix: 'dim', startingFret: 1,
        strings: [-1, 2, 3, 4, 3, -1],
        fingers: [0, 1, 2, 4, 3, 0]
    },
    'Cdim': {
        name: 'Cdim', key: 'C', suffix: 'dim', startingFret: 1,
        strings: [-1, 3, 4, 5, 4, -1],
        fingers: [0, 1, 2, 4, 3, 0]
    },

    // Augmented
    'Caug': {
        name: 'Caug', key: 'C', suffix: 'aug', startingFret: 1,
        strings: [-1, 3, 2, 1, 1, 0],
        fingers: [0, 4, 3, 1, 2, 0]
    },
    'Eaug': {
        name: 'Eaug', key: 'E', suffix: 'aug', startingFret: 1,
        strings: [0, 3, 2, 1, 1, 0],
        fingers: [0, 4, 3, 1, 2, 0]
    },
};

/**
 * Lookup chord by name
 * @param {string} chordName - The chord name to look up
 * @returns {object|null} - Chord definition or null if not found
 */
export function lookupChord(chordName) {
    // Normalize the chord name for lookup
    const normalized = chordName
        .replace(/\s+/g, '')
        .replace('♯', '#')
        .replace('♭', 'b');

    return commonChords[normalized] || null;
}

/**
 * Get all available chord names
 * @returns {string[]} - Array of chord names
 */
export function getAllChordNames() {
    return Object.keys(commonChords);
}
