import { useCallback, useRef, useState } from "react";
import { Chapter, SavedVerse, Verse } from "@/models/models";
import { getBookInfo } from "@/models/metadata";
import { getTranslationInfo } from "@/models/translations";
import { BatchVerseRequestItem, getVersesBatch } from "@/providers/data/repository";

const MAX_CACHE_SIZE = 100;

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

        // Find missing verses for the current translation
        const missingVerses = savedVerses.filter(sv => {
            const cacheKey = `${sv.bookId}-${sv.chapterNumber}-${translation}`;
            const chapter = chapterCacheRef.current[cacheKey];
            if (!chapter) return true;
            return !chapter.verses.some(v => v.verseNumber === sv.verseNumber && Boolean(v.text));
        });

        const translationChanged = lastFetchedTranslation.current !== translation;
        
        if (translationChanged || missingVerses.length > 0) {
            const hasAnyData = savedVerses.some(sv => {
                const cacheKey = `${sv.bookId}-${sv.chapterNumber}-${translation}`;
                const chapter = chapterCacheRef.current[cacheKey];
                return chapter?.verses.some(v => v.verseNumber === sv.verseNumber && Boolean(v.text));
            });
            if (!hasAnyData || translationChanged) {
                setLoadingPassages(true);
            }
        } else {
            setLoadingPassages(false);
        }

        if (missingVerses.length === 0) {
            if (requestId === lastRequestId.current) {
                lastFetchedTranslation.current = translation;
                setLoadingPassages(false);
            }
            return;
        }

        // Group missing verses by book and chapter for batch API request
        const translationSlug = getTranslationInfo(translation).slug;
        const groupMap = new Map<string, { bookId: number; chapterNumber: number; verseNumbers: Set<number> }>();

        for (const verse of missingVerses) {
            const key = `${verse.bookId}-${verse.chapterNumber}`;
            const existing = groupMap.get(key);
            if (existing) {
                existing.verseNumbers.add(verse.verseNumber);
            } else {
                groupMap.set(key, {
                    bookId: verse.bookId,
                    chapterNumber: verse.chapterNumber,
                    verseNumbers: new Set([verse.verseNumber])
                });
            }
        }

        const batchRequests: BatchVerseRequestItem[] = Array.from(groupMap.values()).map(g => ({
            translation: translationSlug,
            book: g.bookId,
            chapter: g.chapterNumber,
            verses: Array.from(g.verseNumbers).sort((a, b) => a - b)
        }));

        try {
            // Send single batch HTTP request for all missing verses
            const fetchedVerses = await getVersesBatch(batchRequests);

            if (requestId !== lastRequestId.current) return;

            if (fetchedVerses.length > 0) {
                setChapterCache(prev => {
                    const newCache = { ...prev };
                    const updatedKeys: string[] = [];

                    for (const v of fetchedVerses) {
                        const bookInfo = getBookInfo(v.bookId);
                        const cacheKey = `${v.bookId}-${v.chapterNumber}-${translation}`;
                        if (!updatedKeys.includes(cacheKey)) {
                            updatedKeys.push(cacheKey);
                        }

                        const existingChapter = newCache[cacheKey];
                        const newVerse: Verse = {
                            pk: v.pk,
                            verseNumber: v.verseNumber,
                            text: v.text,
                            comment: v.comment
                        };

                        if (existingChapter) {
                            const verseIndex = existingChapter.verses.findIndex(ev => ev.verseNumber === v.verseNumber);
                            const updatedVerses = [...existingChapter.verses];
                            if (verseIndex >= 0) {
                                updatedVerses[verseIndex] = newVerse;
                            } else {
                                updatedVerses.push(newVerse);
                                updatedVerses.sort((a, b) => a.verseNumber - b.verseNumber);
                            }
                            newCache[cacheKey] = {
                                ...existingChapter,
                                verses: updatedVerses
                            };
                        } else {
                            newCache[cacheKey] = {
                                bookId: v.bookId,
                                bookName: bookInfo.name,
                                chapterNumber: v.chapterNumber,
                                translation: translationSlug,
                                verses: [newVerse]
                            };
                        }
                    }

                    // Update cache order
                    cacheOrder.current = [
                        ...cacheOrder.current.filter(k => !updatedKeys.includes(k)),
                        ...updatedKeys
                    ];

                    // Cap the cache size
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
            console.error("Failed to fetch saved passages content batch:", err);
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
