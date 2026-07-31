/**
 * Transforms external links from the Bolls Life API into internal app routes.
 * External format: href='/NKJV/45/2/16'
 * Internal format: href='/chapter/45/2?translation=NKJV&verse=16'
 */
export function fixBollsLinks(html: string): string {
    if (!html) return html;

    // Pattern: /TRANSLATION/BOOK_ID/CHAPTER/VERSE
    // The API uses single quotes: href='/NKJV/45/2/16'
    // Verse part can be a range like 5-7 or use en-dash \u2013
    return html.replace(/href='\/([A-Z0-9]+)\/(\d+)\/(\d+)(?:\/([\d\u2013-]+))?'/g, (match, trans, book, chap, verse) => {
        let newHref = `/chapter/${book}/${chap}?translation=${trans}`;
        if (verse) {
            // Take only the first verse if it's a range
            const firstVerse = verse.split(/[\-\u2013]/)[0];
            newHref += `&verse=${firstVerse}`;
        }
        return `href="${newHref}"`;
    });
}

/**
 * Removes Strong numbers from text (commonly found in KJV/NASB).
 */
export function cleanStrongNumbers(text: string): string {
    if (!text) return text;

    return text
        // First, remove <S>NUMBER</S> format tags
        .replace(/<S>\d+<\/S>/g, "")
        // Remove Strong numbers that are appended directly to words
        // Pattern: letter followed by one or more digits, followed by space, uppercase, or end of string
        .replace(/([a-z])\d+(?=[\s<A-Z]|$)/g, "$1")
        // Clean up any multiple spaces that might have been created
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Extracts and separates verse text from embedded comments (common in KJV).
 */
export interface VerseWithComment {
    text: string;
    comment?: string;
}

export function separateVerseAndComment(verseText: string, existingComment?: string): VerseWithComment {
    if (!verseText) return {text: verseText, comment: existingComment};

    // If there's already a comment from the API, use it
    if (existingComment) {
        return {
            text: verseText.trim(),
            comment: existingComment.trim()
        };
    }

    // Extract <sup> tags which contain comments in KJV
    // Pattern: <sup>comment text</sup>
    const supPattern = /<sup>(.*?)<\/sup>/g;
    const supMatches = Array.from(verseText.matchAll(supPattern));

    if (supMatches.length > 0) {
        // Extract all sup content
        const supTexts = supMatches.map(match => match[1]).join(" ");
        // Remove all sup tags from verse text
        const mainText = verseText.replace(/<sup>.*?<\/sup>/g, "").trim();

        return {
            text: mainText,
            comment: supTexts.trim()
        };
    }

    return {text: verseText, comment: existingComment};
}

/**
 * Unified transformation for scripture text and comments.
 */
export function transformScriptureData(text: string, comment?: string | null) {
    if (text === undefined || text === null) {
        text = "";
    }
    const cleanedText = cleanStrongNumbers(text.trim());
    const cleanedComment = comment ? cleanStrongNumbers(comment) : (comment === null ? undefined : comment);
    
    const separated = separateVerseAndComment(cleanedText, cleanedComment);
    
    return {
        text: separated.text,
        comment: separated.comment ? fixBollsLinks(separated.comment) : separated.comment
    };
}

/**
 * Checks if two dates represent the same calendar day.
 */
export function isSameDay(date1: Date | string | null, date2: Date = new Date()): boolean {
    if (!date1) return false;
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    if (isNaN(d1.getTime())) return false;

    return d1.getDate() === date2.getDate() &&
        d1.getMonth() === date2.getMonth() &&
        d1.getFullYear() === date2.getFullYear();
}

/**
 * Sanitizes HTML input to allow only safe scripture formatting tags and attributes,
 * preventing potential XSS injections.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return "";

    // Remove script, iframe, object, embed, form, style tags and their contents
    let sanitized = html.replace(/<(script|iframe|object|embed|form|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
    
    // Remove self-closing dangerous tags
    sanitized = sanitized.replace(/<(script|iframe|object|embed|form|style|input|meta)[^>]*\/?>/gi, "");

    // Remove inline event handlers (on*="...")
    sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

    // Remove javascript: pseudo-protocol in attributes
    sanitized = sanitized.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');

    return sanitized;
}
