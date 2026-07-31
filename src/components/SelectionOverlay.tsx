"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { BOOKS } from "@/models/metadata";
import { TRANSLATIONS_ARRAY } from "@/models/translations";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { Z_INDEX } from "@/constants/layout";

interface SelectionOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    currentBookId: number;
    currentChapter: number;
    currentTranslation: string;
}

type Tab = "book" | "chapter" | "translation";

export default function SelectionOverlay({
    isOpen,
    onClose,
    currentBookId,
    currentChapter,
    currentTranslation,
}: SelectionOverlayProps) {
    const router = useRouter();
    const { setTranslation } = useSettings();
    const dragControls = useDragControls();
    const [activeTab, setActiveTab] = useState<Tab>("book");
    const [selectedBook, setSelectedBook] = useState(currentBookId);
    
    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setSelectedBook(currentBookId);
            setActiveTab("book");
        }
    }, [isOpen, currentBookId]);

    const handleBookSelect = (bookId: number) => {
        setSelectedBook(bookId);
        setActiveTab("chapter");
    };

    const handleChapterSelect = (chapter: number) => {
        router.push(`/chapter/${selectedBook}/${chapter}?translation=${currentTranslation}`);
        onClose();
    };

    const handleTranslationSelect = (translation: string) => {
        setTranslation(translation);
        router.push(`/chapter/${currentBookId}/${currentChapter}?translation=${translation}`);
        onClose();
    };

    const currentBookChapters = BOOKS[selectedBook]?.chapters || 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        style={{ zIndex: Z_INDEX.NAV_BACKDROP }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="y"
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 500) {
                                onClose();
                            }
                        }}
                        className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
                        style={{ zIndex: Z_INDEX.NAV_DRAWER }}
                    >
                        {/* Drag Handle */}
                        <div 
                            className="w-full flex justify-center p-4 cursor-grab active:cursor-grabbing touch-none"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 border-b border-gray-800">
                            {(["book", "chapter", "translation"] as Tab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition-colors ${
                                        activeTab === tab ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-400"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === "book" && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {Object.values(BOOKS).map((book) => (
                                        <button
                                            key={book.id}
                                            onClick={() => handleBookSelect(book.id)}
                                            className={`p-4 rounded-xl border text-left transition-all ${
                                                selectedBook === book.id
                                                    ? "bg-orange-400/10 border-orange-400 text-orange-400"
                                                    : "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800"
                                            }`}
                                        >
                                            <span className="font-medium">{book.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === "chapter" && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                                    {Array.from({ length: currentBookChapters }, (_, i) => i + 1).map((chapter) => (
                                        <button
                                            key={chapter}
                                            onClick={() => handleChapterSelect(chapter)}
                                            className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${
                                                currentBookId === selectedBook && currentChapter === chapter
                                                    ? "bg-orange-400/10 border-orange-400 text-orange-400"
                                                    : "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800"
                                            }`}
                                        >
                                            <span className="text-lg font-medium">{chapter}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === "translation" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {TRANSLATIONS_ARRAY.map((t) => (
                                        <button
                                            key={t.slug}
                                            onClick={() => handleTranslationSelect(t.slug)}
                                            className={`p-4 rounded-xl border text-left transition-all ${
                                                currentTranslation === t.slug
                                                    ? "bg-orange-400/10 border-orange-400 text-orange-400"
                                                    : "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800"
                                            }`}
                                        >
                                            <div className="font-bold">{t.name}</div>
                                            <div className="text-xs text-gray-400 truncate">{t.fullName}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Safe Area Padding for Mobile */}
                        <div className="h-8 bg-gray-900" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
