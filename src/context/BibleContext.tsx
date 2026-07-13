"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { SavedVerse, SavedPassage, Chapter } from "@/models/models";
import { STORAGE_KEYS, getStorageItem, setStorageItem } from "@/lib/storage";
import { groupVersesIntoPassages } from "@/lib/verseUtils";
import { getChapter } from "@/providers/data/repository";

interface VerseWithText extends SavedVerse {
    text: string;
}

export interface PassageWithText extends Omit<SavedPassage, 'verses'> {
    verses: VerseWithText[];
}

interface BibleContextType {
    translation: string;
    setTranslation: (t: string) => void;
    savedVerses: SavedVerse[];
    toggleSavedVerse: (verse: SavedVerse) => void;
    isVerseSaved: (bookId: number, chapterNumber: number, verseNumber: number) => boolean;
    savedPassages: PassageWithText[];
    loadingPassages: boolean;
    refreshPassages: () => Promise<void>;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: React.ReactNode }) {
    const [translation, setTranslationState] = useState<string>("NKJV");
    const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
    const [savedPassages, setSavedPassages] = useState<PassageWithText[]>([]);
    const [loadingPassages, setLoadingPassages] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const lastFetchedTranslation = useRef<string>("");

    // Initial load from storage
    useEffect(() => {
        const storedTranslation = getStorageItem(STORAGE_KEYS.TRANSLATION, "NKJV");
        const storedVerses = getStorageItem<SavedVerse[]>(STORAGE_KEYS.SAVED_VERSES, []);
        
        setTranslationState(storedTranslation);
        setSavedVerses(storedVerses);
        setIsInitialized(true);
    }, []);

    const setTranslation = useCallback((t: string) => {
        setTranslationState(t);
        setStorageItem(STORAGE_KEYS.TRANSLATION, t);
    }, []);

    const toggleSavedVerse = useCallback((verse: SavedVerse) => {
        setSavedVerses(prev => {
            const isSaved = prev.some(
                sv => sv.bookId === verse.bookId && 
                      sv.chapterNumber === verse.chapterNumber && 
                      sv.verseNumber === verse.verseNumber
            );

            let next: SavedVerse[];
            if (isSaved) {
                next = prev.filter(
                    sv => !(sv.bookId === verse.bookId && 
                            sv.chapterNumber === verse.chapterNumber && 
                            sv.verseNumber === verse.verseNumber)
                );
            } else {
                next = [...prev, verse];
            }
            setStorageItem(STORAGE_KEYS.SAVED_VERSES, next);
            return next;
        });
    }, []);

    const isVerseSaved = useCallback((bookId: number, chapterNumber: number, verseNumber: number) => {
        return savedVerses.some(
            sv => sv.bookId === bookId && 
                  sv.chapterNumber === chapterNumber && 
                  sv.verseNumber === verseNumber
        );
    }, [savedVerses]);

    const refreshPassages = useCallback(async () => {
        if (!isInitialized) return;
        
        if (savedVerses.length === 0) {
            setSavedPassages([]);
            setLoadingPassages(false);
            return;
        }

        // Only show loading spinner if we don't have any passages yet or if translation changed
        const translationChanged = lastFetchedTranslation.current !== translation;
        if (savedPassages.length === 0 || translationChanged) {
            setLoadingPassages(true);
        }
        
        const grouped = groupVersesIntoPassages(savedVerses);
        
        const uniqueChapters = Array.from(new Set(grouped.map(p => `${p.bookId}-${p.chapterNumber}`)));
        const chapterMap: Record<string, Chapter> = {};

        try {
            await Promise.all(uniqueChapters.map(async (key) => {
                const [bookId, chapterNumber] = key.split('-').map(Number);
                try {
                    const chapter = await getChapter(bookId, chapterNumber, translation);
                    chapterMap[key] = chapter;
                } catch (e) {
                    console.error(`Failed to fetch chapter ${key}`, e);
                }
            }));

            const passagesWithText: PassageWithText[] = grouped.map(p => {
                const chapter = chapterMap[`${p.bookId}-${p.chapterNumber}`];
                return {
                    ...p,
                    verses: p.verses.map(v => ({
                        ...v,
                        text: chapter?.verses.find(cv => cv.verseNumber === v.verseNumber)?.text || "..."
                    }))
                };
            });
            setSavedPassages(passagesWithText);
            lastFetchedTranslation.current = translation;
        } catch (err) {
            console.error("Failed to fetch saved passages content:", err);
        } finally {
            setLoadingPassages(false);
        }
    }, [isInitialized, savedVerses, translation]);

    // Update passages whenever verses or translation change
    useEffect(() => {
        refreshPassages();
    }, [refreshPassages]);

    // Memoize the context value to prevent unnecessary re-renders of consumers
    const value = useMemo(() => ({
        translation,
        setTranslation,
        savedVerses,
        toggleSavedVerse,
        isVerseSaved,
        savedPassages,
        loadingPassages,
        refreshPassages
    }), [translation, setTranslation, savedVerses, toggleSavedVerse, isVerseSaved, savedPassages, loadingPassages, refreshPassages]);

    return (
        <BibleContext.Provider value={value}>
            {children}
        </BibleContext.Provider>
    );
}

export function useBible() {
    const context = useContext(BibleContext);
    if (context === undefined) {
        throw new Error("useBible must be used within a BibleProvider");
    }
    return context;
}
