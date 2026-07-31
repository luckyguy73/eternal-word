import { getChapter } from "@/providers/data/repository";
import ChapterDisplay from "@/components/ChapterDisplay";
import { notFound } from "next/navigation";
import { DEFAULT_TRANSLATION } from "@/constants/bible";

interface ChapterPageProps {
    params: Promise<{
        bookId: string;
        chapterNumber: string;
    }>;
    searchParams: Promise<{
        translation?: string;
    }>;
}

export default async function ChapterPage({ params, searchParams }: ChapterPageProps) {
    const { bookId, chapterNumber } = await params;
    const { translation } = await searchParams;
    
    const bookIdNum = parseInt(bookId, 10);
    const chapterNum = parseInt(chapterNumber, 10);
    const selectedTranslation = translation || DEFAULT_TRANSLATION;

    // Validate parameters
    if (isNaN(bookIdNum) || isNaN(chapterNum) || bookIdNum < 1 || bookIdNum > 66 || chapterNum < 1) {
        notFound();
    }

    const chapter = await getChapter(bookIdNum, chapterNum, selectedTranslation).catch(() => null);
    
    if (!chapter) {
        notFound();
    }

    return <ChapterDisplay chapter={chapter} bookId={bookIdNum} translation={selectedTranslation} />;
}


