"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FaBookmark, FaBookOpen, FaHome } from "react-icons/fa";
import { useSettings } from "@/context/SettingsContext";
import { useTTSPlayerBar } from "@/context/TTSPlayerBarContext";
import { Z_INDEX } from "@/constants/layout";
import TTSPlayerControls from "./TTSPlayerControls";

export default function NavBar() {
    const pathname = usePathname();
    const { translation: currentTranslation, lastRead, isInitialized } = useSettings();
    const { playerBarProps } = useTTSPlayerBar();

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
        <div 
            className="fixed bottom-0 left-0 right-0 px-8 pb-6 pt-2 pointer-events-none flex justify-center"
            style={{ zIndex: Z_INDEX.NAV_NAVBAR }}
        >
            <nav className="w-full max-w-md sm:max-w-lg pointer-events-auto bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl">
                <AnimatePresence initial={false}>
                    {playerBarProps && (
                        <motion.div
                            key="tts-player-bar"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="rounded-t-2xl border-b border-gray-800 overflow-visible"
                        >
                            <TTSPlayerControls {...playerBarProps} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-3 py-3 px-6">
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
                </div>
            </nav>
        </div>
    );
}
