"use client";

import { sanitizeHtml } from "@/lib/bibleService";

interface VerseTextProps {
    html: string;
    className?: string;
    tag?: "div" | "span" | "p";
    onClick?: () => void;
}

/**
 * Centralized component for rendering scripture text containing HTML (like <i> or links).
 * Sanitizes input HTML to prevent XSS attacks while preserving formatting.
 */
export default function VerseText({ html, className, tag: Tag = "div", onClick }: VerseTextProps) {
    if (!html) return null;
    
    const sanitizedHtml = sanitizeHtml(html);
    
    return (
        <Tag
            className={className}
            onClick={onClick}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
}
