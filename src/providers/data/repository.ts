import { DailySelection, Chapter } from "@/models/models";
import { getBookInfo } from "@/models/metadata";

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

// Helper function to remove Strong's numbers from KJV text and separate comments
function cleanStrongsNumbers(text: string): string {
    if (!text) return text;
    
    // Remove Strong's numbers in various formats:
    // 1. <S>NUMBER</S> format
    // 2. Numbers directly appended to words (word123)
    
    return text
        // First, remove <S>NUMBER</S> format tags
        .replace(/<S>\d+<\/S>/g, "")
        // Remove Strong's numbers that are appended directly to words
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
    if (!verseText) return { text: verseText, comment: existingComment };
    
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
    
    return { text: verseText, comment: existingComment };
}

// 1. Fetch Daily Random Verse
export async function getDailyWord(): Promise<DailySelection> {
    const res = await fetch(`https://bolls.life/get-random-verse/${DEFAULT_TRANS}/`);

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`API Error - Status: ${res.status} ${res.statusText}`);
        console.error(`Response Body:`, errorText);
        throw new Error(`Could not reach the Source (${res.status}: ${res.statusText})`);
    }

    const data: BollsRandomResponse = await res.json();
    const bookInfo = getBookInfo(data.book);

    return {
        text: cleanStrongsNumbers(data.text.trim()),
        bookName: bookInfo.name,
        chapterNumber: data.chapter,
        verseNumber: data.verse,
        testament: bookInfo.testament
    };
}

// 2. Fetch Full Chapter
export async function getChapter(bookId: number, chapter: number, translation: string = DEFAULT_TRANS): Promise<Chapter> {
    const res = await fetch(`https://bolls.life/get-chapter/${translation}/${bookId}/${chapter}/`);

    if (!res.ok) throw new Error(`Could not find Chapter ${chapter}`);

    const data: BollsChapterVerse[] = await res.json();
    const bookInfo = getBookInfo(bookId);

    return {
        bookId: bookId,
        bookName: bookInfo.name,
        chapterNumber: chapter,
        translation: translation,
        verses: data.map((v) => {
            // Clean Strong's numbers first
            const cleanedText = cleanStrongsNumbers(v.text.trim());
            const cleanedComment = v.comment ? cleanStrongsNumbers(v.comment) : v.comment;
            
            // Then separate verse and comment if needed
            const separated = separateVerseAndComment(cleanedText, cleanedComment);
            
            return {
                pk: v.pk,
                verseNumber: v.verse,
                text: separated.text,
                comment: separated.comment
            };
        })
    };
}
