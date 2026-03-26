"use client";

import { useEffect, useState } from "react";
import { FaBolt } from "react-icons/fa6";
import { STORAGE_KEYS, getStorageItem, setStorageItem } from "@/lib/storage";
import { useIsClient } from "@/hooks/useIsClient";

export default function StreakCounter() {
    const isClient = useIsClient();
    const [streak, setStreak] = useState<number>(0);

    useEffect(() => {
        if (!isClient) return;

        const updateStreak = () => {
            const now = new Date();
            // Get local date as YYYY-MM-DD
            const todayStr = now.toISOString().split("T")[0];
            
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
                const yesterdayStr = yesterday.toISOString().split("T")[0];

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
    }, [isClient]);

    // Format number with commas
    const formattedStreak = streak.toLocaleString();

    return (
        <div className="flex items-center gap-1.5 text-orange-400 absolute right-4 md:right-6">
            <FaBolt className="text-sm md:text-base" />
            <span className="text-sm md:text-lg font-bold">
                {formattedStreak}
            </span>
        </div>
    );
}
