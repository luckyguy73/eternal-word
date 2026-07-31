"use client";

import React, { useEffect, useRef, useState } from 'react';

interface AddTagInputProps {
    onAddTag: (tag: string) => void;
    onCancel: () => void;
    suggestions: string[];
}

export default function AddTagInput({ onAddTag, onCancel, suggestions }: AddTagInputProps) {
    const [tagInput, setTagInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleAdd = (tag: string) => {
        if (tag.trim()) {
            onAddTag(tag.trim());
        }
    };

    const filteredSuggestions = suggestions.filter(s =>
        s.toLowerCase().includes(tagInput.toLowerCase())
    );

    return (
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
                    if (e.key === 'Enter') handleAdd(tagInput);
                    if (e.key === 'Escape') onCancel();
                }}
                onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="px-2 py-1 bg-black border border-orange-400/50 rounded-lg text-xs text-white focus:outline-none focus:border-orange-400 w-24 transition-all"
                placeholder="Tag name..."
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 w-32 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-20 overflow-hidden">
                    {filteredSuggestions.map(s => (
                        <button
                            key={s}
                            onClick={() => handleAdd(s)}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800 last:border-0"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
