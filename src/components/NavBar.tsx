"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaBookOpen, FaBookmark } from "react-icons/fa";
import { STORAGE_KEYS, getStorageItem } from "@/lib/storage";
import { useBible } from "@/context/BibleContext";

export default function NavBar() {
    const pathname = usePathname();
    const { translation: currentTranslation, isInitialized } = useBible();
    const [lastRead, setLastRead] = useState({ bookId: 1, chapter: 1 });

    useEffect(() => {
        if (!isInitialized) return;

        const bookId = parseInt(getStorageItem(STORAGE_KEYS.BOOK, "1"), 10);
        const chapter = parseInt(getStorageItem(STORAGE_KEYS.CHAPTER, "1"), 10);

        setLastRead({ bookId, chapter });
    }, [isInitialized, pathname]); 

    const navItems = [
        {
            label: "Home",
            icon: <FaHome size={22} />,
            href: "/",
            active: pathname === "/",
        },
        {
            label: "Read",
            icon: <FaBookOpen size={22} />,
            href: `/chapter/${lastRead.bookId}/${lastRead.chapter}?translation=${currentTranslation}`,
            active: pathname.startsWith("/chapter/"),
        },
        {
            label: "Saved",
            icon: <FaBookmark size={22} />,
            href: "/saved",
            active: pathname === "/saved",
        },
    ];

    if (!isInitialized) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-8 pb-6 pt-2 pointer-events-none flex justify-center">
            <nav className="w-full max-w-md pointer-events-auto bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl flex items-center justify-around py-3 px-6">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 transition-colors ${
                            item.active ? "text-orange-400" : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        {item.icon}
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
