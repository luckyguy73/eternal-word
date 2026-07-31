"use client";

import React, { createContext, useContext, useEffect, useCallback, useMemo } from "react";
import { SavedVerse, SavedPassage } from "@/models/models";
import { STORAGE_KEYS } from "@/constants/bible";
import { usePersistentState } from "@/hooks/usePersistentState";
import { groupVersesIntoPassages, formatTag } from "@/lib/libraryService";
import { useSettings } from "./SettingsContext";
import { useTagManagement } from "@/hooks/useTagManagement";
import { useVerseCaching } from "@/hooks/useVerseCaching";

interface VerseWithText extends SavedVerse {
    text: string;
}

export interface PassageWithText extends Omit<SavedPassage, 'verses'> {
    verses: VerseWithText[];
}

interface LibraryContextType {
    savedVerses: SavedVerse[];
    toggleSavedVerse: (verse: SavedVerse) => void;
    removePassage: (passage: PassageWithText) => void;
    isVerseSaved: (bookId: number, chapterNumber: number, verseNumber: number) => boolean;
    savedPassages: PassageWithText[];
    loadingPassages: boolean;
    refreshPassages: () => Promise<void>;
    isInitialized: boolean;
    allTags: string[];
    addTagToPassage: (passage: PassageWithText, tag: string) => void;
    removeTagFromPassage: (passage: PassageWithText, tag: string) => void;
    deleteTagGlobal: (tag: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
    const { translation, isInitialized: settingsInitialized } = useSettings();
    const [savedVerses, setSavedVerses, isInitialized] = usePersistentState<SavedVerse[]>(
        STORAGE_KEYS.SAVED_VERSES, 
        []
    );

    const { 
        chapterCache, 
        loadingPassages, 
        refreshPassages 
    } = useVerseCaching(isInitialized, settingsInitialized, savedVerses, translation);

    const {
        allTags,
        addTagToPassage,
        removeTagFromPassage,
        deleteTagGlobal
    } = useTagManagement(savedVerses, setSavedVerses);

    // Migrate tags if needed after initialization
    useEffect(() => {
        if (isInitialized) {
            let changed = false;
            const formattedVerses = savedVerses.map(sv => {
                if (sv.tags) {
                    const uniqueTags = Array.from(new Set(sv.tags.map(formatTag)));
                    if (JSON.stringify(uniqueTags) !== JSON.stringify(sv.tags)) {
                        changed = true;
                        return { ...sv, tags: uniqueTags };
                    }
                }
                return sv;
            });
            if (changed) {
                setSavedVerses(formattedVerses);
            }
        }
    }, [isInitialized, setSavedVerses]); // Only run on mount-like sync

    const toggleSavedVerse = useCallback((verse: SavedVerse) => {
        setSavedVerses(prev => {
            const isSaved = prev.some(
                sv => sv.bookId === verse.bookId && 
                      sv.chapterNumber === verse.chapterNumber && 
                      sv.verseNumber === verse.verseNumber
            );

            if (isSaved) {
                return prev.filter(
                    sv => !(sv.bookId === verse.bookId && 
                            sv.chapterNumber === verse.chapterNumber && 
                            sv.verseNumber === verse.verseNumber)
                );
            } else {
                return [...prev, verse];
            }
        });
    }, [setSavedVerses]);

    const removePassage = useCallback((passage: PassageWithText) => {
        setSavedVerses(prev => {
            return prev.filter(sv => 
                !(sv.bookId === passage.bookId && 
                  sv.chapterNumber === passage.chapterNumber && 
                  passage.verses.some(pv => pv.verseNumber === sv.verseNumber))
            );
        });
    }, [setSavedVerses]);


    const isVerseSaved = useCallback((bookId: number, chapterNumber: number, verseNumber: number) => {
        return savedVerses.some(
            sv => sv.bookId === bookId && 
                  sv.chapterNumber === chapterNumber && 
                  sv.verseNumber === verseNumber
        );
    }, [savedVerses]);

    useEffect(() => {
        refreshPassages();
    }, [refreshPassages]);

    const savedPassages = useMemo(() => {
        const grouped = groupVersesIntoPassages(savedVerses);
        return grouped.map(p => {
            const cacheKey = `${p.bookId}-${p.chapterNumber}-${translation}`;
            const chapter = chapterCache[cacheKey];
            return {
                ...p,
                verses: p.verses.map(v => ({
                    ...v,
                    text: chapter?.verses.find(cv => cv.verseNumber === v.verseNumber)?.text || "..."
                }))
            };
        });
    }, [savedVerses, chapterCache, translation]);

    const value = useMemo(() => ({
        savedVerses,
        toggleSavedVerse,
        removePassage,
        isVerseSaved,
        savedPassages,
        loadingPassages,
        refreshPassages,
        isInitialized,
        allTags,
        addTagToPassage,
        removeTagFromPassage,
        deleteTagGlobal
    }), [savedVerses, toggleSavedVerse, removePassage, isVerseSaved, savedPassages, loadingPassages, refreshPassages, isInitialized, allTags, addTagToPassage, removeTagFromPassage, deleteTagGlobal]);

    return (
        <LibraryContext.Provider value={value}>
            {children}
        </LibraryContext.Provider>
    );
}

export function useLibrary() {
    const context = useContext(LibraryContext);
    if (context === undefined) {
        throw new Error("useLibrary must be used within a LibraryProvider");
    }
    return context;
}
