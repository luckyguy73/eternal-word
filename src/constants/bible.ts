export const DEFAULT_TRANSLATION = "NKJV";

export const STORAGE_KEYS = {
    BOOK: "preferred_book",
    CHAPTER: "preferred_chapter",
    TRANSLATION: "preferred_translation",
    VERSE: "daily_verse",
    STREAK_COUNT: "streak_count",
    LAST_LOGIN_DATE: "last_login_date",
    SAVED_VERSES: "saved_verses",
    TAGS: "saved_tags",
    TTS_VOICE: "tts_voice_name",
    TTS_RATE: "tts_playback_rate",
    TTS_ENABLED: "tts_enabled",
    TTS_LAST_POSITION: "tts_last_position",
} as const;
