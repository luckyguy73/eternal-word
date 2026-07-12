"use client";

import React from 'react';
import { useBible, PassageWithText } from "@/context/BibleContext";
import { useIsClient } from "@/hooks/useIsClient";
import Link from "next/link";
import { FaTrash, FaChevronRight, FaBookmark } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function SavedPage() {
    const isClient = useIsClient();
    const { 
        savedPassages: passages, 
        loadingPassages: loading, 
        translation: currentTranslation,
        toggleSavedVerse
    } = useBible();

    const removePassage = (passage: PassageWithText) => {
        // Remove all verses in this passage
        passage.verses.forEach((v) => {
            toggleSavedVerse(v);
        });
    };

    if (!isClient) return null;

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
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-500">Loading your passages...</p>
                    </div>
                ) : passages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
                            <FaBookmark className="text-gray-600" size={24} />
                        </div>
                        <h2 className="text-xl font-medium text-gray-300">No saved passages yet</h2>
                        <p className="text-gray-500 mt-2">Tap a verse number while reading to save it here.</p>
                        <Link 
                            href="/"
                            className="mt-6 px-6 py-2 bg-orange-400 text-black font-bold rounded-full hover:bg-orange-300 transition-colors"
                        >
                            Start Reading
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {passages.map((passage, index) => (
                                <motion.div
                                    key={`${passage.rangeLabel}-${currentTranslation}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Link 
                                                href={`/chapter/${passage.bookId}/${passage.chapterNumber}?translation=${currentTranslation}&verse=${passage.verses[0].verseNumber}`}
                                                className="flex items-center gap-2 group/title"
                                            >
                                                <h3 className="text-xl font-bold text-orange-400 group-hover/title:underline decoration-orange-400 underline-offset-4">
                                                    {passage.rangeLabel}
                                                </h3>
                                                <FaChevronRight className="text-gray-700 group-hover/title:text-orange-400 transition-colors" size={14} />
                                            </Link>

                                            <button 
                                                onClick={() => removePassage(passage)}
                                                className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                                                title="Remove passage"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>

                                        <Link 
                                            href={`/chapter/${passage.bookId}/${passage.chapterNumber}?translation=${currentTranslation}&verse=${passage.verses[0].verseNumber}`}
                                            className="block"
                                        >
                                            <div className="space-y-2">
                                                {passage.verses.map(v => (
                                                    <p key={v.verseNumber} className="text-gray-300 leading-relaxed">
                                                        <span className="text-xs text-gray-600 font-bold mr-2">{v.verseNumber}</span>
                                                        <span dangerouslySetInnerHTML={{ __html: v.text }} />
                                                    </p>
                                                ))}
                                            </div>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
