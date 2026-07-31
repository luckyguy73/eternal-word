"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PassageWithText } from '@/context/BibleContext';
import { useLibrary } from '@/context/LibraryContext';
import Link from 'next/link';
import { FaTrash, FaChevronRight, FaPlus, FaTimes, FaTag } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from './ConfirmDialog';
import VerseText from './VerseText';

interface SavedPassageCardProps {
    passage: PassageWithText;
    currentTranslation: string;
    onSelectTag: (tag: string) => void;
    selectedTag: string;
}

export default function SavedPassageCard({ passage, currentTranslation, onSelectTag, selectedTag }: SavedPassageCardProps) {
    const { removePassage, addTagToPassage, removeTagFromPassage, allTags } = useLibrary();
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hoveredTag, setHoveredTag] = useState<string | null>(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [tagToRemove, setTagToRemove] = useState<string | null>(null);
    const [hasHover, setHasHover] = useState(true);

    useEffect(() => {
        setHasHover(window.matchMedia('(hover: hover)').matches);
    }, []);

    // Get unique tags for this passage
    const passageTags = Array.from(new Set(passage.verses.flatMap(v => v.tags || [])));

    useEffect(() => {
        if (isAddingTag && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAddingTag]);

    const handleAddTag = (tag: string) => {
        if (tag.trim()) {
            addTagToPassage(passage, tag.trim());
            setTagInput('');
            setIsAddingTag(false);
            setShowSuggestions(false);
        }
    };

    const suggestions = allTags.filter(t => 
        t.toLowerCase().includes(tagInput.toLowerCase()) && 
        !passageTags.includes(t)
    );

    return (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors group relative flex flex-col">
            <Link 
                href={`/chapter/${passage.bookId}/${passage.chapterNumber}?translation=${currentTranslation}&verse=${passage.verses[0].verseNumber}`}
                className="block p-6 pr-12 flex-1"
            >
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold text-orange-400">
                        {passage.rangeLabel}
                    </h3>
                    <FaChevronRight className="text-gray-700 group-hover:text-orange-400 transition-colors" size={14} />
                </div>

                <div className="space-y-2">
                    {passage.verses.map(v => (
                        <div key={v.verseNumber} className="text-gray-300 leading-relaxed flex items-start">
                            <span className="text-xs text-gray-600 font-bold mr-2 mt-1">{v.verseNumber}</span>
                            <VerseText tag="span" html={v.text} />
                        </div>
                    ))}
                </div>
            </Link>

            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowRemoveConfirm(true);
                }}
                className="absolute top-6 right-6 p-2 text-gray-600 hover:text-orange-400 transition-colors z-10"
                title="Remove passage"
            >
                <FaTrash size={16} />
            </button>

            <ConfirmDialog
                isOpen={showRemoveConfirm}
                title="Remove Passage"
                message={`Are you sure you want to remove "${passage.rangeLabel}" from your saved passages?`}
                confirmLabel="Remove"
                isDestructive={true}
                onConfirm={() => {
                    removePassage(passage);
                    setShowRemoveConfirm(false);
                }}
                onCancel={() => setShowRemoveConfirm(false)}
            />

            <ConfirmDialog
                isOpen={!!tagToRemove}
                title="Remove Tag"
                message={`Are you sure you want to remove the tag "${tagToRemove}" from this passage?`}
                confirmLabel="Remove"
                isDestructive={true}
                onConfirm={() => {
                    if (tagToRemove) {
                        removeTagFromPassage(passage, tagToRemove);
                        if (selectedTag === tagToRemove) {
                            onSelectTag("All");
                        }
                        setTagToRemove(null);
                    }
                }}
                onCancel={() => setTagToRemove(null)}
            />

            <div className="px-6 py-4 border-t border-gray-800 bg-black/20">
                <div className="flex flex-wrap items-center gap-2">
                    {passageTags.map(tag => (
                        <motion.span 
                            key={tag}
                            layout
                            onMouseEnter={() => setHoveredTag(tag)}
                            onMouseLeave={() => setHoveredTag(null)}
                            className="inline-flex items-center px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs font-medium text-gray-300 hover:border-orange-400/50 hover:text-orange-400 transition-colors cursor-pointer"
                            onClick={() => onSelectTag(tag)}
                        >
                            <FaTag size={8} className="opacity-50 mr-1.5" />
                            <motion.span layout>{tag}</motion.span>
                            <AnimatePresence>
                                {(hoveredTag === tag || !hasHover) && (
                                    <motion.button
                                        initial={hasHover ? { width: 0, opacity: 0, marginLeft: 0 } : { width: "auto", opacity: 0.7, marginLeft: 6 }}
                                        animate={{ width: "auto", opacity: 0.7, marginLeft: 6 }}
                                        exit={hasHover ? { width: 0, opacity: 0, marginLeft: 0 } : { width: "auto", opacity: 0.7, marginLeft: 6 }}
                                        whileHover={{ opacity: 1, scale: 1.1 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTagToRemove(tag);
                                        }}
                                        className="flex items-center justify-center overflow-hidden text-gray-500 hover:text-orange-400 transition-colors"
                                    >
                                        <FaTimes size={10} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.span>
                    ))}

                    {isAddingTag ? (
                        <div className="relative inline-block">
                            <input
                                ref={inputRef}
                                type="text"
                                value={tagInput}
                                onChange={(e) => {
                                    setTagInput(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTag(tagInput);
                                    if (e.key === 'Escape') setIsAddingTag(false);
                                }}
                                onBlur={() => {
                                    // Delay to allow clicking suggestions
                                    setTimeout(() => setShowSuggestions(false), 200);
                                }}
                                className="px-2 py-1 bg-black border border-orange-400/50 rounded-lg text-xs text-white focus:outline-none focus:border-orange-400 w-24 transition-all"
                                placeholder="Tag name..."
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute bottom-full mb-2 left-0 w-32 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-20 overflow-hidden">
                                    {suggestions.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleAddTag(s)}
                                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800 last:border-0"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingTag(true)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-900/50 border border-gray-800 border-dashed rounded-lg text-xs font-medium text-gray-500 hover:border-gray-600 hover:text-gray-300 transition-all"
                        >
                            <FaPlus size={8} />
                            Add Tag
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
