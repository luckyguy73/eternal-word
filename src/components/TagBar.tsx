"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import ConfirmDialog from './ConfirmDialog';

interface TagBarProps {
    tags: string[];
    selectedTag: string;
    onSelectTag: (tag: string) => void;
    onDeleteTag: (tag: string) => void;
    showNoTags?: boolean;
}

export default function TagBar({ tags, selectedTag, onSelectTag, onDeleteTag, showNoTags = true }: TagBarProps) {
    const allTags = ["All", ...(showNoTags ? ["No Tags"] : []), ...tags];
    const [hoveredTag, setHoveredTag] = useState<string | null>(null);
    const [deleteConfirmTag, setDeleteConfirmTag] = useState<string | null>(null);
    const [hasHover, setHasHover] = useState(true);

    useEffect(() => {
        setHasHover(window.matchMedia('(hover: hover)').matches);
    }, []);

    return (
        <div className="w-full overflow-x-auto no-scrollbar">
            <motion.div layout className="flex gap-2 min-w-max px-1">
                {allTags.map((tag) => {
                    const isSelected = selectedTag === tag;
                    const isDeletable = tag !== "All" && tag !== "No Tags";
                    const isHovered = hoveredTag === tag;
                    const showDelete = isDeletable && (isHovered || !hasHover);

                    return (
                        <motion.div
                            key={tag}
                            layout
                            onMouseEnter={() => setHoveredTag(tag)}
                            onMouseLeave={() => setHoveredTag(null)}
                            className={`relative flex items-center px-4 py-2 rounded-full border transition-colors cursor-pointer whitespace-nowrap text-sm font-medium ${
                                isSelected
                                    ? "bg-orange-400 border-orange-400 text-black"
                                    : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                            }`}
                            onClick={() => onSelectTag(tag)}
                        >
                            <motion.span layout>{tag}</motion.span>
                            
                            <AnimatePresence>
                                {showDelete && (
                                    <motion.button
                                        initial={hasHover ? { width: 0, opacity: 0, marginLeft: 0 } : { width: "auto", opacity: 0.7, marginLeft: 8 }}
                                        animate={{ width: "auto", opacity: 0.7, marginLeft: 8 }}
                                        exit={hasHover ? { width: 0, opacity: 0, marginLeft: 0 } : { width: "auto", opacity: 0.7, marginLeft: 8 }}
                                        whileHover={{ opacity: 1, scale: 1.1 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmTag(tag);
                                        }}
                                        className="p-0.5 rounded-full hover:bg-black/20 flex items-center justify-center overflow-hidden"
                                        title={`Delete tag "${tag}"`}
                                    >
                                        <FaTimes size={10} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </motion.div>

            <ConfirmDialog
                isOpen={!!deleteConfirmTag}
                title="Delete Tag"
                message={`Are you sure you want to delete the tag "${deleteConfirmTag}"? This will remove it from all verses.`}
                confirmLabel="Delete"
                isDestructive={true}
                onConfirm={() => {
                    if (deleteConfirmTag) {
                        onDeleteTag(deleteConfirmTag);
                        setDeleteConfirmTag(null);
                    }
                }}
                onCancel={() => setDeleteConfirmTag(null)}
            />
        </div>
    );
}
