"use client";

import { useEffect, useState } from "react";
import { FaBolt } from "react-icons/fa6";
import { STORAGE_KEYS, getStorageItem, setStorageItem } from "@/lib/storage";
import { useBible } from "@/context/BibleContext";

interface StreakCounterProps {
    className?: string;
}

export default function StreakCounter({ className }: StreakCounterProps) {
    const { isInitialized } = useBible();
    const [streak, setStreak] = useState<number>(0);

    useEffect(() => {
        if (!isInitialized) return;

        const updateStreak = () => {
            const now = new Date();
            // Get local date as YYYY-MM-DD
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;
            
            const currentStreak = getStorageItem<number>(STORAGE_KEYS.STREAK_COUNT, 0);
            const lastLoginStr = getStorageItem<string | null>(STORAGE_KEYS.LAST_LOGIN_DATE, null);
            
            let newStreak = currentStreak;
            
            if (lastLoginStr === todayStr) {
                // Already logged in today, just set state
                setStreak(newStreak);
                return;
            }

            if (lastLoginStr) {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const yYear = yesterday.getFullYear();
                const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
                const yDay = String(yesterday.getDate()).padStart(2, '0');
                const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

                if (lastLoginStr === yesterdayStr) {
                    // Logged in yesterday, increment streak
                    newStreak += 1;
                } else {
                    // Missed a day, reset to 1 (starting new streak today)
                    newStreak = 1;
                }
            } else {
                // First time ever, start streak at 1
                newStreak = 1;
            }

            // Update localStorage and state
            setStorageItem(STORAGE_KEYS.STREAK_COUNT, newStreak);
            setStorageItem(STORAGE_KEYS.LAST_LOGIN_DATE, todayStr);
            setStreak(newStreak);
        };

        updateStreak();
    }, [isInitialized]);

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
