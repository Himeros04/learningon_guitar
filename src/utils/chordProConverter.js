/**
 * ChordPro Converter Utility
 * 
 * Converts OCR JSON output to ChordPro format.
 * 
 * Input format (from OCR):
 * {
 *   sections: [{
 *     label: "Verse 1",
 *     content: [{ chords: "Am  G  C", lyrics: "Hello world" }]
 *   }]
 * }
 * 
 * Output: ChordPro string with [chord] notation
 */

/**
 * Convert OCR response to ChordPro format
 * @param {object} ocrData - OCR response data
 * @returns {string} - ChordPro formatted content
 */
export function convertToChordPro(ocrData) {
    if (!ocrData || !ocrData.sections) {
        return '';
    }

    const lines = [];

    // Add title and artist as comments if available
    if (ocrData.title && ocrData.title !== 'Inconnu') {
        lines.push(`{title: ${ocrData.title}}`);
    }
    if (ocrData.artist && ocrData.artist !== 'Inconnu') {
        lines.push(`{artist: ${ocrData.artist}}`);
    }
    if (ocrData.key) {
        lines.push(`{key: ${ocrData.key}}`);
    }
    if (ocrData.capo) {
        lines.push(`{capo: ${ocrData.capo}}`);
    }
    if (lines.length > 0) {
        lines.push('');
    }

    // Process each section
    for (const section of ocrData.sections) {
        // Add section header
        if (section.label) {
            lines.push(`{comment: ${section.label}}`);
        }

        // Process content lines
        if (Array.isArray(section.content)) {
            for (const line of section.content) {
                const chordProLine = mergeChordLine(line.chords, line.lyrics);
                lines.push(chordProLine);
            }
        }

        lines.push(''); // Empty line between sections
    }

    return lines.join('\n').trim();
}

/**
 * Merge chords line with lyrics line into ChordPro format
 * 
 * Example:
 * chords: "Am       G        C"
 * lyrics: "Hello darkness my old"
 * output: "[Am]Hello da[G]rkness my [C]old"
 * 
 * @param {string} chordsLine - Chords with position spacing
 * @param {string} lyricsLine - Lyrics text
 * @returns {string} - ChordPro formatted line
 */
export function mergeChordLine(chordsLine, lyricsLine) {
    if (!chordsLine || !chordsLine.trim()) {
        return lyricsLine || '';
    }
    if (!lyricsLine || !lyricsLine.trim()) {
        // Chords-only line
        return extractChordsAsChordPro(chordsLine);
    }

    // Find chord positions in the chords line
    const chordPositions = [];
    const chordRegex = /([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13|M)*[0-9]*(?:\([^)]*\))?(?:\/[A-G][#b]?)?)/g;
    let match;

    while ((match = chordRegex.exec(chordsLine)) !== null) {
        chordPositions.push({
            chord: match[1],
            position: match.index
        });
    }

    if (chordPositions.length === 0) {
        return lyricsLine;
    }

    // Build result by inserting chords at positions
    let result = '';
    let lastPos = 0;

    for (const { chord, position } of chordPositions) {
        // Add lyrics up to this position
        const lyricsPos = Math.min(position, lyricsLine.length);
        if (lyricsPos > lastPos) {
            result += lyricsLine.slice(lastPos, lyricsPos);
        }
        // Insert chord
        result += `[${chord}]`;
        lastPos = lyricsPos;
    }

    // Add remaining lyrics
    if (lastPos < lyricsLine.length) {
        result += lyricsLine.slice(lastPos);
    }

    return result;
}

/**
 * Extract chords from a chords-only line
 * @param {string} chordsLine 
 * @returns {string}
 */
function extractChordsAsChordPro(chordsLine) {
    const chords = chordsLine.match(/[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13|M)*[0-9]*(?:\([^)]*\))?(?:\/[A-G][#b]?)?/g);
    if (!chords) return '';
    return chords.map(c => `[${c}]`).join(' ');
}

/**
 * Parse ChordPro directives from content
 * @param {string} content - ChordPro content
 * @returns {{ title: string, artist: string, content: string }}
 */
export function parseChordProMeta(content) {
    const titleMatch = content.match(/\{title:\s*([^}]+)\}/i);
    const artistMatch = content.match(/\{artist:\s*([^}]+)\}/i);

    // Remove directives from content
    const cleanContent = content
        .replace(/\{title:[^}]+\}/gi, '')
        .replace(/\{artist:[^}]+\}/gi, '')
        .replace(/\{key:[^}]+\}/gi, '')
        .replace(/\{capo:[^}]+\}/gi, '')
        .trim();

    return {
        title: titleMatch?.[1]?.trim() || '',
        artist: artistMatch?.[1]?.trim() || '',
        content: cleanContent
    };
}
