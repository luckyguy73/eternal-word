import { z } from "zod";

/**
 * API Response Schemas (Bolls Life API)
 */

export const BollsRandomResponseSchema = z.object({
    pk: z.number(),
    translation: z.string(),
    book: z.number(),
    chapter: z.number(),
    verse: z.number(),
    text: z.string(),
    comment: z.string().optional().nullable(),
});

export const BollsVerseResponseSchema = z.object({
    pk: z.number(),
    verse: z.number(),
    text: z.string(),
    comment: z.string().optional().nullable(),
});

export const BollsChapterVerseSchema = BollsVerseResponseSchema;

export const BollsChapterResponseSchema = z.array(BollsChapterVerseSchema);

/**
 * Application Domain Schemas
 */

export const SavedVerseSchema = z.object({
    bookId: z.number(),
    bookName: z.string(),
    chapterNumber: z.number(),
    verseNumber: z.number(),
    tags: z.array(z.string()).optional(),
});

export const SavedPassageSchema = z.object({
    bookId: z.number(),
    bookName: z.string(),
    chapterNumber: z.number(),
    verses: z.array(SavedVerseSchema),
    rangeLabel: z.string(),
});

// Inferred Types
export type BollsRandomResponse = z.infer<typeof BollsRandomResponseSchema>;
export type BollsVerseResponse = z.infer<typeof BollsVerseResponseSchema>;
export type BollsChapterVerse = z.infer<typeof BollsChapterVerseSchema>;
export type SavedVerse = z.infer<typeof SavedVerseSchema>;
export type SavedPassage = z.infer<typeof SavedPassageSchema>;
