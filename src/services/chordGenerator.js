/**
 * AI Chord Generator Service
 * 
 * Uses Gemini API to generate chord fingerings for complex/unknown chords.
 * Falls back when local database doesn't have the chord.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Tu es un expert guitariste et théoricien de la musique. 
Ta tâche : générer la position d'accord de guitare la plus courante et jouable.

CONTRAINTES STRICTES :
1. Retourne TOUJOURS un JSON valide, rien d'autre
2. Maximum 4 doigts utilisés (index=1, majeur=2, annulaire=3, auriculaire=4)
3. L'écart entre les frettes ne doit pas dépasser 4 cases
4. Privilégie les positions en bas du manche (frettes 0 à 5)
5. Si l'accord est impossible à jouer, retourne null

FORMAT DE SORTIE (JSON uniquement) :
{
  "name": "nom de l'accord",
  "key": "note fondamentale (A-G avec # ou b)",
  "suffix": "type d'accord (m, 7, maj7, etc.)",
  "startingFret": 1,
  "strings": [E, A, D, G, B, e],
  "fingers": [E, A, D, G, B, e]
}

Pour strings: -1=muette, 0=à vide, 1-12=numéro de frette
Pour fingers: 0=pas de doigt, 1-4=numéro du doigt`;

/**
 * Generate chord fingering using Gemini AI
 * @param {string} chordName - The chord name to generate
 * @returns {Promise<object|null>} - Chord definition or null
 */
export async function generateChordWithAI(chordName) {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env');
        return null;
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${SYSTEM_PROMPT}\n\nGénère la position pour l'accord: ${chordName}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 500,
                }
            })
        });

        if (!response.ok) {
            console.error('Gemini API error:', response.status);
            return null;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return null;
        }

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return null;
        }

        const chordData = JSON.parse(jsonMatch[0]);

        // Validate the response
        if (!validateChordData(chordData)) {
            console.warn('Invalid chord data from AI:', chordData);
            return null;
        }

        return chordData;
    } catch (error) {
        console.error('Error generating chord with AI:', error);
        return null;
    }
}

/**
 * Validate chord data structure and playability
 * @param {object} data - The chord data to validate
 * @returns {boolean} - Whether the data is valid
 */
function validateChordData(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.name || !data.strings || !data.fingers) return false;
    if (!Array.isArray(data.strings) || data.strings.length !== 6) return false;
    if (!Array.isArray(data.fingers) || data.fingers.length !== 6) return false;

    // Check finger count (max 4)
    const usedFingers = data.fingers.filter(f => f > 0);
    if (usedFingers.length > 4) {
        console.warn('Too many fingers used:', usedFingers.length);
        return false;
    }

    // Check fret span (max 4)
    const frets = data.strings.filter(f => f > 0);
    if (frets.length > 0) {
        const minFret = Math.min(...frets);
        const maxFret = Math.max(...frets);
        if (maxFret - minFret > 4) {
            console.warn('Fret span too large:', maxFret - minFret);
            return false;
        }
    }

    return true;
}

/**
 * Check if Gemini API is configured
 * @returns {boolean}
 */
export function isGeminiConfigured() {
    return !!GEMINI_API_KEY;
}
