"use client";

import { Chapter } from "@/models/models";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import ChapterSelector from "./ChapterSelector";
import TranslationSelector from "./TranslationSelector";

interface ChapterDisplayProps {
    chapter: Chapter;
    bookId: number;
    translation: string;
}

export default function ChapterDisplay({ chapter, bookId, translation }: ChapterDisplayProps) {
    return (
        <div className="flex min-h-screen flex-col bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 bg-black border-b border-gray-800 p-4 md:p-6 z-10">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 relative">
                    {/* Home button vertically centered across both rows */}
                    <Link
                        href="/"
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-3 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
                        title="Home"
                    >
                        <FaHome size={28} />
                    </Link>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-center">
                        {chapter.bookName} {chapter.chapterNumber}
                    </h1>

                    {/* Selectors */}
                    <div className="flex items-center gap-3">
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
                            <div key={verse.pk} className="flex gap-4">
                                {/* Verse Number */}
                                <span className="text-gray-500 font-semibold min-w-fit flex-shrink-0">
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

