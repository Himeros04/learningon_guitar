export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_REGEX = /^([A-G])(#|b)?(.*)/;

/**
 * Transpose a chord by semitones
 * @param {string} chord - The chord string (e.g., "Am", "C#7", "G/B")
 * @param {number} semitones - Number of semitones to shift (can be negative)
 * @returns {string} Transposed chord
 */
export const transposeChord = (chord, semitones) => {
    if (!chord || semitones === 0) return chord;

    // Handle slash chords (e.g., C/G)
    if (chord.includes('/')) {
        const [root, bass] = chord.split('/');
        return `${transposeChord(root, semitones)}/${transposeChord(bass, semitones)}`;
    }

    const match = chord.match(NOTE_REGEX);
    if (!match) return chord; // Return as is if not a recognized chord format

    const note = match[1];     // "C"
    const accidental = match[2] || ''; // "#"
    const suffix = match[3] || '';     // "m7", "major", etc.

    const fullNote = note + accidental;

    // Find index in both scales
    let index = NOTES_SHARP.indexOf(fullNote);
    if (index === -1) index = NOTES_FLAT.indexOf(fullNote);
    if (index === -1) return chord; // Should not happen for valid chords

    // Calculate new index
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    // Determine target scale (Sharp or Flat)
    // Heuristic: If shifting up to standard keys, prefer sharps except for F major.
    // For now, simple logic: use Sharp scale by default unless original was clearly Flat-based?
    // Let's use Sharp for now to keep it consistent.
    // Ideally we track the Key of the song, but we don't have it here.
    const targetScale = NOTES_SHARP;

    return targetScale[newIndex] + suffix;
};

/**
 * Parse a chord string into components
 */
/*
const parseChord = (chord) => {
    // ...
}*/
