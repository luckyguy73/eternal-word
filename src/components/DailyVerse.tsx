"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DailySelection } from "@/models/models";
import { getDailyWord } from "@/providers/data/repository";

const STORAGE_KEYS = {
    VERSE: "daily_verse",
    TIMESTAMP: "daily_verse_timestamp",
};

export default function DailyVerse() {
    const [daily, setDaily] = useState<DailySelection | null>(null);

    useEffect(() => {
        const fetchAndStoreVerse = async () => {
            try {
                const newVerse = await getDailyWord();
                localStorage.setItem(STORAGE_KEYS.VERSE, JSON.stringify(newVerse));
                localStorage.setItem(STORAGE_KEYS.TIMESTAMP, new Date().toISOString());
                setDaily(newVerse);
            } catch (error) {
                console.error("Failed to fetch daily verse:", error);
            }
        };

        const storedVerse = localStorage.getItem(STORAGE_KEYS.VERSE);
        const storedTimestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);

        if (storedVerse && storedTimestamp) {
            const timestamp = new Date(storedTimestamp);
            const now = new Date();

            // Check if stored timestamp is from today
            const isToday =
                timestamp.getDate() === now.getDate() &&
                timestamp.getMonth() === now.getMonth() &&
                timestamp.getFullYear() === now.getFullYear();

            if (isToday) {
                try {
                    setDaily(JSON.parse(storedVerse));
                } catch (e) {
                    console.error("Failed to parse stored verse", e);
                    fetchAndStoreVerse();
                }
            } else {
                fetchAndStoreVerse();
            }
        } else {
            fetchAndStoreVerse();
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

                    <p className="text-lg md:text-xl font-semibold text-gray-400">
                        <Link 
                            href={`/chapter/${daily.bookId}/${daily.chapterNumber}?temp=true`}
                            className="hover:text-white transition-colors underline decoration-gray-600 underline-offset-4"
                        >
                            {daily.bookName} {daily.chapterNumber}:{daily.verseNumber}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
