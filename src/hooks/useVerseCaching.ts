import { useCallback, useRef, useState } from "react";
import { Chapter, SavedVerse } from "@/models/models";
import { getChapter } from "@/providers/data/repository";
import { groupVersesIntoPassages } from "@/lib/libraryService";

const MAX_CACHE_SIZE = 20;

export function useVerseCaching(
    isInitialized: boolean,
    settingsInitialized: boolean,
    savedVerses: SavedVerse[],
    translation: string
) {
    const [chapterCache, setChapterCache] = useState<Record<string, Chapter>>({});
    const chapterCacheRef = useRef(chapterCache);
    chapterCacheRef.current = chapterCache;
    const cacheOrder = useRef<string[]>([]);
    const [loadingPassages, setLoadingPassages] = useState(true);
    const lastFetchedTranslation = useRef<string>("");
    const lastRequestId = useRef<number>(0);

    const refreshPassages = useCallback(async () => {
        if (!isInitialized || !settingsInitialized) return;

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
            return !chapterCacheRef.current[cacheKey];
        });

        const translationChanged = lastFetchedTranslation.current !== translation;
        
        if (translationChanged || missingChapters.length > 0) {
            const hasAnyData = grouped.some(p => chapterCacheRef.current[`${p.bookId}-${p.chapterNumber}-${translation}`]);
            if (!hasAnyData || translationChanged) {
                setLoadingPassages(true);
            }
        } else {
            setLoadingPassages(false);
        }

        if (missingChapters.length === 0) {
            if (requestId === lastRequestId.current) {
                lastFetchedTranslation.current = translation;
                setLoadingPassages(false);
            }
            return;
        }

        try {
            const fetchedChapters: Record<string, Chapter> = {};
            await Promise.all(missingChapters.map(async (key) => {
                const [bookId, chapterNumber] = key.split('-').map(Number);
                try {
                    fetchedChapters[`${key}-${translation}`] = await getChapter(bookId, chapterNumber, translation);
                } catch (e) {
                    console.error(`Failed to fetch chapter ${key}`, e);
                }
            }));

            if (requestId !== lastRequestId.current) return;

            if (Object.keys(fetchedChapters).length > 0) {
                setChapterCache(prev => {
                    const newCache = { ...prev, ...fetchedChapters };
                    const newKeys = Object.keys(fetchedChapters);
                    
                    // Update cache order
                    cacheOrder.current = [
                        ...cacheOrder.current.filter(k => !newKeys.includes(k)),
                        ...newKeys
                    ];

                    // Cap the cache
                    if (cacheOrder.current.length > MAX_CACHE_SIZE) {
                        const keysToRemove = cacheOrder.current.slice(0, cacheOrder.current.length - MAX_CACHE_SIZE);
                        keysToRemove.forEach(k => delete newCache[k]);
                        cacheOrder.current = cacheOrder.current.slice(keysToRemove.length);
                    }

                    return newCache;
                });
            }
            lastFetchedTranslation.current = translation;
        } catch (err) {
            console.error("Failed to fetch saved passages content:", err);
        } finally {
            if (requestId === lastRequestId.current) {
                setLoadingPassages(false);
            }
        }
    }, [isInitialized, settingsInitialized, savedVerses, translation]);

    return {
        chapterCache,
        loadingPassages,
        refreshPassages
    };
}
