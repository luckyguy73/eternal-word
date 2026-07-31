"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { BOOKS } from "@/models/metadata";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { Z_INDEX } from "@/constants/layout";
import BookGrid from "./BookGrid";
import ChapterGrid from "./ChapterGrid";
import TranslationGrid from "./TranslationGrid";

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
                                <BookGrid
                                    selectedBookId={selectedBook}
                                    onBookSelect={handleBookSelect}
                                />
                            )}

                            {activeTab === "chapter" && (
                                <ChapterGrid
                                    totalChapters={currentBookChapters}
                                    currentBookId={currentBookId}
                                    selectedBookId={selectedBook}
                                    currentChapter={currentChapter}
                                    onChapterSelect={handleChapterSelect}
                                />
                            )}

                            {activeTab === "translation" && (
                                <TranslationGrid
                                    currentTranslation={currentTranslation}
                                    onTranslationSelect={handleTranslationSelect}
                                />
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
