"use client";

import { FaBolt } from "react-icons/fa6";
import { useUser } from "@/context/UserContext";

interface StreakCounterProps {
    className?: string;
}

export default function StreakCounter({ className }: StreakCounterProps) {
    const { streak } = useUser();

    // Format number with commas
    const formattedStreak = streak.toLocaleString();

    return (
        <div className={`flex items-center gap-1.5 text-orange-400 ${className}`}>
            <FaBolt className="text-sm md:text-base" />
            <span className="text-sm md:text-lg font-bold">
                {formattedStreak}
            </span>
        </div>
    );
}
