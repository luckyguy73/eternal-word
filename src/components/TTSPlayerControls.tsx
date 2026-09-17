"use client";

import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaPause, FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";
import { TTSPlayerBarProps } from "@/context/TTSPlayerBarContext";
import { TTSVoiceOption } from "@/hooks/useBibleTTS";

const VOICE_LABEL_MAX_LENGTH = 12;

const truncateVoiceLabel = (label: string) => {
    if (label.length <= VOICE_LABEL_MAX_LENGTH) return label;
    return `${label.slice(0, VOICE_LABEL_MAX_LENGTH - 3)}...`;
};

/**
 * Renders just the playback controls (progress bar + voice selector + transport controls +
 * verse tracker). This is embedded inside the NavBar, which owns the outer container,
 * positioning, and expand/collapse animation.
 */
export default function TTSPlayerControls({
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
}: TTSPlayerBarProps) {
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
        <div className="w-full">
            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-800 overflow-hidden">
                <div
                    className="h-full bg-orange-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/*
              Grid with the same 3 equal columns as the nav-item row below (which uses
              justify-around within matching px-6 padding), so each control here lines up
              directly above its corresponding icon: voice selector above Home, play controls
              above Read, verse tracker above Saved.
            */}
            <div className="grid grid-cols-3 items-center px-6 py-2.5 sm:py-3">
                {/* Voice selector */}
                <div ref={voiceMenuRef} className="relative flex justify-center min-w-0">
                    <button
                        type="button"
                        onClick={() => (isVoiceMenuOpen ? closeVoiceMenu() : openVoiceMenu())}
                        className="max-w-[110px] flex items-center justify-between gap-1 bg-gray-800 text-gray-200 text-xs rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-orange-400"
                    >
                        <span className="truncate">
                            {selectedVoice ? truncateVoiceLabel(selectedVoice.label) : "No voices"}
                        </span>
                        <FaChevronDown size={10} className="shrink-0 text-gray-400" />
                    </button>

                    {isVoiceMenuOpen && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 max-h-56 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-10">
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

                {/* Playback controls */}
                <div className="flex items-center justify-center gap-3 sm:gap-4">
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
                <div className="flex justify-center">
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
