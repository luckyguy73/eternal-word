"use client";

import { Chapter } from "@/models/models";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BOOKS } from "@/models/metadata";
import SelectionOverlay from "./SelectionOverlay";
import VerseText from "./VerseText";
import { useSettings } from "@/context/SettingsContext";
import { useLibrary } from "@/context/LibraryContext";
import { LAYOUT, Z_INDEX } from "@/constants/layout";
import { ErrorBoundary } from "./ErrorBoundary";

interface ChapterDisplayProps {
    chapter: Chapter;
    bookId: number;
    translation: string;
}

export default function ChapterDisplay({ chapter, bookId, translation }: ChapterDisplayProps) {
    const searchParams = useSearchParams();
    const { toggleSavedVerse, isVerseSaved } = useLibrary();
    const { setTranslation, setLastRead, isInitialized } = useSettings();
    const currentBook = BOOKS[bookId];
    const maxChapters = currentBook?.chapters || 1;
    
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    useEffect(() => {
        if (isInitialized) {
            setLastRead(bookId, chapter.chapterNumber);
            setTranslation(translation);
        }
    }, [isInitialized, bookId, chapter.chapterNumber, translation, setTranslation, setLastRead]);

    useEffect(() => {
        const verseNum = searchParams.get("verse");
        if (verseNum) {
            const verseElement = document.getElementById(`verse-${verseNum}`);
            if (verseElement) {
                // Smooth scroll with some padding from the top
                const elementPosition = verseElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - LAYOUT.SCROLL_OFFSET;

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

    const handleToggleSaved = (v: { verseNumber: number }) => {
        toggleSavedVerse({
            bookId,
            bookName: chapter.bookName,
            chapterNumber: chapter.chapterNumber,
            verseNumber: v.verseNumber,
        });
    };

    return (
        <div className="flex min-h-screen flex-col bg-black text-white relative">
            {/* Navigation Buttons - Hidden on small screens or keep them? 
                The requirement says "float above the text on left and right margin" 
            */}
            {hasPrev && (
                <Link
                    href={prevLink}
                    className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-gray-700/70 border border-gray-600 rounded-full hover:bg-gray-600 transition-all"
                    style={{ zIndex: Z_INDEX.OVERLAY_NAV }}
                    title="Previous Chapter"
                >
                    <FaChevronLeft size={24} />
                </Link>
            )}

            {hasNext && (
                <Link
                    href={nextLink}
                    className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-gray-700/70 border border-gray-600 rounded-full hover:bg-gray-600 transition-all"
                    style={{ zIndex: Z_INDEX.OVERLAY_NAV }}
                    title="Next Chapter"
                >
                    <FaChevronRight size={24} />
                </Link>
            )}

            {/* Header */}
            <header 
                className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 px-8 py-4 md:px-8 md:py-6"
                style={{ zIndex: Z_INDEX.OVERLAY_HEADER }}
            >
                <div className="max-w-4xl mx-auto flex items-center justify-center relative">
                    <button
                        onClick={() => setIsOverlayOpen(true)}
                        className="px-6 py-2 rounded-full border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-colors flex items-center gap-2 group"
                    >
                        <h1 className="text-xl md:text-2xl font-bold text-center">
                            {chapter.bookName} {chapter.chapterNumber} <span className="text-gray-500 font-medium">·</span> <span className="text-gray-400 font-medium group-hover:text-orange-400 transition-colors">{translation}</span>
                        </h1>
                    </button>
                </div>
            </header>

            <SelectionOverlay
                isOpen={isOverlayOpen}
                onClose={() => setIsOverlayOpen(false)}
                currentBookId={bookId}
                currentChapter={chapter.chapterNumber}
                currentTranslation={translation}
            />

            {/* Content */}
            <main className="flex-1 px-8 py-8 pb-32">
                <ErrorBoundary name="ChapterContent">
                    <div className="max-w-4xl mx-auto prose prose-invert">
                        <div className="space-y-6">
                            {chapter.verses.map((verse) => (
                                <div key={verse.pk} id={`verse-${verse.verseNumber}`} className="flex items-start">
                                    {/* Verse Number */}
                                    <button
                                        onClick={() => handleToggleSaved(verse)}
                                        className={`font-semibold min-w-10 pr-4 py-1 -my-1 text-right shrink-0 transition-all hover:scale-110 active:scale-90 ${
                                            isVerseSaved(bookId, chapter.chapterNumber, verse.verseNumber)
                                                ? "text-orange-400"
                                                : searchParams.get("temp") === "true" && searchParams.get("verse") === verse.verseNumber.toString()
                                                    ? "text-yellow-400"
                                                    : "text-gray-500 hover:text-gray-300"
                                        }`}
                                    >
                                        {verse.verseNumber}
                                    </button>
    
                                    {/* Verse Text */}
                                    <div className="flex-1">
                                        <VerseText
                                            tag="p"
                                            className={`text-lg leading-relaxed transition-colors ${
                                                isVerseSaved(bookId, chapter.chapterNumber, verse.verseNumber)
                                                    ? "text-orange-400"
                                                    : searchParams.get("temp") === "true" && searchParams.get("verse") === verse.verseNumber.toString()
                                                        ? "text-yellow-400"
                                                        : "text-gray-100"
                                            }`}
                                            html={verse.text}
                                        />
    
                                        {/* Commentary if available */}
                                        {verse.comment && (
                                            <p className="text-sm text-gray-400 mt-2 italic border-l-2 border-gray-600 pl-3">
                                                <span className="font-semibold">Note: </span>
                                                <VerseText tag="span" html={verse.comment} />
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ErrorBoundary>
            </main>
        </div>
    );
}

