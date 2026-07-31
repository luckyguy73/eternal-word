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

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: React.ReactNode }) {
    const [translation, setTranslationState] = useState<string>("NKJV");
    const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [chapterCache, setChapterCache] = useState<Record<string, Chapter>>({});
    const [loadingPassages, setLoadingPassages] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const lastFetchedTranslation = useRef<string>("");
    const lastRequestId = useRef<number>(0);

    // Initial load from storage
    useEffect(() => {
        const storedTranslation = getStorageItem(STORAGE_KEYS.TRANSLATION, "NKJV");
        const storedVerses = getStorageItem<SavedVerse[]>(STORAGE_KEYS.SAVED_VERSES, []);
        const storedTags = getStorageItem<string[]>(STORAGE_KEYS.ALL_TAGS, []);
        
        setTranslationState(storedTranslation);
        setSavedVerses(storedVerses);
        setAllTags(storedTags);
        setIsInitialized(true);
    }, []);

    const setTranslation = useCallback((t: string) => {
        setTranslationState(t);
    }, []);

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
    }, []);

    const removePassage = useCallback((passage: PassageWithText) => {
        setSavedVerses(prev => {
            return prev.filter(sv => 
                !(sv.bookId === passage.bookId && 
                  sv.chapterNumber === passage.chapterNumber && 
                  passage.verses.some(pv => pv.verseNumber === sv.verseNumber))
            );
        });
    }, []);

    // Sync state to storage
    useEffect(() => {
        if (isInitialized) {
            setStorageItem(STORAGE_KEYS.TRANSLATION, translation);
        }
    }, [translation, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            setStorageItem(STORAGE_KEYS.SAVED_VERSES, savedVerses);
        }
    }, [savedVerses, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            setStorageItem(STORAGE_KEYS.ALL_TAGS, allTags);
        }
    }, [allTags, isInitialized]);

    const addTagToPassage = useCallback((passage: PassageWithText, tag: string) => {
        const normalizedTag = tag.trim();
        if (!normalizedTag) return;

        setSavedVerses(prev => prev.map(sv => {
            const isInPassage = sv.bookId === passage.bookId && 
                               sv.chapterNumber === passage.chapterNumber && 
                               passage.verses.some(pv => pv.verseNumber === sv.verseNumber);
            
            if (isInPassage) {
                const tags = sv.tags || [];
                if (!tags.includes(normalizedTag)) {
                    return { ...sv, tags: [...tags, normalizedTag] };
                }
            }
            return sv;
        }));

        setAllTags(prev => {
            if (!prev.includes(normalizedTag)) {
                return [...prev, normalizedTag].sort();
            }
            return prev;
        });
    }, []);

    const removeTagFromPassage = useCallback((passage: PassageWithText, tag: string) => {
        setSavedVerses(prev => prev.map(sv => {
            const isInPassage = sv.bookId === passage.bookId && 
                               sv.chapterNumber === passage.chapterNumber && 
                               passage.verses.some(pv => pv.verseNumber === sv.verseNumber);
            
            if (isInPassage && sv.tags) {
                return { ...sv, tags: sv.tags.filter(t => t !== tag) };
            }
            return sv;
        }));
    }, []);

    const deleteTagGlobal = useCallback((tag: string) => {
        setAllTags(prev => prev.filter(t => t !== tag));
        setSavedVerses(prev => prev.map(sv => {
            if (sv.tags) {
                return { ...sv, tags: sv.tags.filter(t => t !== tag) };
            }
            return sv;
        }));
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

        const requestId = ++lastRequestId.current;
        
        if (savedVerses.length === 0) {
            setLoadingPassages(false);
            return;
        }

        const grouped = groupVersesIntoPassages(savedVerses);
        const uniqueChapters = Array.from(new Set(grouped.map(p => `${p.bookId}-${p.chapterNumber}`)));
        
        // Find missing chapters in cache
        const missingChapters = uniqueChapters.filter(key => {
            const cacheKey = `${key}-${translation}`;
            return !chapterCache[cacheKey];
        });

        const translationChanged = lastFetchedTranslation.current !== translation;
        
        // If we're missing chapters or translation changed, show loading spinner
        // but only if we don't have enough to show something meaningful (optional)
        if (translationChanged || missingChapters.length > 0) {
            // Check if we have ANY data for the current selection
            const hasAnyData = grouped.some(p => chapterCache[`${p.bookId}-${p.chapterNumber}-${translation}`]);
            if (!hasAnyData || translationChanged) {
                setLoadingPassages(true);
            }
        } else {
            setLoadingPassages(false);
        }

        if (missingChapters.length === 0) {
            if (requestId === lastRequestId.current) {
                lastFetchedTranslation.current = translation;
            }
            return;
        }

        try {
            const fetchedChapters: Record<string, Chapter> = {};
            await Promise.all(missingChapters.map(async (key) => {
                const [bookId, chapterNumber] = key.split('-').map(Number);
                try {
                    const chapter = await getChapter(bookId, chapterNumber, translation);
                    fetchedChapters[`${key}-${translation}`] = chapter;
                } catch (e) {
                    console.error(`Failed to fetch chapter ${key}`, e);
                }
            }));

            // Check if this request is still relevant
            if (requestId !== lastRequestId.current) return;

            if (Object.keys(fetchedChapters).length > 0) {
                setChapterCache(prev => ({ ...prev, ...fetchedChapters }));
            }
            lastFetchedTranslation.current = translation;
        } catch (err) {
            console.error("Failed to fetch saved passages content:", err);
        } finally {
            if (requestId === lastRequestId.current) {
                setLoadingPassages(false);
            }
        }
    }, [isInitialized, savedVerses, translation, chapterCache]);

    // Update passages whenever verses or translation change
    useEffect(() => {
        refreshPassages();
    }, [refreshPassages]);

    // Derived state for saved passages with text
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

    // Memoize the context value to prevent unnecessary re-renders of consumers
    const value = useMemo(() => ({
        translation,
        setTranslation,
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
    }), [translation, setTranslation, savedVerses, toggleSavedVerse, removePassage, isVerseSaved, savedPassages, loadingPassages, refreshPassages, isInitialized, allTags, addTagToPassage, removeTagFromPassage, deleteTagGlobal]);

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
