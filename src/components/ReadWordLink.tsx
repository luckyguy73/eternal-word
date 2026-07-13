"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBookOpen } from "react-icons/fa";
import { STORAGE_KEYS, getStorageItem } from "@/lib/storage";
import { useBible } from "@/context/BibleContext";

export default function ReadWordLink() {
    const { isInitialized } = useBible();
    const [link, setLink] = useState("/chapter/1/1?translation=NKJV");

    useEffect(() => {
        if (!isInitialized) return;

        const book = getStorageItem(STORAGE_KEYS.BOOK, "1");
        const chapter = getStorageItem(STORAGE_KEYS.CHAPTER, "1");
        const translation = getStorageItem(STORAGE_KEYS.TRANSLATION, "NKJV");
        
        setLink(`/chapter/${book}/${chapter}?translation=${translation}`);
    }, [isInitialized]);

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
