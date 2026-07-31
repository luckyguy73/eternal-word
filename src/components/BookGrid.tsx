"use client";

import React from "react";
import { BOOKS } from "@/models/metadata";

interface BookGridProps {
    selectedBookId: number;
    onBookSelect: (bookId: number) => void;
}

export default function BookGrid({ selectedBookId, onBookSelect }: BookGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.values(BOOKS).map((book) => (
                <button
                    key={book.id}
                    onClick={() => onBookSelect(book.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                        selectedBookId === book.id
                            ? "bg-orange-400/10 border-orange-400 text-orange-400"
                            : "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800"
                    }`}
                >
                    <span className="font-medium">{book.name}</span>
                </button>
            ))}
        </div>
    );
}
