/**
 * Auto-Chords Service
 * 
 * Main orchestration service for automatic chord detection and addition.
 * 
 * Flow:
 * 1. Extract chord names from song content
 * 2. Filter out chords already in user's library
 * 3. Look up in local common chords database
 * 4. Fallback to AI for unknown chords
 * 5. Add new chords to IndexedDB
 * 6. Return list of added chords
 */

import { extractChords, normalizeChordName } from '../utils/chordExtractor';
import { lookupChord } from '../db/commonChords';
import { generateChordWithAI, isGeminiConfigured } from './chordGenerator';
import { getChords, addChord } from '../firebase/firestore';

/**
 * Process auto-chords for a song
 * @param {string} content - The song content in ChordPro format
 * @returns {Promise<string[]>} - Array of newly added chord names
 */
export async function processAutoChords(content, userId) {
    if (!content || !userId) return [];

    try {
        // Step 1: Extract all chord names from content
        const chordNames = extractChords(content);
        if (chordNames.length === 0) return [];

        // Step 2: Get existing chords from user's Firebase library
        const existingChords = await getChords(userId);
        const existingNames = new Set(
            existingChords.map(c => normalizeChordName(c.name))
        );

        // Step 3: Filter out chords that already exist
        const newChordNames = chordNames.filter(
            name => !existingNames.has(normalizeChordName(name))
        );
        if (newChordNames.length === 0) return [];

        // Step 4: Process each new chord
        const addedChords = [];
        const useAI = isGeminiConfigured();

        for (const chordName of newChordNames) {
            // Try local lookup first
            let chordData = lookupChord(chordName);

            // If not found locally, try AI
            if (!chordData && useAI) {
                chordData = await generateChordWithAI(chordName);
            }

            // If we have chord data, add to Firebase
            if (chordData) {
                try {
                    await addChord(userId, {
                        name: chordData.name || chordName,
                        category: 'Auto-Import',
                        tags: ['auto'],
                        data: {
                            positions: [{
                                strings: convertToStringFormat(chordData.strings),
                                fingers: convertToFingerFormat(chordData.fingers),
                                startingFret: chordData.startingFret || 1
                            }]
                        }
                    });
                    addedChords.push(chordData.name || chordName);
                } catch (err) {
                    // Chord might already exist, skip
                    console.warn('Could not add chord:', chordName, err.message);
                }
            } else {
                console.log('Chord not found:', chordName);
            }
        }

        return addedChords;
    } catch (error) {
        console.error('Error processing auto-chords:', error);
        return [];
    }
}

/**
 * Convert array format to object format for strings
 * [E, A, D, G, B, e] -> { 6: E, 5: A, 4: D, 3: G, 2: B, 1: e }
 */
function convertToStringFormat(arr) {
    if (!Array.isArray(arr)) return arr;
    return {
        6: arr[0],
        5: arr[1],
        4: arr[2],
        3: arr[3],
        2: arr[4],
        1: arr[5]
    };
}

/**
 * Convert array format to object format for fingers
 */
function convertToFingerFormat(arr) {
    if (!Array.isArray(arr)) return arr;
    return {
        6: arr[0],
        5: arr[1],
        4: arr[2],
        3: arr[3],
        2: arr[4],
        1: arr[5]
    };
}

/**
 * Get statistics about chord coverage
 * @param {string} content - The song content
 * @returns {Promise<{ total: number, existing: number, new: number, unknown: number }>}
 */
export async function getChordStats(content) {
    const chordNames = extractChords(content);
    const existingChords = await db.chords.toArray();
    const existingNames = new Set(existingChords.map(c => normalizeChordName(c.name)));

    let existing = 0;
    let newInLocal = 0;
    let unknown = 0;

    for (const name of chordNames) {
        if (existingNames.has(normalizeChordName(name))) {
            existing++;
        } else if (lookupChord(name)) {
            newInLocal++;
        } else {
            unknown++;
        }
    }

    return {
        total: chordNames.length,
        existing,
        new: newInLocal,
        unknown
    };
}
