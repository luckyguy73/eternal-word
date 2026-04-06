"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { TRANSLATIONS_ARRAY, getTranslationInfo } from "@/models/translations";
import { STORAGE_KEYS, getStorageItem, setStorageItem } from "@/lib/storage";
import { useIsClient } from "@/hooks/useIsClient";

interface TranslationSelectorProps {
    currentTranslation: string;
    bookId: number;
    chapterNumber: number;
}

export default function TranslationSelector({
    currentTranslation,
    bookId,
    chapterNumber,
}: TranslationSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isClient = useIsClient();
    const [selectedTranslation, setSelectedTranslation] = useState(currentTranslation);

    // Save current values to localStorage whenever they change
    useEffect(() => {
        if (isClient && searchParams && searchParams.get("temp") !== "true") {
            setStorageItem(STORAGE_KEYS.BOOK, bookId.toString());
            setStorageItem(STORAGE_KEYS.CHAPTER, chapterNumber.toString());
            setStorageItem(STORAGE_KEYS.TRANSLATION, currentTranslation);
        }
    }, [bookId, chapterNumber, currentTranslation, isClient, searchParams]);

    // Load saved translation preference from localStorage on client mount
    useEffect(() => {
        if (!isClient) return;

        const savedTranslation = getStorageItem(STORAGE_KEYS.TRANSLATION, null);
        
        if (savedTranslation && (TRANSLATIONS_ARRAY.some(t => t.slug === savedTranslation) || TRANSLATIONS[savedTranslation])) {
            setSelectedTranslation(savedTranslation);
            // If the saved translation differs from the URL param, navigate to it
            if (savedTranslation !== currentTranslation) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("translation", savedTranslation);
                router.replace(`/chapter/${bookId}/${chapterNumber}?${params.toString()}`, { scroll: false });
            }
        }
    }, [isClient, bookId, chapterNumber, currentTranslation, router, searchParams]);

    const handleTranslationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const translation = e.target.value;
        setSelectedTranslation(translation);
        // Save to localStorage
        setStorageItem(STORAGE_KEYS.TRANSLATION, translation);
        
        // Navigate with the new translation, preserving other search params
        const params = new URLSearchParams(searchParams.toString());
        params.set("translation", translation);
        router.push(`/chapter/${bookId}/${chapterNumber}?${params.toString()}`);
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
            title={`Current translation: ${getTranslationInfo(selectedTranslation).fullName}`}
        >
            {TRANSLATIONS_ARRAY.map((translation) => (
                <option key={translation.slug} value={translation.slug}>
                    {translation.name}
                </option>
            ))}
        </select>
    );
}

