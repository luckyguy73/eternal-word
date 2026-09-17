"use client";

import React, { createContext, useContext, useState } from "react";
import { TTSVoiceOption } from "@/hooks/useBibleTTS";

export interface TTSPlayerBarProps {
    isPlaying: boolean;
    togglePlay: () => void;
    play: () => void;
    pause: () => void;
    nextVerse: () => void;
    previousVerse: () => void;
    activeVerseIndex: number;
    jumpToVerse: (index: number) => void;
    totalVerses: number;
    progressPercent: number;
    voices: TTSVoiceOption[];
    selectedVoice: TTSVoiceOption | null;
    setVoice: (voice: TTSVoiceOption) => void;
    isComplete: boolean;
}

interface TTSPlayerBarContextValue {
    playerBarProps: TTSPlayerBarProps | null;
    setPlayerBarProps: (props: TTSPlayerBarProps | null) => void;
}

const TTSPlayerBarContext = createContext<TTSPlayerBarContextValue | undefined>(undefined);

export function TTSPlayerBarProvider({ children }: { children: React.ReactNode }) {
    const [playerBarProps, setPlayerBarProps] = useState<TTSPlayerBarProps | null>(null);

    return (
        <TTSPlayerBarContext.Provider value={{ playerBarProps, setPlayerBarProps }}>
            {children}
        </TTSPlayerBarContext.Provider>
    );
}

export function useTTSPlayerBar() {
    const context = useContext(TTSPlayerBarContext);
    if (!context) {
        throw new Error("useTTSPlayerBar must be used within a TTSPlayerBarProvider");
    }
    return context;
}
