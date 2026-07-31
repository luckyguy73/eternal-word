import { STORAGE_KEYS } from "@/constants/bible";

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const getStorageItem = <T>(key: StorageKey, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    
    try {
        // Attempt to parse as JSON for objects/arrays
        return JSON.parse(stored) as T;
    } catch {
        // Fallback for plain strings
        return stored as unknown as T;
    }
};

export const setStorageItem = <T>(key: StorageKey, value: T): void => {
    if (typeof window === "undefined") return;
    const valueToStore = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, valueToStore);
};
