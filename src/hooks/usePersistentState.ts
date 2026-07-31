"use client";

import { useEffect, useState } from "react";
import { getStorageItem, setStorageItem, type StorageKey } from "@/lib/storage";

/**
 * A hook that persists state to localStorage and keeps it in sync across tabs.
 */
export function usePersistentState<T>(key: StorageKey, defaultValue: T) {
    const [state, setState] = useState<T>(defaultValue);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial load from storage
    useEffect(() => {
        const stored = getStorageItem<T>(key, defaultValue);
        setState(stored);
        setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]); // Only reload if the key changes. defaultValue is just a fallback.

    // Update localStorage whenever state changes, but only after initialization
    useEffect(() => {
        if (isInitialized) {
            setStorageItem(key, state);
        }
    }, [key, state, isInitialized]);

    // Listen for storage changes in other tabs to keep state in sync
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    const newValue = JSON.parse(e.newValue) as T;
                    setState(newValue);
                } catch {
                    setState(e.newValue as unknown as T);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [key]);

    return [state, setState, isInitialized] as const;
}
