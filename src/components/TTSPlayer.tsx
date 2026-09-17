"use client";

import { FaPause, FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";
import { LAYOUT, Z_INDEX } from "@/constants/layout";

interface TTSPlayerProps {
    isPlaying: boolean;
    togglePlay: () => void;
    nextVerse: () => void;
    previousVerse: () => void;
    activeVerseIndex: number;
    jumpToVerse: (index: number) => void;
    totalVerses: number;
    progressPercent: number;
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    setVoice: (voice: SpeechSynthesisVoice) => void;
    isComplete: boolean;
}

export default function TTSPlayer({
    isPlaying,
    togglePlay,
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
    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const voice = voices.find((v) => v.name === e.target.value);
        if (voice) setVoice(voice);
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
            <div className="w-full max-w-md sm:max-w-lg pointer-events-auto bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 w-full bg-gray-800">
                    <div
                        className="h-full bg-orange-400 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                    {/* Voice selector */}
                    <select
                        value={selectedVoice?.name || ""}
                        onChange={handleVoiceChange}
                        className="min-w-0 flex-1 sm:flex-initial sm:max-w-[35%] bg-gray-800 text-gray-200 text-xs rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-orange-400 truncate"
                        title="Select voice"
                    >
                        {voices.length === 0 && <option value="">No voices</option>}
                        {voices.map((voice) => (
                            <option key={voice.voiceURI} value={voice.name}>
                                {voice.name}
                            </option>
                        ))}
                    </select>

                    {/* Center controls */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <button
                            onClick={previousVerse}
                            className="text-gray-300 hover:text-orange-400 transition-colors active:scale-90"
                            title="Previous Verse"
                        >
                            <FaStepBackward size={18} />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="bg-orange-400 text-black rounded-full p-3 hover:bg-orange-300 transition-colors active:scale-90"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
                        </button>
                        <button
                            onClick={nextVerse}
                            className="text-gray-300 hover:text-orange-400 transition-colors active:scale-90"
                            title="Next Verse"
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
                            className="text-xs font-semibold text-gray-300 bg-gray-800 rounded-full px-2 py-1 shrink-0 border border-gray-700 focus:outline-none focus:border-orange-400"
                            title="Jump to verse"
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
