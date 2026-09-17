"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Chapter } from "@/models/models";
import { BOOKS } from "@/models/metadata";
import { STORAGE_KEYS } from "@/constants/bible";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { stripHtmlForSpeech } from "@/lib/bibleService";

export const MIN_PLAYBACK_RATE = 0.75;
export const MAX_PLAYBACK_RATE = 1.5;
const DEFAULT_PLAYBACK_RATE = 1.0;
const LAST_BOOK_ID = 66;
const LAST_CHAPTER_OF_LAST_BOOK = 22;

interface TTSLastPosition {
    bookId: number;
    chapter: number;
    verseIndex: number;
    isPlaying: boolean;
}

interface UseBibleTTSProps {
    chapter: Chapter;
    bookId: number;
    translation: string;
}

export function useBibleTTS({ chapter, bookId, translation }: UseBibleTTSProps) {
    const router = useRouter();

    const [isSupported, setIsSupported] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [playbackRate, setPlaybackRateState] = useState(DEFAULT_PLAYBACK_RATE);
    const [isTTSEnabled, setIsTTSEnabled] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeVerseIndex, setActiveVerseIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const isInitialized = useRef(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isPlayingRef = useRef(isPlaying);
    const activeVerseIndexRef = useRef(activeVerseIndex);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        activeVerseIndexRef.current = activeVerseIndex;
    }, [activeVerseIndex]);

    // Detect support & load voices
    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        setIsSupported(true);

        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            const englishVoices = allVoices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
            setVoices(englishVoices.length > 0 ? englishVoices : allVoices);
        };

        loadVoices();
        window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
        return () => {
            window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
        };
    }, []);

    // Hydrate persisted preferences once on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        const storedRate = getStorageItem<number>(STORAGE_KEYS.TTS_RATE, DEFAULT_PLAYBACK_RATE);
        setPlaybackRateState(storedRate);

        const storedEnabled = getStorageItem<boolean>(STORAGE_KEYS.TTS_ENABLED, false);
        setIsTTSEnabled(storedEnabled);

        const lastPosition = getStorageItem<TTSLastPosition | null>(STORAGE_KEYS.TTS_LAST_POSITION, null);
        if (lastPosition && lastPosition.bookId === bookId && lastPosition.chapter === chapter.chapterNumber) {
            const clampedIndex = Math.min(Math.max(lastPosition.verseIndex, 0), chapter.verses.length - 1);
            setActiveVerseIndex(clampedIndex);
            if (storedEnabled && lastPosition.isPlaying) {
                setIsPlaying(true);
            }
        } else {
            setActiveVerseIndex(0);
        }

        isInitialized.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Select the persisted preferred voice once voices are available
    useEffect(() => {
        if (voices.length === 0) return;
        const storedVoiceName = getStorageItem<string>(STORAGE_KEYS.TTS_VOICE, "");
        if (storedVoiceName) {
            const match = voices.find((v) => v.name === storedVoiceName || v.voiceURI === storedVoiceName);
            if (match) {
                setSelectedVoice(match);
                return;
            }
        }
        setSelectedVoice((prev) => prev ?? voices[0]);
    }, [voices]);

    const persistLastPosition = useCallback(
        (verseIndex: number, playing: boolean, targetBookId = bookId, targetChapter = chapter.chapterNumber) => {
            setStorageItem<TTSLastPosition>(STORAGE_KEYS.TTS_LAST_POSITION, {
                bookId: targetBookId,
                chapter: targetChapter,
                verseIndex,
                isPlaying: playing,
            });
        },
        [bookId, chapter.chapterNumber]
    );

    const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
        setSelectedVoice(voice);
        setStorageItem(STORAGE_KEYS.TTS_VOICE, voice.name);
    }, []);

    const setRate = useCallback((rate: number) => {
        const clamped = Math.min(Math.max(rate, MIN_PLAYBACK_RATE), MAX_PLAYBACK_RATE);
        setPlaybackRateState(clamped);
        setStorageItem(STORAGE_KEYS.TTS_RATE, clamped);
    }, []);

    const stopSpeaking = useCallback(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, []);

    const isLastVerseOfChapter = activeVerseIndex >= chapter.verses.length - 1;
    const isLastChapterOfBook = chapter.chapterNumber >= (BOOKS[bookId]?.chapters || 1);
    const isVeryLastVerse = bookId === LAST_BOOK_ID && chapter.chapterNumber === LAST_CHAPTER_OF_LAST_BOOK && isLastVerseOfChapter;

    const goToNextChapter = useCallback(() => {
        let nextBookId = bookId;
        let nextChapterNumber = chapter.chapterNumber + 1;

        if (isLastChapterOfBook) {
            nextBookId = bookId + 1;
            nextChapterNumber = 1;
        }

        persistLastPosition(0, true, nextBookId, nextChapterNumber);
        router.push(`/chapter/${nextBookId}/${nextChapterNumber}?translation=${translation}`);
    }, [bookId, chapter.chapterNumber, isLastChapterOfBook, persistLastPosition, router, translation]);

    const speakVerse = useCallback(
        (index: number) => {
            if (typeof window === "undefined" || !window.speechSynthesis) return;
            const verse = chapter.verses[index];
            if (!verse) return;

            stopSpeaking();

            const text = stripHtmlForSpeech(verse.text);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = playbackRate;
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            utterance.onend = () => {
                if (!isPlayingRef.current) return;

                if (index >= chapter.verses.length - 1) {
                    if (isVeryLastVerse) {
                        setIsPlaying(false);
                        setIsComplete(true);
                        persistLastPosition(index, false);
                    } else {
                        goToNextChapter();
                    }
                } else {
                    const nextIndex = index + 1;
                    setActiveVerseIndex(nextIndex);
                    persistLastPosition(nextIndex, true);
                }
            };

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        },
        [chapter.verses, goToNextChapter, isVeryLastVerse, persistLastPosition, playbackRate, selectedVoice, stopSpeaking]
    );

    // Speak whenever the active verse changes while playing
    useEffect(() => {
        if (!isInitialized.current) return;
        if (isPlaying) {
            speakVerse(activeVerseIndex);
        } else {
            stopSpeaking();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, activeVerseIndex, selectedVoice, playbackRate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSpeaking();
        };
    }, [stopSpeaking]);

    const play = useCallback(() => {
        setIsComplete(false);
        setIsPlaying(true);
        persistLastPosition(activeVerseIndexRef.current, true);
    }, [persistLastPosition]);

    const pause = useCallback(() => {
        setIsPlaying(false);
        stopSpeaking();
        persistLastPosition(activeVerseIndexRef.current, false);
    }, [persistLastPosition, stopSpeaking]);

    const togglePlay = useCallback(() => {
        if (isPlayingRef.current) {
            pause();
        } else {
            play();
        }
    }, [pause, play]);

    const nextVerse = useCallback(() => {
        if (activeVerseIndexRef.current >= chapter.verses.length - 1) {
            if (!isVeryLastVerse) {
                goToNextChapter();
            }
            return;
        }
        const newIndex = activeVerseIndexRef.current + 1;
        setActiveVerseIndex(newIndex);
        persistLastPosition(newIndex, isPlayingRef.current);
    }, [chapter.verses.length, goToNextChapter, isVeryLastVerse, persistLastPosition]);

    const previousVerse = useCallback(() => {
        const newIndex = Math.max(activeVerseIndexRef.current - 1, 0);
        setActiveVerseIndex(newIndex);
        persistLastPosition(newIndex, isPlayingRef.current);
    }, [persistLastPosition]);

    const jumpToVerse = useCallback(
        (index: number) => {
            const clampedIndex = Math.min(Math.max(index, 0), chapter.verses.length - 1);
            setIsComplete(false);
            setActiveVerseIndex(clampedIndex);
            setIsPlaying(true);
            persistLastPosition(clampedIndex, true);
        },
        [chapter.verses.length, persistLastPosition]
    );

    const toggleTTS = useCallback(() => {
        setIsTTSEnabled((prev) => {
            const next = !prev;
            setStorageItem(STORAGE_KEYS.TTS_ENABLED, next);
            if (next) {
                setIsComplete(false);
                setIsPlaying(true);
                persistLastPosition(activeVerseIndexRef.current, true);
            } else {
                setIsPlaying(false);
                stopSpeaking();
                persistLastPosition(activeVerseIndexRef.current, false);
            }
            return next;
        });
    }, [persistLastPosition, stopSpeaking]);

    const progressPercent = chapter.verses.length > 0 ? ((activeVerseIndex + 1) / chapter.verses.length) * 100 : 0;

    return {
        isSupported,
        voices,
        selectedVoice,
        setVoice,
        playbackRate,
        setRate,
        isTTSEnabled,
        toggleTTS,
        isPlaying,
        play,
        pause,
        togglePlay,
        activeVerseIndex,
        nextVerse,
        previousVerse,
        jumpToVerse,
        progressPercent,
        isComplete,
    };
}
