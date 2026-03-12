"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TRANSLATIONS_ARRAY } from "@/models/translations";

interface TranslationSelectorProps {
    currentTranslation: string;
    bookId: number;
    chapterNumber: number;
}

const STORAGE_KEYS = {
    BOOK: "preferred_book",
    CHAPTER: "preferred_chapter",
    TRANSLATION: "preferred_translation",
};

export default function TranslationSelector({
    currentTranslation,
    bookId,
    chapterNumber,
}: TranslationSelectorProps) {
    const router = useRouter();
    const [selectedTranslation, setSelectedTranslation] = useState(currentTranslation);
    const [isClient, setIsClient] = useState(false);

    // Save current values to localStorage whenever they change
    useEffect(() => {
        if (isClient) {
            localStorage.setItem(STORAGE_KEYS.BOOK, bookId.toString());
            localStorage.setItem(STORAGE_KEYS.CHAPTER, chapterNumber.toString());
            localStorage.setItem(STORAGE_KEYS.TRANSLATION, currentTranslation);
        }
    }, [bookId, chapterNumber, currentTranslation, isClient]);

    // Load saved translation preference from localStorage on client mount
    useEffect(() => {
        setIsClient(true);
        const savedTranslation = localStorage.getItem(STORAGE_KEYS.TRANSLATION);
        if (savedTranslation && TRANSLATIONS_ARRAY.some(t => t.slug === savedTranslation)) {
            setSelectedTranslation(savedTranslation); // Restored
            // If the saved translation differs from the URL param, navigate to it
            if (savedTranslation !== currentTranslation) {
                router.replace(`/chapter/${bookId}/${chapterNumber}?translation=${savedTranslation}`);
            }
        }
    }, []);

    const handleTranslationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const translation = e.target.value;
        setSelectedTranslation(translation);
        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.TRANSLATION, translation);
        // Navigate with the new translation
        router.push(`/chapter/${bookId}/${chapterNumber}?translation=${translation}`);
    };

    // Don't render dropdown until client is ready to avoid hydration mismatch
    if (!isClient) {
        return <div className="h-8 w-40" />;
    }

    return (
        <select
            value={selectedTranslation}
            onChange={handleTranslationChange}
            className="px-3 py-1 bg-black border border-gray-700 rounded-lg text-white text-sm hover:border-gray-500 focus:outline-none focus:border-gray-400"
            title={`Current translation: ${selectedTranslation}`}
        >
            {TRANSLATIONS_ARRAY.map((translation) => (
                <option key={translation.slug} value={translation.slug}>
                    {translation.name}
                </option>
            ))}
        </select>
    );
}

