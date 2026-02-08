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
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

// Priority list:
// 1. gemini-2.0-flash: Used initially (works but rate limited)
// 2. gemini-1.5-flash: Standard fast model
// 3. gemini-pro-vision: Stable legacy fallback
const MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-pro-vision'
];

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

    // Call Gemini Vision API with retry + model fallback logic
    let lastError;
    const retryDelays = [2000, 5000]; // Reduced retry count per model to speed up fallback

    // Try each model in sequence
    for (const model of MODELS) {
        console.log(`Attempting OCR with model: ${model}`);

        for (let attempt = 0; attempt <= 1; attempt++) {
            try {
                const response = await fetch(`${BASE_URL}${model}:generateContent?key=${GEMINI_API_KEY}`, {
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

                    // Handle Rate Limiting (429) -> Wait and retry same model
                    if (response.status === 429) {
                        throw new Error(`QUOTA_EXCEEDED`); // Special marker to trigger delay
                    }

                    // Handle 404 (Model not found) -> Break inner loop to try next model
                    if (response.status === 404) {
                        console.warn(`Model ${model} not found (404). Switching...`);
                        throw new Error(`MODEL_NOT_FOUND`);
                    }

                    throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!text) throw new Error('Réponse vide de l\'IA');

                // Extract JSON from response
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('Format JSON invalide dans la réponse');

                const songData = JSON.parse(jsonMatch[0]);

                if (!validateOcrResponse(songData)) throw new Error('Structure de données invalide');

                return songData; // Success!

            } catch (error) {
                lastError = error;
                console.warn(`OCR attempt ${attempt + 1} with ${model} failed:`, error.message);

                if (error.message === 'MODEL_NOT_FOUND') {
                    break; // Move to next model immediately
                }

                if (attempt < 1 && (error.message === 'QUOTA_EXCEEDED' || error.message.includes('fetch') || error.message.includes('50'))) {
                    const delay = retryDelays[attempt] || 5000;
                    console.log(`Waiting ${delay}ms before retry...`);
                    await new Promise(r => setTimeout(r, delay));
                } else {
                    break; // Stop retrying this model, move to next
                }
            }
        }
    }

    if (lastError && lastError.message === 'QUOTA_EXCEEDED') {
        throw new Error('Quota gratuit dépassé sur tous les modèles. Veuillez patienter.');
    }

    throw lastError || new Error('Echec de l\'analyse OCR après plusieurs tentatives.');
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
