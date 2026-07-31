"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DailySelection } from "@/models/models";
import { getDailyWord, getSpecificVerse } from "@/providers/data/repository";
import { STORAGE_KEYS } from "@/constants/bible";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useSettings } from "./SettingsContext";
import { getTranslationInfo } from "@/models/translations";

interface DailyVerseContextType {
    dailyVerse: DailySelection | null;
    isLoading: boolean;
    refreshDailyVerse: () => Promise<void>;
}

const DailyVerseContext = createContext<DailyVerseContextType | undefined>(undefined);

interface DailyVerseState {
    verse: DailySelection | null;
    timestamp: string | null;
}

export function DailyVerseProvider({ children }: { children: React.ReactNode }) {
    const { translation, isInitialized: settingsInitialized } = useSettings();
    const [dailyState, setDailyState, isInitialized] = usePersistentState<DailyVerseState>(
        STORAGE_KEYS.VERSE,
        { verse: null, timestamp: null }
    );
    
    const [isLoading, setIsLoading] = useState(true);
    const lastProcessedTranslation = useRef<string>("");
    const isFetching = useRef<boolean>(false);

    const fetchAndStoreVerse = useCallback(async (targetTranslation: string, existingVerse?: DailySelection) => {
        if (isFetching.current) return;
        isFetching.current = true;
        setIsLoading(true);
        try {
            let newVerse: DailySelection;
            if (existingVerse) {
                newVerse = await getSpecificVerse(
                    targetTranslation,
                    existingVerse.bookId,
                    existingVerse.chapterNumber,
                    existingVerse.verseNumber
                );
            } else {
                newVerse = await getDailyWord(targetTranslation);
            }

            setDailyState({
                verse: newVerse,
                timestamp: new Date().toISOString()
            });
            lastProcessedTranslation.current = targetTranslation;
        } catch (error) {
            console.error("Failed to fetch daily verse:", error);
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [setDailyState]);

    const refreshDailyVerse = useCallback(async () => {
        if (!isInitialized || !settingsInitialized) return;

        const { verse, timestamp } = dailyState;
        const now = new Date();
        const storedTimestamp = timestamp ? new Date(timestamp) : null;

        const isToday = storedTimestamp &&
            storedTimestamp.getDate() === now.getDate() &&
            storedTimestamp.getMonth() === now.getMonth() &&
            storedTimestamp.getFullYear() === now.getFullYear();

        const currentTranslationSlug = getTranslationInfo(translation).slug;
        const verseTranslationSlug = verse ? getTranslationInfo(verse.translation).slug : "";

        // If it's today and we have a verse, check if translation matches
        if (isToday && verse) {
            if (verseTranslationSlug !== currentTranslationSlug || lastProcessedTranslation.current !== currentTranslationSlug) {
                await fetchAndStoreVerse(currentTranslationSlug, verse);
            } else {
                setIsLoading(false);
                lastProcessedTranslation.current = currentTranslationSlug;
            }
        } else {
            // New day or no verse, fetch fresh random word for the current translation
            await fetchAndStoreVerse(currentTranslationSlug);
        }
    }, [isInitialized, settingsInitialized, dailyState, translation, fetchAndStoreVerse]);

    useEffect(() => {
        // Only trigger if settings and daily state are ready
        if (isInitialized && settingsInitialized) {
            refreshDailyVerse();
        }
    }, [refreshDailyVerse, isInitialized, settingsInitialized]);

    const value = useMemo(() => ({
        dailyVerse: dailyState.verse,
        isLoading,
        refreshDailyVerse
    }), [dailyState.verse, isLoading, refreshDailyVerse]);

    return (
        <DailyVerseContext.Provider value={value}>
            {children}
        </DailyVerseContext.Provider>
    );
}

export function useDailyVerse() {
    const context = useContext(DailyVerseContext);
    if (context === undefined) {
        throw new Error("useDailyVerse must be used within a DailyVerseProvider");
    }
    return context;
}
