"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Chapter } from "@/models/models";
import { BOOKS } from "@/models/metadata";
import { STORAGE_KEYS } from "@/constants/bible";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { stripHtmlForSpeech } from "@/lib/bibleService";
import { PIPER_ONNX_WASM_BASE, PIPER_VOICES } from "@/lib/piperVoices";

export const MIN_PLAYBACK_RATE = 0.75;
export const MAX_PLAYBACK_RATE = 1.5;
const DEFAULT_PLAYBACK_RATE = 1.0;
const LAST_BOOK_ID = 66;
const LAST_CHAPTER_OF_LAST_BOOK = 22;

export interface TTSVoiceOption {
    id: string;
    label: string;
    kind: "piper" | "native";
    nativeVoice?: SpeechSynthesisVoice;
}

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
    const [nativeVoices, setNativeVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<TTSVoiceOption | null>(null);
    const [playbackRate, setPlaybackRateState] = useState(DEFAULT_PLAYBACK_RATE);
    const [isTTSEnabled, setIsTTSEnabled] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeVerseIndex, setActiveVerseIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const isInitialized = useRef(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isPlayingRef = useRef(isPlaying);
    const activeVerseIndexRef = useRef(activeVerseIndex);
    const playbackTokenRef = useRef(0);
    // Caches in-flight/completed Piper synthesis promises keyed by `${voiceId}:${verseIndex}`,
    // so the next verse can be pre-rendered while the current one is still playing.
    const piperCacheRef = useRef<Map<string, Promise<Blob>>>(new Map());
    // Tracks which voiceId the underlying TtsSession singleton actually has its ONNX model
    // loaded for, so we can force a fresh session when the user switches premium voices.
    const loadedPiperVoiceIdRef = useRef<string | null>(null);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        activeVerseIndexRef.current = activeVerseIndex;
    }, [activeVerseIndex]);

    // Detect support & load native voices
    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        setIsSupported(true);

        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            const englishVoices = allVoices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
            setNativeVoices(englishVoices.length > 0 ? englishVoices : allVoices);
        };

        loadVoices();
        window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
        return () => {
            window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
        };
    }, []);

    // Combine the 3 premium Piper neural voices with native voices (alphabetically sorted)
    const voices: TTSVoiceOption[] = [
        ...PIPER_VOICES.map((v) => ({ id: v.voiceId, label: v.label, kind: "piper" as const })),
        ...[...nativeVoices]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((v) => ({ id: v.name, label: v.name, kind: "native" as const, nativeVoice: v })),
    ];

    // Background pre-cache the premium Piper voice models on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        let cancelled = false;

        (async () => {
            try {
                const piper = await import("@mintplex-labs/piper-tts-web");
                const alreadyStored = await piper.stored();
                for (const voice of PIPER_VOICES) {
                    if (cancelled) return;
                    if (!alreadyStored.includes(voice.voiceId)) {
                        piper.download(voice.voiceId).catch(() => {
                            // Silently ignore pre-cache failures; will retry lazily on first use
                        });
                    }
                }
            } catch {
                // Piper WASM engine unavailable in this environment; native voices still work
            }
        })();

        return () => {
            cancelled = true;
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
        if (selectedVoice) return;

        const storedVoiceId = getStorageItem<string>(STORAGE_KEYS.TTS_VOICE, "");
        if (storedVoiceId) {
            const match = voices.find((v) => v.id === storedVoiceId);
            if (match) {
                setSelectedVoice(match);
                return;
            }
        }
        setSelectedVoice(voices[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const setVoice = useCallback((voice: TTSVoiceOption) => {
        setSelectedVoice(voice);
        setStorageItem(STORAGE_KEYS.TTS_VOICE, voice.id);
    }, []);

    const setRate = useCallback((rate: number) => {
        const clamped = Math.min(Math.max(rate, MIN_PLAYBACK_RATE), MAX_PLAYBACK_RATE);
        setPlaybackRateState(clamped);
        setStorageItem(STORAGE_KEYS.TTS_RATE, clamped);
    }, []);

    const stopSpeaking = useCallback(() => {
        playbackTokenRef.current += 1;
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
            audioRef.current = null;
        }
    }, []);

    // Verse text (and therefore any cached synthesis) is only valid for the current chapter/translation.
    useEffect(() => {
        piperCacheRef.current.clear();
    }, [chapter]);

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

    const handleVerseEnd = useCallback(
        (index: number) => {
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
        },
        [chapter.verses.length, goToNextChapter, isVeryLastVerse, persistLastPosition]
    );

    const speakVerseNative = useCallback(
        (index: number, voice: TTSVoiceOption | null) => {
            if (typeof window === "undefined" || !window.speechSynthesis) return;
            const verse = chapter.verses[index];
            if (!verse) return;

            const text = stripHtmlForSpeech(verse.text);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = playbackRate;
            if (voice?.nativeVoice) {
                utterance.voice = voice.nativeVoice;
            }

            utterance.onend = () => handleVerseEnd(index);

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        },
        [chapter.verses, handleVerseEnd, playbackRate]
    );

    // Runs the actual Piper WASM synthesis for a given voice/text and resolves with the audio blob.
    const predictPiperAudio = useCallback(async (voice: TTSVoiceOption, text: string): Promise<Blob> => {
        const piper = await import("@mintplex-labs/piper-tts-web");

        // TtsSession is an internal singleton: calling create() again while an instance
        // already exists just reuses it and patches the `voiceId` property, without
        // reloading the ONNX model/config for the newly requested voice. That silently
        // keeps synthesizing with whichever premium voice was loaded first. Force a fresh
        // instance whenever the requested voice differs from the one actually loaded so
        // init() reloads the correct model.
        if (loadedPiperVoiceIdRef.current && loadedPiperVoiceIdRef.current !== voice.id) {
            piper.TtsSession._instance = null;
        }

        // Use TtsSession directly (instead of the top-level predict() helper) so we
        // can point onnxruntime-web at our self-hosted WASM runtime, avoiding the
        // package's default cdnjs URL which is pinned to a mismatched version and
        // fails to load (breaking premium voice playback entirely).
        const session = await piper.TtsSession.create({
            voiceId: voice.id,
            wasmPaths: {
                ...piper.TtsSession.WASM_LOCATIONS,
                onnxWasm: PIPER_ONNX_WASM_BASE,
            },
        });
        loadedPiperVoiceIdRef.current = voice.id;
        return session.predict(text);
    }, []);

    // Kicks off synthesis for a verse in the background (without playing it) and caches the
    // resulting promise so playback can consume it instantly once it's needed.
    const prefetchVerse = useCallback(
        (index: number, voice: TTSVoiceOption | null) => {
            if (!voice || voice.kind !== "piper") return;
            const verse = chapter.verses[index];
            if (!verse) return;

            const cacheKey = `${voice.id}:${index}`;
            if (piperCacheRef.current.has(cacheKey)) return;

            const text = stripHtmlForSpeech(verse.text);
            const promise = predictPiperAudio(voice, text);
            piperCacheRef.current.set(cacheKey, promise);
            promise.catch(() => {
                piperCacheRef.current.delete(cacheKey);
            });
        },
        [chapter.verses, predictPiperAudio]
    );

    const speakVersePiper = useCallback(
        async (index: number, voice: TTSVoiceOption) => {
            const verse = chapter.verses[index];
            if (!verse) return;

            const token = playbackTokenRef.current;
            const cacheKey = `${voice.id}:${index}`;

            try {
                let wavPromise = piperCacheRef.current.get(cacheKey);
                if (!wavPromise) {
                    const text = stripHtmlForSpeech(verse.text);
                    wavPromise = predictPiperAudio(voice, text);
                    piperCacheRef.current.set(cacheKey, wavPromise);
                }

                const wav = await wavPromise;
                piperCacheRef.current.delete(cacheKey);

                // Playback state may have changed while awaiting the model/synthesis.
                if (token !== playbackTokenRef.current) return;

                const audio = new Audio();
                audio.src = URL.createObjectURL(wav);
                audio.playbackRate = playbackRate;
                audio.onended = () => {
                    URL.revokeObjectURL(audio.src);
                    if (token === playbackTokenRef.current) handleVerseEnd(index);
                };

                audioRef.current = audio;
                await audio.play();

                // Buffer 1 verse ahead: pre-render the next verse now so it's ready to play
                // instantly when this one ends, eliminating the inter-verse synthesis delay.
                prefetchVerse(index + 1, voice);
            } catch {
                piperCacheRef.current.delete(cacheKey);
                // Fall back silently; user can switch to a native voice if Piper synthesis fails
            }
        },
        [chapter.verses, handleVerseEnd, playbackRate, predictPiperAudio, prefetchVerse]
    );

    const speakVerse = useCallback(
        (index: number) => {
            stopSpeaking();
            if (selectedVoice?.kind === "piper") {
                speakVersePiper(index, selectedVoice);
            } else {
                speakVerseNative(index, selectedVoice);
            }
        },
        [selectedVoice, speakVerseNative, speakVersePiper, stopSpeaking]
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
