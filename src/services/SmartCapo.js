/**
 * Smart Capo Service
 * Analyzes chord progressions to suggest capo positions for easier playability.
 */

// Chords considered "Open" or "Easy" (0 penalty)
const OPEN_CHORDS = ['C', 'A', 'G', 'E', 'D', 'Am', 'Em', 'Dm', 'Cmaj7', 'A7', 'E7', 'D7', 'G7', 'C7', 'B7'];

// Chords considered "Hard" or "Barre" (High penalty)
// Most others are calculated, but we can have specific penalties.
const BARRE_PENALTY = 5;
const OBSCURE_PENALTY = 2; // For sharps/flats that aren't nice

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get note index
 */
const getNoteIndex = (note) => {
    // Normalize flats to sharps
    const normalized = note.replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#');
    return NOTES.indexOf(normalized);
};

/**
 * Transpose a single chord
 */
const transposeChord = (chord, semitones) => {
    const rootMatch = chord.match(/^[A-G][#b]?/);
    if (!rootMatch) return chord;

    const root = rootMatch[0];
    const suffix = chord.substring(root.length);

    let index = getNoteIndex(root);
    if (index === -1) return chord;

    let newIndex = (index + semitones + 12) % 12;
    return NOTES[newIndex] + suffix;
};

/**
 * Calculate difficulty score for a set of chords
 * Lower is better.
 */
const calculateDifficulty = (chords) => {
    let score = 0;

    chords.forEach(chord => {
        // Strip bass notes for difficulty (C/G -> C)
        const cleanChord = chord.split('/')[0];

        if (OPEN_CHORDS.includes(cleanChord)) {
            score += 0;
        } else if (cleanChord.includes('#') || cleanChord.includes('b')) {
            // Sharps/Flats are usually unseen/barres
            score += BARRE_PENALTY;
        } else if (cleanChord === 'F' || cleanChord === 'Bm') {
            // Common semi-barres
            score += 4;
        } else {
            // Other natural chords not in open list (like B)
            score += 3;
        }
    });

    return score;
};

/**
 * Suggest optimal Capo position
 * @param {Array<string>} chords List of unique chords in the song
 * @returns {Object|null} Recommendation { capo: number, transposedChords: Array, oldScore: number, newScore: number }
 */
export const findSmartCapo = (chords) => {
    const uniqueChords = [...new Set(chords)];
    let bestCapo = 0;
    let minScore = calculateDifficulty(uniqueChords);
    const originalScore = minScore;

    // If already easy, don't suggest anything
    if (minScore < 5) return null;

    // Try capos 1 to 9 (beyond 9 is squeaky)
    for (let capo = 1; capo <= 9; capo++) {
        // capoing up means transposing DOWN relative to chord shape
        // e.g. Song is F# (Hard). Capo 2 -> Play E (Soft).
        // Actual pitch = E + 2 = F#.
        // So we test chords transposed by -capo.

        const testChords = uniqueChords.map(c => transposeChord(c, -capo));
        const score = calculateDifficulty(testChords);

        if (score < minScore) {
            minScore = score;
            bestCapo = capo;
        }
    }

    if (bestCapo > 0 && minScore < originalScore * 0.7) {
        // Only suggest if significant improvement (30% easier)
        return {
            capo: bestCapo,
            originalScore,
            newScore: minScore
        };
    }

    return null;
};
