import { DEFAULT_TRANSLATION } from "@/constants/bible";
import { Chapter, DailySelection } from "@/models/models";
import { getBookInfo } from "@/models/metadata";
import { getTranslationInfo } from "@/models/translations";
import { transformScriptureData } from "@/lib/bibleService";
import {
    BollsChapterResponseSchema,
    BollsChapterVerse,
    BollsRandomResponse,
    BollsRandomResponseSchema,
    BollsVerseResponse,
    BollsVerseResponseSchema
} from "@/models/schemas";


// API Response shapes are now defined in models/schemas.ts

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
            } catch {
                // Not JSON or other error reading body
            }
            throw new Error(`Proxy error: ${res.status}${details ? ` - ${details}` : ""}`);
        }
        return res;
    } else {
        // On the server, we can call bolls.life directly
        return fetch(`https://bolls.life/${endpoint}`, {
            cache: 'no-store'
        });
    }
}

// 1. Fetch Daily Random Verse
export async function getDailyWord(translation: string = DEFAULT_TRANSLATION): Promise<DailySelection> {
    const translationSlug = getTranslationInfo(translation).slug;
    const endpoint = `get-random-verse/${translationSlug}/`;
    const res = await fetchBolls(endpoint);

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`API Error (getDailyWord) - Status: ${res.status} ${res.statusText}`);
        console.error(`Response Body:`, errorText);
        throw new Error(`Could not reach the Source (${res.status}: ${res.statusText})`);
    }

    const json = await res.json();
    const data: BollsRandomResponse = BollsRandomResponseSchema.parse(json);
    const bookInfo = getBookInfo(data.book);
    const transformed = transformScriptureData(data.text);

    return {
        text: transformed.text,
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

    const json = await res.json();
    const data: BollsVerseResponse = BollsVerseResponseSchema.parse(json);
    const bookInfo = getBookInfo(bookId);
    const transformed = transformScriptureData(data.text);

    return {
        text: transformed.text,
        bookId: bookId,
        bookName: bookInfo.name,
        chapterNumber: chapter,
        verseNumber: verse,
        testament: bookInfo.testament,
        translation: translationSlug
    };
}

// 3. Fetch Full Chapter
export async function getChapter(bookId: number, chapter: number, translation: string = DEFAULT_TRANSLATION): Promise<Chapter> {
    const translationSlug = getTranslationInfo(translation).slug;
    const endpoint = `get-chapter/${translationSlug}/${bookId}/${chapter}/`;
    const res = await fetchBolls(endpoint);

    if (!res.ok) {
        console.error(`API Error (getChapter) - Status: ${res.status} ${res.statusText}`);
        throw new Error(`Could not find Chapter ${chapter}`);
    }

    const json = await res.json();
    const data: BollsChapterVerse[] = BollsChapterResponseSchema.parse(json);
    const bookInfo = getBookInfo(bookId);

    return {
        bookId: bookId,
        bookName: bookInfo.name,
        chapterNumber: chapter,
        translation: translationSlug,
        verses: data.map((v) => {
            const transformed = transformScriptureData(v.text, v.comment);

            return {
                pk: v.pk,
                verseNumber: v.verse,
                text: transformed.text,
                comment: transformed.comment
            };
        })
    };
}
