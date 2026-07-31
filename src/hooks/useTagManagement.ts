import { useCallback, useMemo } from "react";
import { SavedVerse } from "@/models/models";
import { PassageWithText } from "@/context/LibraryContext";
import { formatTag } from "@/lib/libraryService";

export function useTagManagement(
    savedVerses: SavedVerse[],
    setSavedVerses: (updater: (prev: SavedVerse[]) => SavedVerse[]) => void
) {
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        savedVerses.forEach(sv => {
            if (sv.tags) {
                sv.tags.forEach(t => tags.add(t));
            }
        });
        return Array.from(tags).sort();
    }, [savedVerses]);

    const addTagToPassage = useCallback((passage: PassageWithText, tag: string) => {
        const normalizedTag = formatTag(tag);
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
    }, [setSavedVerses]);

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
    }, [setSavedVerses]);

    const deleteTagGlobal = useCallback((tag: string) => {
        setSavedVerses(prev => prev.map(sv => {
            if (sv.tags) {
                return { ...sv, tags: sv.tags.filter(t => t !== tag) };
            }
            return sv;
        }));
    }, [setSavedVerses]);

    return {
        allTags,
        addTagToPassage,
        removeTagFromPassage,
        deleteTagGlobal
    };
}
