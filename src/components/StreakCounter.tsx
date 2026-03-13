"use client";

import { useEffect, useState } from "react";
import { FaBolt } from "react-icons/fa6";

const STORAGE_KEYS = {
    STREAK_COUNT: "streak_count",
    LAST_LOGIN_DATE: "last_login_date",
};

export default function StreakCounter() {
    const [streak, setStreak] = useState<number>(0);

    useEffect(() => {
        const updateStreak = () => {
            const now = new Date();
            const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
            
            const storedStreak = localStorage.getItem(STORAGE_KEYS.STREAK_COUNT);
            const lastLoginStr = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_DATE);
            
            let currentStreak = storedStreak ? parseInt(storedStreak, 10) : 0;
            
            if (lastLoginStr === todayStr) {
                // Already logged in today, just set state
                setStreak(currentStreak);
                return;
            }

            if (lastLoginStr) {
                const lastLogin = new Date(lastLoginStr);
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split("T")[0];

                if (lastLoginStr === yesterdayStr) {
                    // Logged in yesterday, increment streak
                    currentStreak += 1;
                } else {
                    // Missed a day, reset to 1 (starting new streak today)
                    currentStreak = 1;
                }
            } else {
                // First time ever, start streak at 1
                currentStreak = 1;
            }

            // Update localStorage and state
            localStorage.setItem(STORAGE_KEYS.STREAK_COUNT, currentStreak.toString());
            localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_DATE, todayStr);
            setStreak(currentStreak);
        };

        updateStreak();
    }, []);

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
