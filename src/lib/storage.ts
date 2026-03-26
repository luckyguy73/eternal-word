export const STORAGE_KEYS = {
    BOOK: "preferred_book",
    CHAPTER: "preferred_chapter",
    TRANSLATION: "preferred_translation",
    VERSE: "daily_verse",
    VERSE_TIMESTAMP: "daily_verse_timestamp",
    STREAK_COUNT: "streak_count",
    LAST_LOGIN_DATE: "last_login_date",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
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

export const setStorageItem = <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    const valueToStore = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, valueToStore);
};

export const removeStorageItem = (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
};
