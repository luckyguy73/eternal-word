"use client";

import React, { useState } from 'react';
import { FaTag, FaTimes } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface PassageTagPillProps {
    tag: string;
    onSelectTag: (tag: string) => void;
    onRemoveRequest: (tag: string) => void;
    hasHover: boolean;
}

export default function PassageTagPill({ tag, onSelectTag, onRemoveRequest, hasHover }: PassageTagPillProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.span 
            layout
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-flex items-center px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs font-medium text-gray-300 hover:border-orange-400/50 hover:text-orange-400 transition-colors cursor-pointer"
            onClick={() => onSelectTag(tag)}
        >
            <FaTag size={8} className="opacity-50 mr-1.5" />
            <motion.span layout>{tag}</motion.span>
            <AnimatePresence>
                {(isHovered || !hasHover) && (
                    <motion.button
                        initial={hasHover ? { width: 0, opacity: 0, marginLeft: 0 } : { width: "auto", opacity: 0.7, marginLeft: 6 }}
                        animate={{ width: "auto", opacity: 0.7, marginLeft: 6 }}
                        exit={hasHover ? { width: 0, opacity: 0, marginLeft: 0 } : { width: "auto", opacity: 0.7, marginLeft: 6 }}
                        whileHover={{ opacity: 1, scale: 1.1 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveRequest(tag);
                        }}
                        className="flex items-center justify-center overflow-hidden text-gray-500 hover:text-orange-400 transition-colors"
                    >
                        <FaTimes size={10} />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.span>
    );
}
