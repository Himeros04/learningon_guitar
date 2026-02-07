/**
 * Parser ChordPro
 * Transforme le texte brut avec accords [Am] en structure structurée
 * 
 * Input: "C'est un [C]beau roman"
 * Output: [
 *   { type: 'text', content: "C'est un " },
 *   { type: 'chord', content: "C" },
 *   { type: 'text', content: "beau roman" }
 * ]
 */

export const parseChordPro = (text) => {
    if (!text) return [];

    const lines = text.split('\n');

    return lines.map(line => {
        // Si la ligne est une directive (ex: {title: ...}), on la traite à part (TODO)
        if (line.trim().startsWith('{')) {
            return { type: 'directive', content: line }; // Placeholder
        }

        const tokens = [];
        let buffer = '';
        let i = 0;

        while (i < line.length) {
            if (line[i] === '[') {
                if (buffer) {
                    tokens.push({ type: 'text', content: buffer });
                    buffer = '';
                }

                // Capturer l'accord
                let chord = '';
                i++; // Sauter le '['
                while (i < line.length && line[i] !== ']') {
                    chord += line[i];
                    i++;
                }
                tokens.push({ type: 'chord', content: chord });
                // Sauter le ']'
            } else {
                buffer += line[i];
            }
            i++;
        }

        if (buffer) {
            tokens.push({ type: 'text', content: buffer });
        }

        return { type: 'line', tokens };
    });
};

/**
 * Extrait les métadonnées (Title, Artist) si présentes
 */
export const extractMetadata = (text) => {
    const metadata = {};
    const lines = text.split('\n');
    lines.forEach(line => {
        const match = line.match(/{(.*?):(.*)}/);
        if (match) {
            const key = match[1].toLowerCase().trim();
            const value = match[2].trim();
            metadata[key] = value;
        }
    });
    return metadata;
};
