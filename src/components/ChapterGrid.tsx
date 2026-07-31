"use client";

import React from "react";

interface ChapterGridProps {
    totalChapters: number;
    currentBookId: number;
    selectedBookId: number;
    currentChapter: number;
    onChapterSelect: (chapter: number) => void;
}

export default function ChapterGrid({ 
    totalChapters, 
    currentBookId, 
    selectedBookId, 
    currentChapter, 
    onChapterSelect 
}: ChapterGridProps) {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((chapter) => (
                <button
                    key={chapter}
                    onClick={() => onChapterSelect(chapter)}
                    className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${
                        currentBookId === selectedBookId && currentChapter === chapter
                            ? "bg-orange-400/10 border-orange-400 text-orange-400"
                            : "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800"
                    }`}
                >
                    <span className="text-lg font-medium">{chapter}</span>
                </button>
            ))}
        </div>
    );
}
