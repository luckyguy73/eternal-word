"use client";

import React, { useEffect, useState } from 'react';
import { useBible, PassageWithText } from "@/context/BibleContext";
import { STORAGE_KEYS, getStorageItem } from "@/lib/storage";
import Link from "next/link";
import { FaTrash, FaChevronRight, FaBookmark } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function SavedPage() {
    const { 
        savedPassages: passages, 
        loadingPassages: loading, 
        isInitialized,
        translation: currentTranslation,
        removePassage: removePassageFromContext
    } = useBible();
    const [lastRead, setLastRead] = useState({ bookId: 1, chapter: 1 });

    useEffect(() => {
        if (!isInitialized) return;

        const bookId = parseInt(getStorageItem(STORAGE_KEYS.BOOK, "1"), 10);
        const chapter = parseInt(getStorageItem(STORAGE_KEYS.CHAPTER, "1"), 10);

        setLastRead({ bookId, chapter });
    }, [isInitialized]);

    const removePassage = (passage: PassageWithText) => {
        removePassageFromContext(passage);
    };

    return (
        <div className="flex min-h-screen flex-col bg-black text-white px-8 pt-8 pb-32">
            <header className="mb-8 max-w-6xl mx-auto w-full">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-4xl font-bold tracking-tight">Saved</h1>
                    <div className="text-right">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                            {currentTranslation}
                        </span>
                    </div>
                </div>
                <p className="text-gray-400">Your collection of meaningful passages.</p>
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
                                {passages.map((passage, index) => (
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
                                        className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors group relative"
                                        style={{ 
                                            willChange: "transform, opacity",
                                            backfaceVisibility: "hidden" 
                                        }}
                                    >
                                    <Link 
                                        href={`/chapter/${passage.bookId}/${passage.chapterNumber}?translation=${currentTranslation}&verse=${passage.verses[0].verseNumber}`}
                                        className="block p-6 pr-12"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <h3 className="text-xl font-bold text-orange-400">
                                                {passage.rangeLabel}
                                            </h3>
                                            <FaChevronRight className="text-gray-700 group-hover:text-orange-400 transition-colors" size={14} />
                                        </div>

                                        <div className="space-y-2">
                                            {passage.verses.map(v => (
                                                <p key={v.verseNumber} className="text-gray-300 leading-relaxed">
                                                    <span className="text-xs text-gray-600 font-bold mr-2">{v.verseNumber}</span>
                                                    <span dangerouslySetInnerHTML={{ __html: v.text }} />
                                                </p>
                                            ))}
                                        </div>
                                    </Link>

                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removePassage(passage);
                                        }}
                                        className="absolute top-6 right-6 p-2 text-gray-600 hover:text-red-400 transition-colors z-10"
                                        title="Remove passage"
                                    >
                                        <FaTrash size={16} />
                                    </button>
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
