"use client";

import React from "react";
import Link from "next/link";
import { getTranslationInfo } from "@/models/translations";
import { useDailyVerse } from "@/context/DailyVerseContext";
import VerseText from "./VerseText";

export default function DailyVerse() {
    const { dailyVerse: daily, isLoading } = useDailyVerse();

    if (isLoading || !daily) {
        return (
            <div className="flex-1 flex flex-col pt-16 px-8 pb-32">
                <div className="animate-pulse flex flex-col gap-4 w-full max-w-4xl mx-auto">
                    <div className="h-10 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    const currentTranslation = daily.translation;

    return (
        <main className="flex-1 flex flex-col pt-16 px-8 md:px-8 pb-32">
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                    {/* VerseText renders the <i> tags from the API correctly */}
                    <VerseText
                        className="text-3xl md:text-5xl font-serif leading-tight italic tracking-tight"
                        html={`&ldquo;${daily.text}&rdquo;`}
                    />

                    <div className="flex flex-col gap-2">
                        <p className="text-xl md:text-2xl font-bold text-gray-400">
                            <Link 
                                href={`/chapter/${daily.bookId}/${daily.chapterNumber}?temp=true&verse=${daily.verseNumber}&translation=${currentTranslation}`}
                                className="hover:text-white transition-colors underline decoration-gray-700 underline-offset-8"
                            >
                                {daily.bookName} {daily.chapterNumber}:{daily.verseNumber}
                            </Link>
                        </p>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">
                            {getTranslationInfo(currentTranslation).name}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
