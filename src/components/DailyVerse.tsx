"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DailySelection } from "@/models/models";
import { getDailyWord, getSpecificVerse } from "@/providers/data/repository";

const STORAGE_KEYS = {
    VERSE: "daily_verse",
    TIMESTAMP: "daily_verse_timestamp",
    TRANSLATION: "daily_verse_translation",
    PREFERRED_TRANSLATION: "preferred_translation",
};

export default function DailyVerse() {
    const [daily, setDaily] = useState<DailySelection | null>(null);

    useEffect(() => {
        const fetchAndStoreVerse = async (translation: string, existingVerse?: DailySelection) => {
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

                localStorage.setItem(STORAGE_KEYS.VERSE, JSON.stringify(newVerse));
                localStorage.setItem(STORAGE_KEYS.TIMESTAMP, new Date().toISOString());
                localStorage.setItem(STORAGE_KEYS.TRANSLATION, translation);
                setDaily(newVerse);
            } catch (error) {
                console.error("Failed to fetch daily verse:", error);
            }
        };

        const preferredTranslation = localStorage.getItem(STORAGE_KEYS.PREFERRED_TRANSLATION) || "NKJV";
        const storedVerse = localStorage.getItem(STORAGE_KEYS.VERSE);
        const storedTimestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
        const storedTranslation = localStorage.getItem(STORAGE_KEYS.TRANSLATION);

        if (storedVerse && storedTimestamp) {
            const timestamp = new Date(storedTimestamp);
            const now = new Date();

            // Check if the stored timestamp is from today
            const isToday =
                timestamp.getDate() === now.getDate() &&
                timestamp.getMonth() === now.getMonth() &&
                timestamp.getFullYear() === now.getFullYear();

            if (isToday) {
                try {
                    const parsedVerse = JSON.parse(storedVerse);

                    if (storedTranslation === preferredTranslation) {
                        // Using a tiny delay to ensure the state update is not synchronous during the effects' execution.
                        // This resolves the IDE/React warning: "Calling setState synchronously within an effect can trigger cascading renders"
                        setTimeout(() => setDaily(parsedVerse), 0);
                    } else {
                        // Translation changed, but it's still today. 
                        // Fetch the SAME verse but in the NEW translation.
                        fetchAndStoreVerse(preferredTranslation, parsedVerse).then(r => console.log("Updated verse translation", r));
                    }
                } catch (e) {
                    console.error("Failed to parse stored verse", e);
                    fetchAndStoreVerse(preferredTranslation).then(r => console.log("Fetched new verse", r));
                }
            } else {
                // Not today anymore, fetch a brand new random verse
                fetchAndStoreVerse(preferredTranslation).then(r => console.log("Fetched new verse", r));
            }
        } else {
            // No stored verse at all
            fetchAndStoreVerse(preferredTranslation).then(r => console.log("Fetched new verse", r));
        }
    }, []);

    if (!daily) {
        return (
            <div className="flex-1 flex items-center justify-center p-4 md:p-6">
                <div className="animate-pulse flex flex-col gap-4 w-full max-w-4xl">
                    <div className="h-10 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
            <div className="max-w-4xl w-full flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                    {/* dangerouslySetInnerHTML renders the <i> tags from the API correctly */}
                    <div
                        className="text-2xl md:text-4xl font-serif leading-relaxed italic"
                        dangerouslySetInnerHTML={{ __html: `&ldquo;${daily.text}&rdquo;` }}
                    />

                    <div className="flex flex-col gap-1">
                        <p className="text-lg md:text-xl font-semibold text-gray-400">
                            <Link 
                                href={`/chapter/${daily.bookId}/${daily.chapterNumber}?temp=true&verse=${daily.verseNumber}&translation=${localStorage.getItem(STORAGE_KEYS.TRANSLATION) || "NKJV"}`}
                                className="hover:text-white transition-colors underline decoration-gray-600 underline-offset-4"
                            >
                                {daily.bookName} {daily.chapterNumber}:{daily.verseNumber}
                            </Link>
                        </p>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                            {localStorage.getItem(STORAGE_KEYS.TRANSLATION) || "NKJV"}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
