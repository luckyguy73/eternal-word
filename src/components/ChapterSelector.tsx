"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { BOOKS } from "@/models/metadata";
import { STORAGE_KEYS, setStorageItem, getStorageItem } from "@/lib/storage";

interface ChapterSelectorProps {
    currentBookId: number;
    currentChapter: number;
}

export default function ChapterSelector({ currentBookId, currentChapter }: ChapterSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedBook, setSelectedBook] = useState<number>(currentBookId);
    const [selectedChapter, setSelectedChapter] = useState<number | "">(currentChapter);

    useEffect(() => {
        // Only save as preference if not a temporary view
        if (searchParams && searchParams.get("temp") !== "true") {
            setStorageItem(STORAGE_KEYS.BOOK, currentBookId.toString());
            setStorageItem(STORAGE_KEYS.CHAPTER, currentChapter.toString());
        }
    }, [currentBookId, currentChapter, searchParams]);

    const currentBookChapters = BOOKS[selectedBook]?.chapters || 1;

    const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bookId = parseInt(e.target.value, 10);
        setSelectedBook(bookId);
        setSelectedChapter(""); // Reset chapter to placeholder
    };

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const chapterNum = parseInt(e.target.value, 10);
        setSelectedChapter(chapterNum);
        
        // Get current translation from URL if possible, or fallback to saved
        const currentTranslation = searchParams.get("translation") || 
                                   getStorageItem(STORAGE_KEYS.TRANSLATION, "NKJV");

        // Navigate when chapter is selected
        const isTemp = searchParams.get("temp") === "true";
        router.push(`/chapter/${selectedBook}/${chapterNum}?translation=${currentTranslation}${isTemp ? "&temp=true" : ""}`);
    };

    return (
        <div className="flex gap-3">
            {/* Book Dropdown */}
            <select
                value={selectedBook}
                onChange={handleBookChange}
                className="px-3 py-1 bg-black border border-gray-700 rounded-lg text-white text-sm hover:border-gray-500 focus:outline-none focus:border-gray-400"
            >
                {Object.values(BOOKS).map((book) => (
                    <option key={book.id} value={book.id}>
                        {book.name}
                    </option>
                ))}
            </select>

            {/* Chapter Dropdown */}
            <select
                value={selectedChapter}
                onChange={handleChapterChange}
                className="px-3 py-1 bg-black border border-gray-700 rounded-lg text-white text-sm hover:border-gray-500 focus:outline-none focus:border-gray-400"
            >
                <option value="">Select Chapter</option>
                {Array.from({ length: currentBookChapters }, (_, i) => i + 1).map((chapter) => (
                    <option key={chapter} value={chapter}>
                        Chapter {chapter}
                    </option>
                ))}
            </select>
        </div>
    );
}

