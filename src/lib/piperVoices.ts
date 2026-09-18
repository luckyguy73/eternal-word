/**
 * Premium neural voices powered by the Piper TTS WASM engine
 * (@mintplex-labs/piper-tts-web). These are merged into the voice dropdown
 * ahead of the native browser/system voices.
 */
export interface PiperVoiceDefinition {
    voiceId: string;
    label: string;
    lang: "en" | "es";
}

export const PIPER_VOICES: PiperVoiceDefinition[] = [
    { voiceId: "en_US-amy-medium", label: "Amy", lang: "en" },
    { voiceId: "en_US-ryan-medium", label: "Ryan", lang: "en" },
    { voiceId: "es_ES-mls_9972-low", label: "Claudia", lang: "es" },
];

// Translation keys (see src/models/translations.ts) whose text is Spanish, and therefore
// should only offer the Spanish premium voice (Claudia) rather than the English ones.
export const SPANISH_TRANSLATIONS = ["LBLA", "NVI", "RVR"];

export function getPiperVoicesForTranslation(translation: string): PiperVoiceDefinition[] {
    const isSpanish = SPANISH_TRANSLATIONS.includes(translation);
    return PIPER_VOICES.filter((v) => (isSpanish ? v.lang === "es" : v.lang === "en"));
}

/**
 * The bundled @mintplex-labs/piper-tts-web package defaults to fetching the
 * onnxruntime-web WASM runtime from a cdnjs URL pinned to an older
 * onnxruntime-web version than the one actually resolved in our
 * node_modules. That version mismatch causes 404s (and, once onnxruntime
 * fails to load, silent playback failures) for the premium Piper voices.
 *
 * To avoid depending on that third-party CDN entirely, we self-host the
 * exact onnxruntime-web WASM runtime files matching our installed version
 * under `public/wasm/onnxruntime/` and point Piper at them explicitly.
 */
export const PIPER_ONNX_WASM_BASE = "/wasm/onnxruntime/";
