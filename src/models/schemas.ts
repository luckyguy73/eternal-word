import { z } from "zod";

export const BollsRandomResponseSchema = z.object({
    pk: z.number(),
    translation: z.string(),
    book: z.number(),
    chapter: z.number(),
    verse: z.number(),
    text: z.string(),
});

export const BollsVerseResponseSchema = z.object({
    pk: z.number(),
    verse: z.number(),
    text: z.string(),
    comment: z.string().optional().nullable(),
});

export const BollsChapterVerseSchema = BollsVerseResponseSchema;

export const BollsChapterResponseSchema = z.array(BollsChapterVerseSchema);

export type BollsRandomResponse = z.infer<typeof BollsRandomResponseSchema>;
export type BollsVerseResponse = z.infer<typeof BollsVerseResponseSchema>;
export type BollsChapterVerse = z.infer<typeof BollsChapterVerseSchema>;
