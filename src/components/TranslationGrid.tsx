"use client";

import React from "react";
import { TRANSLATIONS_ARRAY } from "@/models/translations";

interface TranslationGridProps {
    currentTranslation: string;
    onTranslationSelect: (translation: string) => void;
}

export default function TranslationGrid({ currentTranslation, onTranslationSelect }: TranslationGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TRANSLATIONS_ARRAY.map((t) => (
                <button
                    key={t.slug}
                    onClick={() => onTranslationSelect(t.slug)}
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
    );
}
