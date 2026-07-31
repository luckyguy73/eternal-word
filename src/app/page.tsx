"use client";

import DailyVerse from "@/components/DailyVerse";
import StreakCounter from "@/components/StreakCounter";
import SelectionOverlay from "@/components/SelectionOverlay";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Z_INDEX } from "@/constants/layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
    const { translation, lastRead, isInitialized } = useSettings();
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    return (
        <div className="flex h-[100dvh] flex-col bg-black text-white overflow-hidden">
            {/* Header */}
            <header 
                className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 py-4 px-8 md:px-8"
                style={{ zIndex: Z_INDEX.OVERLAY_HEADER }}
            >
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
            <ErrorBoundary name="DailyVerse">
                <DailyVerse />
            </ErrorBoundary>
        </div>
    );
}
