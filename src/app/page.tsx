"use client";

import DailyVerse from "@/components/DailyVerse";
import StreakCounter from "@/components/StreakCounter";
import { Z_INDEX } from "@/constants/layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
    return (
        <div className="flex h-dvh flex-col bg-black text-white overflow-hidden">
            {/* Header */}
            <header 
                className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 py-4 px-8 md:px-8"
                style={{ zIndex: Z_INDEX.OVERLAY_HEADER }}
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between relative">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter">
                        Eternal Word
                    </h1>

                    <StreakCounter className="static" />
                </div>
            </header>

            {/* Daily Verse Content */}
            <ErrorBoundary name="DailyVerse">
                <DailyVerse />
            </ErrorBoundary>
        </div>
    );
}
