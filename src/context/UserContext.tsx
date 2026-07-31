"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { STORAGE_KEYS } from "@/constants/bible";
import { usePersistentState } from "@/hooks/usePersistentState";

interface UserContextType {
    streak: number;
    isInitialized: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [streak, setStreak, streakInitialized] = usePersistentState<number>(
        STORAGE_KEYS.STREAK_COUNT,
        0
    );
    const [lastLoginDate, setLastLoginDate, dateInitialized] = usePersistentState<string | null>(
        STORAGE_KEYS.LAST_LOGIN_DATE,
        null
    );

    const isInitialized = streakInitialized && dateInitialized;

    const updateStreak = useCallback(() => {
        if (!isInitialized) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (lastLoginDate === todayStr) {
            return;
        }

        let newStreak = streak;

        if (lastLoginDate) {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yYear = yesterday.getFullYear();
            const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
            const yDay = String(yesterday.getDate()).padStart(2, '0');
            const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

            if (lastLoginDate === yesterdayStr) {
                newStreak += 1;
            } else {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }

        setStreak(newStreak);
        setLastLoginDate(todayStr);
    }, [isInitialized, streak, lastLoginDate, setStreak, setLastLoginDate]);

    useEffect(() => {
        updateStreak();
    }, [updateStreak]);

    const value = useMemo(() => ({
        streak,
        isInitialized
    }), [streak, isInitialized]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
