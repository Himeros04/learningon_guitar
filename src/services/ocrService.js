/**
 * OCR Service - Gemini Vision API Integration
 * 
 * Extracts lyrics and chords from song sheet images using AI.
 * 
 * Flow:
 * 1. Compress image (max 1024px, JPEG 80%)
 * 2. Convert to Base64
 * 3. Call Gemini Vision API with music transcription prompt
 * 4. Parse and validate JSON response
 * 5. Return structured song data
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Tu es un expert en transcription musicale OCR. Analyse cette image de partition/tablature et extrait les paroles et accords.

RÈGLES STRICTES :
1. Retourne UNIQUEMENT un JSON valide, sans texte avant ou après
2. Conserve strictement l'alignement vertical des accords par rapport aux paroles
3. Ignore les numéros de page, headers de site web, publicités
4. Si une ligne est illisible, marque-la comme [ILLISIBLE] mais continue
5. Convertis les notations non-standard (H7 → B7)
6. Détecte le titre et l'artiste si visibles

FORMAT DE SORTIE (JSON uniquement) :
{
  "title": "Titre de la chanson ou Inconnu",
  "artist": "Artiste ou Inconnu",
  "key": "Tonalité (ex: Am) ou null",
  "capo": null,
  "sections": [
    {
      "label": "Verse 1",
      "content": [
        {
          "chords": "Am       G        C",
          "lyrics": "Première ligne de paroles"
        }
      ]
    }
  ]
}`;

/**
 * Process image with OCR
 * @param {string} imageData - Base64 encoded image or data URL
 * @returns {Promise<object>} - Parsed song data
 */
export async function processOcrImage(imageData) {
    if (!GEMINI_API_KEY) {
        throw new Error('Clé API Gemini non configurée. Ajoutez VITE_GEMINI_API_KEY dans .env');
    }

    // Extract base64 from data URL if needed
    const base64Data = imageData.includes('base64,')
        ? imageData.split('base64,')[1]
        : imageData;

    // Determine MIME type
    const mimeType = imageData.includes('image/png') ? 'image/png' : 'image/jpeg';

    // Call Gemini Vision API with retry logic
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: SYSTEM_PROMPT },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: base64Data
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0,
                        maxOutputTokens: 4096,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('Réponse vide de l\'IA');
            }

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Format JSON invalide dans la réponse');
            }

            const songData = JSON.parse(jsonMatch[0]);

            // Validate response structure
            if (!validateOcrResponse(songData)) {
                throw new Error('Structure de données invalide');
            }

            return songData;
        } catch (error) {
            lastError = error;
            console.warn(`OCR attempt ${attempt} failed:`, error.message);

            if (attempt < 3) {
                // Exponential backoff
                await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
            }
        }
    }

    throw lastError;
}

/**
 * Validate OCR response structure
 */
function validateOcrResponse(data) {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.title !== 'string') return false;
    if (!Array.isArray(data.sections)) return false;
    return true;
}

/**
 * Compress image for API upload
 * @param {File|Blob} file - Image file
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} - Base64 data URL
 */
export async function compressImage(file, maxWidth = 1024, quality = 0.8) {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error('Aucun fichier sélectionné'));
        }
        if (file.size === 0) {
            return reject(new Error('Le fichier est vide'));
        }
        if (!file.type.startsWith('image/')) {
            return reject(new Error('Le fichier n\'est pas une image valide'));
        }

        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            try {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG base64
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            } catch (e) {
                console.error('Compression error:', e);
                reject(new Error('Erreur lors de la compression de l\'image'));
            }
        };

        img.onerror = (e) => {
            console.error('Image load error:', e);
            reject(new Error('Impossible de lire le format de l\'image'));
        };

        // Load image from file
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = (e) => {
            console.error('FileReader error:', e);
            reject(new Error('Erreur de lecture du fichier'));
        };

        try {
            reader.readAsDataURL(file);
        } catch (e) {
            reject(new Error('Erreur critique lors de la lecture du fichier'));
        }
    });
}

/**
 * Check if Gemini API is configured
 */
export function isOcrConfigured() {
    return !!GEMINI_API_KEY;
}

/**
 * Fallback: Read file as Base64 without compression
 * Useful if Canvas/Compression fails
 */
export function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Erreur de lecture du fichier (Fallback)'));
        reader.readAsDataURL(file);
    });
}
