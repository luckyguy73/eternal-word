import {Chapter, DailySelection} from "@/models/models";
import {getBookInfo} from "@/models/metadata";
import {getTranslationInfo} from "@/models/translations";

// The bolls.life API currently has a self-signed certificate issue.
// This allows fetch to work in Node.js environments despite the certificate issue.
if (typeof process !== 'undefined' && process.env) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// API Response Shapes
interface BollsRandomResponse {
    pk: number;
    translation: string;
    book: number; // It's an ID, not a name
    chapter: number;
    verse: number;
    text: string;
}

interface BollsChapterVerse {
    pk: number;
    verse: number;
    text: string;
    comment?: string;
}

const DEFAULT_TRANS = "NKJV";

// Helper function to remove Strong numbers from KJV text and separate comments
function cleanStrongNumbers(text: string): string {
    if (!text) return text;

    // Remove Strong numbers in various formats:
    // 1. <S>NUMBER</S> format
    // 2. Numbers directly appended to words (word123)

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

// Helper function to extract and separate verse text from embedded comments
interface VerseWithComment {
    text: string;
    comment?: string;
}

function separateVerseAndComment(verseText: string, existingComment?: string): VerseWithComment {
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
 * Transforms external links from the Bolls Life API into internal app routes.
 * External format: href='/NKJV/45/2/16'
 * Internal format: href='/chapter/45/2?translation=NKJV&verse=16'
 */
function fixBollsLinks(html: string): string {
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

// Helper function to handle fetch calls (proxied on client, direct on server)
async function fetchBolls(endpoint: string) {
    const isClient = typeof window !== 'undefined';

    if (isClient) {
        // On the client, we must proxy through our own API to bypass SSL certificate restrictions
        const res = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`);
        if (!res.ok) {
            let details = "";
            try {
                const errorData = await res.json();
                details = errorData.details || errorData.error || "";
            } catch (e) {
                // Not JSON or other error reading body
            }
            throw new Error(`Proxy error: ${res.status}${details ? ` - ${details}` : ""}`);
        }
        return res;
    } else {
        // On the server, we can call bolls.life directly (with our SSL workaround)
        return fetch(`https://bolls.life/${endpoint}`, {
            // @ts-ignore
            cache: 'no-store'
        });
    }
}

// 1. Fetch Daily Random Verse
export async function getDailyWord(translation: string = DEFAULT_TRANS): Promise<DailySelection> {
    const translationSlug = getTranslationInfo(translation).slug;
    const endpoint = `get-random-verse/${translationSlug}/`;
    const res = await fetchBolls(endpoint);

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`API Error (getDailyWord) - Status: ${res.status} ${res.statusText}`);
        console.error(`Response Body:`, errorText);
        throw new Error(`Could not reach the Source (${res.status}: ${res.statusText})`);
    }

    const data: BollsRandomResponse = await res.json();
    const bookInfo = getBookInfo(data.book);

    return {
        text: cleanStrongNumbers(data.text.trim()),
        bookId: data.book,
        bookName: bookInfo.name,
        chapterNumber: data.chapter,
        verseNumber: data.verse,
        testament: bookInfo.testament,
        translation: translationSlug
    };
}

// 2. Fetch Specific Verse Text
export async function getSpecificVerse(
    translation: string,
    bookId: number,
    chapter: number,
    verse: number
): Promise<DailySelection> {
    const translationSlug = getTranslationInfo(translation).slug;
    const endpoint = `get-verse/${translationSlug}/${bookId}/${chapter}/${verse}/`;
    const res = await fetchBolls(endpoint);

    if (!res.ok) {
        console.error(`API Error (getSpecificVerse) - Status: ${res.status} ${res.statusText}`);
        console.error(`Context: ${translationSlug}/${bookId}/${chapter}/${verse}`);
        throw new Error(`Could not find Verse ${bookId} ${chapter}:${verse}`);
    }

    const data: BollsRandomResponse = await res.json();
    const bookInfo = getBookInfo(bookId);

    return {
        text: cleanStrongNumbers(data.text.trim()),
        bookId: bookId,
        bookName: bookInfo.name,
        chapterNumber: chapter,
        verseNumber: verse,
        testament: bookInfo.testament,
        translation: translationSlug
    };
}

// 3. Fetch Full Chapter
export async function getChapter(bookId: number, chapter: number, translation: string = DEFAULT_TRANS): Promise<Chapter> {
    const translationSlug = getTranslationInfo(translation).slug;
    const endpoint = `get-chapter/${translationSlug}/${bookId}/${chapter}/`;
    const res = await fetchBolls(endpoint);

    if (!res.ok) {
        console.error(`API Error (getChapter) - Status: ${res.status} ${res.statusText}`);
        throw new Error(`Could not find Chapter ${chapter}`);
    }

    const data: BollsChapterVerse[] = await res.json();
    const bookInfo = getBookInfo(bookId);

    return {
        bookId: bookId,
        bookName: bookInfo.name,
        chapterNumber: chapter,
        translation: translationSlug,
        verses: data.map((v) => {
            // Clean Strong numbers first
            const cleanedText = cleanStrongNumbers(v.text.trim());
            const cleanedComment = v.comment ? cleanStrongNumbers(v.comment) : v.comment;

            // Then separate verse and comment if needed
            const separated = separateVerseAndComment(cleanedText, cleanedComment);

            // Fix any broken links in the comment
            const finalComment = separated.comment ? fixBollsLinks(separated.comment) : separated.comment;

            return {
                pk: v.pk,
                verseNumber: v.verse,
                text: separated.text,
                comment: finalComment
            };
        })
    };
}
