export interface TranslationMetadata {
    slug: string;
    name: string;
    fullName: string;
}

export const TRANSLATIONS: Record<string, TranslationMetadata> = {
    CSB: { slug: "CSB17", name: "CSB", fullName: "Christian Standard Version" },
    ESV: { slug: "ESV", name: "ESV", fullName: "English Standard Version" },
    KJV: { slug: "KJV", name: "KJV", fullName: "King James Version" },
    LBLA: { slug: "LBLA", name: "LBLA", fullName: "La Biblia de las Américas (Español)" },
    NASB: { slug: "NASB", name: "NASB", fullName: "New American Standard Bible" },
    NIV: { slug: "NIV", name: "NIV", fullName: "New International Version" },
    NKJV: { slug: "NKJV", name: "NKJV", fullName: "New King James Version" },
    NLT: { slug: "NLT", name: "NLT", fullName: " New Living Translation" },
    NLV: { slug: "NLV", name: "NLV", fullName: "New Life Version" },
    NVI: { slug: "NVI", name: "NVI", fullName: "Nueva Versión Internacional (Español)" },
    RVR: { slug: "RV1960", name: "RVR", fullName: "Reina-Valera 1960 (Español)" },
};

export const TRANSLATIONS_ARRAY = Object.values(TRANSLATIONS).sort((a, b) =>
    a.name.localeCompare(b.name)
);

export function getTranslationInfo(identifier: string): TranslationMetadata {
    // Try to find by key first (e.g., "CSB", "NKJV")
    if (TRANSLATIONS[identifier]) {
        return TRANSLATIONS[identifier];
    }
    
    // Then try to find by slug (e.g., "CSB17")
    const translationBySlug = TRANSLATIONS_ARRAY.find(t => t.slug === identifier);
    if (translationBySlug) {
        return translationBySlug;
    }

    // Fallback to NKJV
    return TRANSLATIONS.NKJV;
}

