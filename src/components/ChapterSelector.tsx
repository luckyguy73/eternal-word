"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BOOKS } from "@/models/metadata";

interface ChapterSelectorProps {
    currentBookId: number;
    currentChapter: number;
}

const STORAGE_KEYS = {
    BOOK: "preferred_book",
    CHAPTER: "preferred_chapter",
    TRANSLATION: "preferred_translation",
};

export default function ChapterSelector({ currentBookId, currentChapter }: ChapterSelectorProps) {
    const router = useRouter();
    const [selectedBook, setSelectedBook] = useState<number>(currentBookId);
    const [selectedChapter, setSelectedChapter] = useState<number | "">(currentChapter);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.BOOK, currentBookId.toString());
        localStorage.setItem(STORAGE_KEYS.CHAPTER, currentChapter.toString());
    }, [currentBookId, currentChapter]);

    const currentBookChapters = BOOKS[selectedBook]?.chapters || 1;

    const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bookId = parseInt(e.target.value, 10);
        setSelectedBook(bookId);
        setSelectedChapter(""); // Reset chapter to placeholder
    };

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const chapter = parseInt(e.target.value, 10);
        setSelectedChapter(chapter);
        
        // Get current translation from URL if possible, or fallback to saved
        const urlParams = new URLSearchParams(window.location.search);
        const currentTranslation = urlParams.get("translation") || 
                                   localStorage.getItem(STORAGE_KEYS.TRANSLATION) || 
                                   "NKJV";

        // Navigate when chapter is selected
        router.push(`/chapter/${selectedBook}/${chapter}?translation=${currentTranslation}`);
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

