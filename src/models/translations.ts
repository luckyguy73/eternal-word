export interface TranslationMetadata {
    slug: string;
    name: string;
    fullName: string;
}

export const TRANSLATIONS: Record<string, TranslationMetadata> = {
    ESV: { slug: "ESV", name: "ESV", fullName: "English Standard Version" },
    KJV: { slug: "KJV", name: "KJV", fullName: "King James Version" },
    LBLA: { slug: "LBLA", name: "LBLA", fullName: "La Biblia de las Américas (Español)" },
    NASB: { slug: "NASB", name: "NASB", fullName: "New American Standard Bible" },
    NIV: { slug: "NIV", name: "NIV", fullName: "New International Version" },
    NLV: { slug: "NLV", name: "NLV", fullName: "New Life Version" },
    NKJV: { slug: "NKJV", name: "NKJV", fullName: "New King James Version" },
    NVI: { slug: "NVI", name: "NVI", fullName: "Nueva Versión Internacional (Español)" },
    RV1960: { slug: "RV1960", name: "RV1960", fullName: "Reina-Valera 1960 (Español)" },
};

export const TRANSLATIONS_ARRAY = Object.values(TRANSLATIONS).sort((a, b) =>
    a.name.localeCompare(b.name)
);

export function getTranslationInfo(slug: string): TranslationMetadata {
    return TRANSLATIONS[slug] || TRANSLATIONS.NKJV;
}

