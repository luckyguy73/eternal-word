import { SavedVerse, SavedPassage } from "@/models/models";

/**
 * Groups consecutive saved verses into passages.
 * 1. Sorts by Book, then Chapter, then Verse order.
 * 2. Bundles consecutive verses (n, n+1) into a single passage.
 */
export function groupVersesIntoPassages(savedVerses: SavedVerse[]): SavedPassage[] {
    if (savedVerses.length === 0) return [];

    // 1. Sort
    const sorted = [...savedVerses].sort((a, b) => {
        if (a.bookId !== b.bookId) return a.bookId - b.bookId;
        if (a.chapterNumber !== b.chapterNumber) return a.chapterNumber - b.chapterNumber;
        return a.verseNumber - b.verseNumber;
    });

    const passages: SavedPassage[] = [];
    let currentPassage: SavedPassage | null = null;

    for (const verse of sorted) {
        if (!currentPassage) {
            currentPassage = createNewPassage(verse);
            continue;
        }

        const lastVerse = currentPassage.verses[currentPassage.verses.length - 1];
        
        const isSameContext = 
            verse.bookId === currentPassage.bookId &&
            verse.chapterNumber === currentPassage.chapterNumber;
            
        const isConsecutive = verse.verseNumber === lastVerse.verseNumber + 1;

        if (isSameContext && isConsecutive) {
            const updatedVerses: SavedVerse[] = [...currentPassage.verses, verse];
            currentPassage = {
                ...currentPassage,
                verses: updatedVerses,
                rangeLabel: getRangeLabel(currentPassage.bookName, currentPassage.chapterNumber, updatedVerses)
            };
        } else {
            passages.push(currentPassage);
            currentPassage = createNewPassage(verse);
        }
    }

    if (currentPassage) {
        passages.push(currentPassage);
    }

    return passages;
}

function createNewPassage(verse: SavedVerse): SavedPassage {
    return {
        bookId: verse.bookId,
        bookName: verse.bookName,
        chapterNumber: verse.chapterNumber,
        verses: [verse],
        rangeLabel: getRangeLabel(verse.bookName, verse.chapterNumber, [verse])
    };
}

function getRangeLabel(bookName: string, chapterNumber: number, verses: SavedVerse[]): string {
    const first = verses[0].verseNumber;
    const last = verses[verses.length - 1].verseNumber;
    if (first === last) {
        return `${bookName} ${chapterNumber}:${first}`;
    } else {
        return `${bookName} ${chapterNumber}:${first}-${last}`;
    }
}

/**
 * Formats a tag to Proper Title Case.
 * Example: "faith hope" -> "Faith Hope"
 */
export function formatTag(tag: string): string {
    if (!tag) return "";
    return tag
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
