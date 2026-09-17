"use client";

import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaPause, FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";
import { LAYOUT, Z_INDEX } from "@/constants/layout";
import { TTSVoiceOption } from "@/hooks/useBibleTTS";

interface TTSPlayerProps {
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

const VOICE_LABEL_MAX_LENGTH = 12;

const truncateVoiceLabel = (label: string) => {
    if (label.length <= VOICE_LABEL_MAX_LENGTH) return label;
    return `${label.slice(0, VOICE_LABEL_MAX_LENGTH - 3)}...`;
};

export default function TTSPlayer({
    isPlaying,
    togglePlay,
    play,
    pause,
    nextVerse,
    previousVerse,
    activeVerseIndex,
    jumpToVerse,
    totalVerses,
    progressPercent,
    voices,
    selectedVoice,
    setVoice,
    isComplete,
}: TTSPlayerProps) {
    const wasPlayingBeforeDropdownRef = useRef(false);
    const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);
    const voiceMenuRef = useRef<HTMLDivElement>(null);

    const handleDropdownOpen = () => {
        wasPlayingBeforeDropdownRef.current = isPlaying;
        if (isPlaying) pause();
    };

    const handleDropdownClose = () => {
        if (wasPlayingBeforeDropdownRef.current) play();
    };

    const openVoiceMenu = () => {
        handleDropdownOpen();
        setIsVoiceMenuOpen(true);
    };

    const closeVoiceMenu = () => {
        setIsVoiceMenuOpen(false);
        handleDropdownClose();
    };

    useEffect(() => {
        if (!isVoiceMenuOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (voiceMenuRef.current && !voiceMenuRef.current.contains(e.target as Node)) {
                closeVoiceMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVoiceMenuOpen]);

    const handleVoiceSelect = (voice: TTSVoiceOption) => {
        setVoice(voice);
        setIsVoiceMenuOpen(false);
        play();
    };

    const handleVerseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = parseInt(e.target.value, 10);
        if (!Number.isNaN(index)) jumpToVerse(index);
    };

    return (
        <div
            className="fixed left-0 right-0 px-3 sm:px-4 flex justify-center pointer-events-none"
            style={{
                zIndex: Z_INDEX.NAV_NAVBAR,
                bottom: `calc(${LAYOUT.NAVBAR_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 12px)`,
            }}
        >
            <div className="w-full max-w-md sm:max-w-lg pointer-events-auto bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl">
                {/* Progress bar */}
                <div className="h-1 w-full bg-gray-800 rounded-t-2xl overflow-hidden">
                    <div
                        className="h-full bg-orange-400 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                    {/* Voice selector */}
                    <div ref={voiceMenuRef} className="relative min-w-0 flex-1 sm:flex-initial sm:max-w-[35%]">
                        <button
                            type="button"
                            onClick={() => (isVoiceMenuOpen ? closeVoiceMenu() : openVoiceMenu())}
                            className="w-full flex items-center justify-between gap-1 bg-gray-800 text-gray-200 text-xs rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-orange-400"
                        >
                            <span className="truncate">
                                {selectedVoice ? truncateVoiceLabel(selectedVoice.label) : "No voices"}
                            </span>
                            <FaChevronDown size={10} className="shrink-0 text-gray-400" />
                        </button>

                        {isVoiceMenuOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-48 max-h-56 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-10">
                                {voices.length === 0 && (
                                    <div className="px-3 py-2 text-xs text-gray-400">No voices</div>
                                )}
                                {voices.map((voice) => (
                                    <button
                                        key={voice.id}
                                        type="button"
                                        onClick={() => handleVoiceSelect(voice)}
                                        className={`w-full text-left px-3 py-2 text-xs truncate transition-colors hover:bg-gray-700 ${
                                            selectedVoice?.id === voice.id ? "text-orange-400" : "text-gray-200"
                                        }`}
                                    >
                                        {voice.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Center controls */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <button
                            onClick={previousVerse}
                            className="text-gray-300 hover:text-orange-400 transition-colors active:scale-90"
                        >
                            <FaStepBackward size={18} />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="bg-orange-400 text-black rounded-full p-3 hover:bg-orange-300 transition-colors active:scale-90"
                        >
                            {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
                        </button>
                        <button
                            onClick={nextVerse}
                            className="text-gray-300 hover:text-orange-400 transition-colors active:scale-90"
                        >
                            <FaStepForward size={18} />
                        </button>
                    </div>

                    {/* Verse tracker / jump-to-verse dropdown */}
                    {isComplete ? (
                        <div className="text-xs font-semibold text-gray-300 bg-gray-800 rounded-full px-2 py-1 shrink-0">
                            Done
                        </div>
                    ) : (
                        <select
                            value={activeVerseIndex}
                            onChange={handleVerseChange}
                            onFocus={handleDropdownOpen}
                            onBlur={handleDropdownClose}
                            className="text-xs font-semibold text-gray-300 bg-gray-800 rounded-full px-2 py-1 shrink-0 border border-gray-700 focus:outline-none focus:border-orange-400"
                        >
                            {Array.from({ length: totalVerses }, (_, i) => (
                                <option key={i} value={i}>
                                    v. {i + 1} / {totalVerses}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
}
