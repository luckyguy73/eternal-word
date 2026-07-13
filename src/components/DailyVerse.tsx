"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DailySelection } from "@/models/models";
import { getDailyWord, getSpecificVerse } from "@/providers/data/repository";
import { STORAGE_KEYS, getStorageItem, setStorageItem } from "@/lib/storage";
import { getTranslationInfo } from "@/models/translations";
import { useBible } from "@/context/BibleContext";

export default function DailyVerse() {
    const { translation: preferredTranslation, isInitialized } = useBible();
    const [daily, setDaily] = useState<DailySelection | null>(null);

    const fetchAndStoreVerse = useCallback(async (translation: string, existingVerse?: DailySelection) => {
        try {
            let newVerse: DailySelection;
            if (existingVerse) {
                // We already have a verse for today, just get it in the new translation
                newVerse = await getSpecificVerse(
                    translation,
                    existingVerse.bookId,
                    existingVerse.chapterNumber,
                    existingVerse.verseNumber
                );
            } else {
                // Brand new day, get a random verse
                newVerse = await getDailyWord(translation);
            }

            setStorageItem(STORAGE_KEYS.VERSE, newVerse);
            setStorageItem(STORAGE_KEYS.VERSE_TIMESTAMP, new Date().toISOString());
            setDaily(newVerse);
        } catch (error) {
            console.error("Failed to fetch daily verse:", error);
        }
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const storedVerse = getStorageItem<DailySelection | null>(STORAGE_KEYS.VERSE, null);
        const storedTimestamp = getStorageItem<string | null>(STORAGE_KEYS.VERSE_TIMESTAMP, null);

        if (storedVerse && storedTimestamp) {
            const timestamp = new Date(storedTimestamp);
            const now = new Date();

            // Check if the stored timestamp is from today
            const isToday =
                timestamp.getDate() === now.getDate() &&
                timestamp.getMonth() === now.getMonth() &&
                timestamp.getFullYear() === now.getFullYear();

            if (isToday) {
                if (storedVerse.translation === preferredTranslation) {
                    setDaily(storedVerse);
                } else {
                    // Translation changed, but it's still today. 
                    // Fetch the SAME verse but in the NEW translation.
                    fetchAndStoreVerse(preferredTranslation, storedVerse);
                }
            } else {
                // Not today anymore, fetch a brand new random verse
                fetchAndStoreVerse(preferredTranslation);
            }
        } else {
            // No stored verse at all
            fetchAndStoreVerse(preferredTranslation);
        }
    }, [isInitialized, preferredTranslation, fetchAndStoreVerse]);

    if (!daily) {
        return (
            <div className="flex-1 flex flex-col pt-[100px] px-8 pb-32">
                <div className="animate-pulse flex flex-col gap-4 w-full max-w-4xl mx-auto">
                    <div className="h-10 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    const currentTranslation = daily.translation;

    return (
        <main className="flex-1 flex flex-col pt-[100px] px-8 md:px-8 pb-32">
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                    {/* dangerouslySetInnerHTML renders the <i> tags from the API correctly */}
                    <div
                        className="text-3xl md:text-5xl font-serif leading-tight italic tracking-tight"
                        dangerouslySetInnerHTML={{ __html: `&ldquo;${daily.text}&rdquo;` }}
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
