"use client";

import DailyVerse from "@/components/DailyVerse";
import StreakCounter from "@/components/StreakCounter";
import SelectionOverlay from "@/components/SelectionOverlay";
import { useState, useEffect } from "react";
import { STORAGE_KEYS, getStorageItem } from "@/lib/storage";
import { useBible } from "@/context/BibleContext";

export default function Home() {
    const { translation, isInitialized } = useBible();
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [lastRead, setLastRead] = useState({ bookId: 1, chapter: 1 });

    useEffect(() => {
        if (isInitialized) {
            const bookId = parseInt(getStorageItem(STORAGE_KEYS.BOOK, "1"), 10);
            const chapter = parseInt(getStorageItem(STORAGE_KEYS.CHAPTER, "1"), 10);
            setLastRead({ bookId, chapter });
        }
    }, [isInitialized]);

    return (
        <div className="flex h-[100dvh] flex-col bg-black text-white overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 z-30 py-4 px-8 md:px-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between relative">
                    <button
                        onClick={() => setIsOverlayOpen(true)}
                        className="text-2xl md:text-3xl font-black tracking-tighter hover:text-orange-400 transition-colors"
                    >
                        Eternal Word
                    </button>

                    <StreakCounter className="static" />
                </div>
            </header>

            <SelectionOverlay
                isOpen={isOverlayOpen}
                onClose={() => setIsOverlayOpen(false)}
                currentBookId={lastRead.bookId}
                currentChapter={lastRead.chapter}
                currentTranslation={translation}
            />

            {/* Daily Verse Content */}
            <DailyVerse />
        </div>
    );
}
