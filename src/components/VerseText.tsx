"use client";

import { sanitizeHtml } from "@/lib/bibleService";

interface VerseTextProps {
    html: string;
    className?: string;
    tag?: "div" | "span" | "p";
}

/**
 * Centralized component for rendering scripture text containing HTML (like <i> or links).
 * Sanitizes input HTML to prevent XSS attacks while preserving formatting.
 */
export default function VerseText({ html, className, tag: Tag = "div" }: VerseTextProps) {
    if (!html) return null;
    
    const sanitizedHtml = sanitizeHtml(html);
    
    return (
        <Tag
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
}
