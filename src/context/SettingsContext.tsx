"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { DEFAULT_TRANSLATION, STORAGE_KEYS } from "@/constants/bible";
import { usePersistentState } from "@/hooks/usePersistentState";

interface SettingsContextType {
    translation: string;
    setTranslation: (t: string) => void;
    lastRead: { bookId: number; chapter: number };
    setLastRead: (bookId: number, chapter: number) => void;
    isInitialized: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [translation, setTranslation, translationInitialized] = usePersistentState<string>(
        STORAGE_KEYS.TRANSLATION, 
        DEFAULT_TRANSLATION
    );

    const [lastReadBook, setLastReadBook, bookInitialized] = usePersistentState<string>(
        STORAGE_KEYS.BOOK,
        "1"
    );

    const [lastReadChapter, setLastReadChapter, chapterInitialized] = usePersistentState<string>(
        STORAGE_KEYS.CHAPTER,
        "1"
    );

    const setLastRead = useCallback((bookId: number, chapter: number) => {
        setLastReadBook(bookId.toString());
        setLastReadChapter(chapter.toString());
    }, [setLastReadBook, setLastReadChapter]);

    const isInitialized = translationInitialized && bookInitialized && chapterInitialized;

    const value = useMemo(() => ({
        translation,
        setTranslation,
        lastRead: {
            bookId: parseInt(lastReadBook, 10),
            chapter: parseInt(lastReadChapter, 10)
        },
        setLastRead,
        isInitialized
    }), [translation, setTranslation, lastReadBook, lastReadChapter, setLastRead, isInitialized]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
