"use client";

import { Chapter } from "@/models/models";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FaHome, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ChapterSelector from "./ChapterSelector";
import TranslationSelector from "./TranslationSelector";
import { BOOKS } from "@/models/metadata";

interface ChapterDisplayProps {
    chapter: Chapter;
    bookId: number;
    translation: string;
}

export default function ChapterDisplay({ chapter, bookId, translation }: ChapterDisplayProps) {
    const searchParams = useSearchParams();
    const currentBook = BOOKS[bookId];
    const maxChapters = currentBook?.chapters || 1;

    useEffect(() => {
        const verseNum = searchParams.get("verse");
        if (verseNum) {
            const verseElement = document.getElementById(`verse-${verseNum}`);
            if (verseElement) {
                // Smooth scroll with some padding from the top
                const headerOffset = 200; // Account for sticky header
                const elementPosition = verseElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }
    }, [searchParams]);

    const hasPrev = chapter.chapterNumber > 1;
    const hasNext = chapter.chapterNumber < maxChapters;

    let prevLink = "";
    if (chapter.chapterNumber > 1) {
        prevLink = `/chapter/${bookId}/${chapter.chapterNumber - 1}?translation=${translation}${searchParams.get("temp") === "true" ? "&temp=true" : ""}`;
    }

    let nextLink = "";
    if (chapter.chapterNumber < maxChapters) {
        nextLink = `/chapter/${bookId}/${chapter.chapterNumber + 1}?translation=${translation}${searchParams.get("temp") === "true" ? "&temp=true" : ""}`;
    }

    return (
        <div className="flex min-h-screen flex-col bg-black text-white relative">
            {/* Navigation Buttons - Hidden on small screens or keep them? 
                The requirement says "float above the text on left and right margin" 
            */}
            {hasPrev && (
                <Link
                    href={prevLink}
                    className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-gray-700/70 border border-gray-600 rounded-full hover:bg-gray-600 transition-all z-20"
                    title="Previous Chapter"
                >
                    <FaChevronLeft size={24} />
                </Link>
            )}

            {hasNext && (
                <Link
                    href={nextLink}
                    className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-gray-700/70 border border-gray-600 rounded-full hover:bg-gray-600 transition-all z-20"
                    title="Next Chapter"
                >
                    <FaChevronRight size={24} />
                </Link>
            )}

            {/* Header */}
            <header className="sticky top-0 bg-black border-b border-gray-800 p-4 md:p-6 z-10">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 relative">

                    {/* Title Row */}
                    <div className="flex items-center gap-3 w-full md:justify-center">
                        <Link
                            href="/"
                            className="p-3 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors absolute -left-1.5 md:left-0 md:top-1/2 md:-translate-y-1/2"
                            title="Home"
                        >
                            <FaHome size={28} />
                        </Link>

                        <h1 className="text-3xl md:text-4xl font-bold text-center flex-1 md:flex-none">
                            {chapter.bookName} {chapter.chapterNumber}
                        </h1>
                    </div>

                    {/* Selectors */}
                    <div className="flex flex-col md:flex-row gap-3 w-full px-4 md:px-0 items-center md:items-center
                                    justify-start md:justify-center">
                        <ChapterSelector
                            currentBookId={bookId}
                            currentChapter={chapter.chapterNumber}
                        />
                        <TranslationSelector
                            currentTranslation={translation}
                            bookId={bookId}
                            chapterNumber={chapter.chapterNumber}
                        />
                    </div>

                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-4 md:p-6">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <div className="space-y-6">
                        {chapter.verses.map((verse) => (
                            <div key={verse.pk} id={`verse-${verse.verseNumber}`} className="flex gap-4">
                                {/* Verse Number */}
                                <span className={`font-semibold min-w-fit shrink-0 ${
                                    searchParams.get("temp") === "true" && searchParams.get("verse") === verse.verseNumber.toString()
                                        ? "text-orange-400"
                                        : "text-gray-500"
                                }`}>
                                    {verse.verseNumber}
                                </span>

                                {/* Verse Text */}
                                <div className="flex-1">
                                    <p
                                        className="text-lg leading-relaxed text-gray-100"
                                        dangerouslySetInnerHTML={{ __html: verse.text }}
                                    />

                                    {/* Commentary if available */}
                                    {verse.comment && (
                                        <p className="text-sm text-gray-400 mt-2 italic border-l-2 border-gray-600 pl-3">
                                            <span className="font-semibold">Note: </span>
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: verse.comment,
                                                }}
                                            />
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

