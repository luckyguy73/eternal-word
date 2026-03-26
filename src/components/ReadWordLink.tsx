"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBookOpen } from "react-icons/fa";

const STORAGE_KEYS = {
    BOOK: "preferred_book",
    CHAPTER: "preferred_chapter",
    TRANSLATION: "preferred_translation",
};

export default function ReadWordLink() {
    const [link, setLink] = useState("/chapter/1/1?translation=NKJV");

    useEffect(() => {
        const book = localStorage.getItem(STORAGE_KEYS.BOOK) || "1";
        const chapter = localStorage.getItem(STORAGE_KEYS.CHAPTER) || "1";
        const translation = localStorage.getItem(STORAGE_KEYS.TRANSLATION) || "NKJV";
        
        // Defer state updates to avoid "cascading renders" synchronous update warning
        setTimeout(() => {
            setLink(`/chapter/${book}/${chapter}?translation=${translation}`);
        }, 0);
    }, []);

    return (
        <Link
            href={link}
            className="absolute left-2.5 md:left-0 p-3 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
            title="Read the Word"
        >
            <FaBookOpen size={28} />
        </Link>
    );
}
