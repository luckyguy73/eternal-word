"use client";

import React, { useEffect, useState } from 'react';
import { useBible, PassageWithText } from "@/context/BibleContext";
import { STORAGE_KEYS, getStorageItem } from "@/lib/storage";
import Link from "next/link";
import { FaTrash, FaChevronRight, FaBookmark, FaTag } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import TagBar from '@/components/TagBar';
import SavedPassageCard from '@/components/SavedPassageCard';

export default function SavedPage() {
    const { 
        savedPassages: passages, 
        loadingPassages: loading, 
        isInitialized,
        translation: currentTranslation,
        removePassage: removePassageFromContext,
        allTags,
        deleteTagGlobal
    } = useBible();
    const [selectedTag, setSelectedTag] = useState("All");
    const [lastRead, setLastRead] = useState({ bookId: 1, chapter: 1 });

    // Reset filter if the selected tag no longer exists or returns no results
    useEffect(() => {
        if (!isInitialized) return;

        // 1. If tag no longer exists in global list
        const tagExists = selectedTag === "All" || selectedTag === "No Tags" || allTags.includes(selectedTag);
        if (!tagExists) {
            setSelectedTag("All");
            return;
        }

        // 2. If tag returns no results (and we have passages)
        if (passages.length > 0 && selectedTag !== "All") {
            const hasMatches = passages.some(passage => {
                if (selectedTag === "No Tags") {
                    return passage.verses.every(v => !v.tags || v.tags.length === 0);
                }
                return passage.verses.some(v => v.tags?.includes(selectedTag));
            });

            if (!hasMatches) {
                setSelectedTag("All");
            }
        }
    }, [allTags, selectedTag, isInitialized, passages]);

    useEffect(() => {
        if (!isInitialized) return;

        const bookId = parseInt(getStorageItem(STORAGE_KEYS.BOOK, "1"), 10);
        const chapter = parseInt(getStorageItem(STORAGE_KEYS.CHAPTER, "1"), 10);

        setLastRead({ bookId, chapter });
    }, [isInitialized]);

    const filteredPassages = passages.filter(passage => {
        if (selectedTag === "All") return true;
        if (selectedTag === "No Tags") {
            return passage.verses.every(v => !v.tags || v.tags.length === 0);
        }
        return passage.verses.some(v => v.tags?.includes(selectedTag));
    });

    return (
        <div className="flex min-h-screen flex-col bg-black text-white px-8 pt-8 pb-32">
            <header className="mb-6 max-w-6xl mx-auto w-full">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-4xl font-bold tracking-tight">Saved</h1>
                    <div className="text-right">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                            {currentTranslation}
                        </span>
                    </div>
                </div>
                <p className="text-gray-400 mb-6">Your collection of meaningful passages.</p>
                
                {isInitialized && passages.length > 0 && (
                    <TagBar 
                        tags={allTags} 
                        selectedTag={selectedTag} 
                        onSelectTag={setSelectedTag} 
                        onDeleteTag={(tag) => {
                            deleteTagGlobal(tag);
                            if (selectedTag === tag) {
                                setSelectedTag("All");
                            }
                        }}
                    />
                )}
            </header>

            <main className="max-w-6xl mx-auto w-full flex-1">
                <AnimatePresence mode="popLayout" initial={false}>
                    {!isInitialized || loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-gray-500">Loading your passages...</p>
                        </motion.div>
                    ) : passages.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
                                <FaBookmark className="text-gray-600" size={24} />
                            </div>
                            <h2 className="text-xl font-medium text-gray-300">No saved passages yet</h2>
                            <p className="text-gray-500 mt-2">Tap a verse number while reading to save it here.</p>
                            <Link 
                                href={`/chapter/${lastRead.bookId}/${lastRead.chapter}?translation=${currentTranslation}`}
                                className="mt-6 px-6 py-2 bg-orange-400 text-black font-bold rounded-full hover:bg-orange-300 transition-colors"
                            >
                                Start Reading
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid gap-6"
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {filteredPassages.map((passage, index) => (
                                    <motion.div
                                        key={`${passage.bookId}-${passage.chapterNumber}-${passage.verses[0].verseNumber}-${passage.verses.length}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ 
                                            duration: 0.2,
                                            // Stagger only on first mount or new items, but avoid delaying exit
                                            delay: index * 0.03
                                        }}
                                        style={{ 
                                            willChange: "transform, opacity",
                                            backfaceVisibility: "hidden" 
                                        }}
                                    >
                                        <SavedPassageCard 
                                            passage={passage} 
                                            currentTranslation={currentTranslation} 
                                            onSelectTag={setSelectedTag}
                                            selectedTag={selectedTag}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
