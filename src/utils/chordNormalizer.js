/**
 * Chord Data Normalizer
 * 
 * Resolves the 3 different chord data formats used in the application:
 * - Format 1 "positions": { positions: [{ frets: [...], fingers: [...] }] }
 * - Format 2 "strings": { strings: { 1: 0, 2: 1, ... }, fingers: {...} }
 * - Format 3 "frets direct": { frets: [...], fingers: [...] }
 * 
 * Target format for Firebase migration: frets[] array (6 strings, low E to high E)
 */

/**
 * Convert strings object format to frets array
 * @param {Object} stringsObj - Object like { 1: 0, 2: 1, 3: 2, 4: 2, 5: 0, 6: -1 }
 * @returns {number[]} Array of 6 fret numbers [lowE, A, D, G, B, highE]
 */
export const stringsObjectToFretsArray = (stringsObj) => {
    // strings object uses 1-6 where 1 = high E, 6 = low E
    // We want array where index 0 = low E (string 6), index 5 = high E (string 1)
    return [6, 5, 4, 3, 2, 1].map(stringNum => {
        const fret = stringsObj[stringNum];
        return fret !== undefined ? fret : -1; // -1 = muted
    });
};

/**
 * Convert fingers object format to fingers array
 * @param {Object} fingersObj - Object like { 1: 1, 2: 2, 3: 3 }
 * @returns {number[]} Array of 6 finger numbers
 */
export const fingersObjectToFingersArray = (fingersObj) => {
    if (!fingersObj) return [0, 0, 0, 0, 0, 0];

    return [6, 5, 4, 3, 2, 1].map(stringNum => {
        const finger = fingersObj[stringNum];
        return finger !== undefined ? finger : 0; // 0 = no finger assigned
    });
};

/**
 * Normalize any chord data format to frets array
 * @param {Object} chordData - Chord data in any of the 3 formats
 * @returns {number[]} Normalized frets array [lowE, A, D, G, B, highE]
 */
export const normalizeToFretsArray = (chordData) => {
    if (!chordData) return [-1, -1, -1, -1, -1, -1];

    // Format 1: positions[].frets[]
    if (chordData.positions && Array.isArray(chordData.positions)) {
        const firstPosition = chordData.positions[0];
        if (firstPosition?.frets && Array.isArray(firstPosition.frets)) {
            return [...firstPosition.frets];
        }
        // Handle case where positions contains strings format
        if (firstPosition?.strings) {
            return stringsObjectToFretsArray(firstPosition.strings);
        }
    }

    // Format 2: strings object
    if (chordData.strings && typeof chordData.strings === 'object') {
        return stringsObjectToFretsArray(chordData.strings);
    }

    // Format 3: frets[] direct
    if (chordData.frets && Array.isArray(chordData.frets)) {
        return [...chordData.frets];
    }

    return [-1, -1, -1, -1, -1, -1];
};

/**
 * Normalize any chord data format to fingers array
 * @param {Object} chordData - Chord data in any of the 3 formats
 * @returns {number[]} Normalized fingers array
 */
export const normalizeToFingersArray = (chordData) => {
    if (!chordData) return [0, 0, 0, 0, 0, 0];

    // Format 1: positions[].fingers[]
    if (chordData.positions && Array.isArray(chordData.positions)) {
        const firstPosition = chordData.positions[0];
        if (firstPosition?.fingers && Array.isArray(firstPosition.fingers)) {
            return [...firstPosition.fingers];
        }
        // Handle case where positions contains fingers object format
        if (firstPosition?.fingers && typeof firstPosition.fingers === 'object') {
            return fingersObjectToFingersArray(firstPosition.fingers);
        }
    }

    // Format 2: fingers object
    if (chordData.fingers && typeof chordData.fingers === 'object' && !Array.isArray(chordData.fingers)) {
        return fingersObjectToFingersArray(chordData.fingers);
    }

    // Format 3: fingers[] direct
    if (chordData.fingers && Array.isArray(chordData.fingers)) {
        return [...chordData.fingers];
    }

    return [0, 0, 0, 0, 0, 0];
};

/**
 * Fully normalize chord data to the target Firebase format
 * @param {Object} chordData - Chord data in any format
 * @returns {Object} Normalized chord data { frets: [], fingers: [] }
 */
export const normalizeChordData = (chordData) => {
    return {
        frets: normalizeToFretsArray(chordData),
        fingers: normalizeToFingersArray(chordData)
    };
};

/**
 * Normalize chord data to positions format (for backward compatibility with ChordDiagram)
 * @param {Object} chordData - Chord data in any format
 * @returns {Object} Data in positions format { positions: [{ frets: [], fingers: [] }] }
 */
export const normalizeToPositionsFormat = (chordData) => {
    const normalized = normalizeChordData(chordData);
    return {
        positions: [normalized]
    };
};

/**
 * Get all variations from chord data in normalized format
 * @param {Object} chordData - Chord data that may contain multiple variations
 * @returns {Array} Array of normalized variations [{ frets: [], fingers: [] }, ...]
 */
export const getAllVariations = (chordData) => {
    if (!chordData) return [];

    // If positions array, normalize each position
    if (chordData.positions && Array.isArray(chordData.positions)) {
        return chordData.positions.map(pos => {
            if (pos.frets && Array.isArray(pos.frets)) {
                return {
                    frets: [...pos.frets],
                    fingers: pos.fingers && Array.isArray(pos.fingers) ? [...pos.fingers] : [0, 0, 0, 0, 0, 0]
                };
            }
            if (pos.strings) {
                return {
                    frets: stringsObjectToFretsArray(pos.strings),
                    fingers: fingersObjectToFingersArray(pos.fingers)
                };
            }
            return normalizeChordData(pos);
        });
    }

    // Single format (strings or frets direct)
    return [normalizeChordData(chordData)];
};

export default {
    normalizeToFretsArray,
    normalizeToFingersArray,
    normalizeChordData,
    normalizeToPositionsFormat,
    getAllVariations,
    stringsObjectToFretsArray,
    fingersObjectToFingersArray
};
