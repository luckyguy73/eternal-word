export type Testament = "Old" | "New";

export interface Verse {
    pk: number;          // Added to match the API
    verseNumber: number;
    text: string;        // This will hold the HTML string
    comment?: string;    // Added since the API provides it
}

export interface Chapter {
    bookId: number;      // Using ID instead of Name for API calls
    bookName: string;    // We'll map the ID to a Name for the UI
    chapterNumber: number;
    verses: Verse[];
    translation: string;
}

export interface DailySelection {
    text: string;
    bookId: number;      // Added to store the numeric ID for navigation
    bookName: string;
    chapterNumber: number;
    verseNumber: number;
    testament: Testament;
}
