/**
 * Chord Extractor Utility
 * 
 * Extracts chord names from ChordPro format content.
 * Returns a unique Set of chord names found in the song.
 */

// Regex to match chords in [bracket] notation
const CHORD_REGEX = /\[([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\([^)]*\))?(?:\/[A-G][#b]?)?)\]/gi;

/**
 * Extract all unique chord names from ChordPro content
 * @param {string} content - The song content in ChordPro format
 * @returns {string[]} - Array of unique chord names
 */
export function extractChords(content) {
    if (!content || typeof content !== 'string') {
        return [];
    }

    const matches = content.matchAll(CHORD_REGEX);
    const chordSet = new Set();

    for (const match of matches) {
        const chordName = match[1].trim();
        if (chordName) {
            chordSet.add(chordName);
        }
    }

    return Array.from(chordSet);
}

/**
 * Normalize chord name for comparison
 * @param {string} chordName - The chord name to normalize
 * @returns {string} - Normalized chord name
 */
export function normalizeChordName(chordName) {
    return chordName
        .replace(/\s+/g, '')
        .replace('♯', '#')
        .replace('♭', 'b')
        .trim();
}

/**
 * Parse chord name into components
 * @param {string} chordName - The chord name to parse
 * @returns {{ key: string, suffix: string, bass: string | null }}
 */
export function parseChordName(chordName) {
    const normalized = normalizeChordName(chordName);

    // Match root note (A-G with optional # or b)
    const rootMatch = normalized.match(/^([A-G][#b]?)/i);
    if (!rootMatch) {
        return { key: chordName, suffix: '', bass: null };
    }

    const key = rootMatch[1];
    let remaining = normalized.slice(key.length);

    // Check for bass note (slash chord)
    let bass = null;
    const bassMatch = remaining.match(/\/([A-G][#b]?)$/i);
    if (bassMatch) {
        bass = bassMatch[1];
        remaining = remaining.slice(0, -bassMatch[0].length);
    }

    return { key, suffix: remaining, bass };
}
