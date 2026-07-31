"use client";

import React, { useEffect, useState } from 'react';
import { PassageWithText, useLibrary } from '@/context/LibraryContext';
import Link from 'next/link';
import { FaChevronRight, FaPlus, FaTrash } from 'react-icons/fa';
import ConfirmDialog from './ConfirmDialog';
import VerseText from './VerseText';
import PassageTagPill from './PassageTagPill';
import AddTagInput from './AddTagInput';

interface SavedPassageCardProps {
    passage: PassageWithText;
    currentTranslation: string;
    onSelectTag: (tag: string) => void;
    selectedTag: string;
}

export default function SavedPassageCard({ passage, currentTranslation, onSelectTag, selectedTag }: SavedPassageCardProps) {
    const { removePassage, addTagToPassage, removeTagFromPassage, allTags } = useLibrary();
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [tagToRemove, setTagToRemove] = useState<string | null>(null);
    const [hasHover, setHasHover] = useState(true);

    useEffect(() => {
        setHasHover(window.matchMedia('(hover: hover)').matches);
    }, []);

    const passageTags = Array.from(new Set(passage.verses.flatMap(v => v.tags || [])));

    const unusedTags = allTags.filter(t => !passageTags.includes(t));

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
                        <PassageTagPill
                            key={tag}
                            tag={tag}
                            onSelectTag={onSelectTag}
                            onRemoveRequest={setTagToRemove}
                            hasHover={hasHover}
                        />
                    ))}

                    {isAddingTag ? (
                        <AddTagInput
                            onAddTag={(tag) => {
                                addTagToPassage(passage, tag);
                                setIsAddingTag(false);
                            }}
                            onCancel={() => setIsAddingTag(false)}
                            suggestions={unusedTags}
                        />
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
