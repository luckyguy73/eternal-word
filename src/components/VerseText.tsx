"use client";

interface VerseTextProps {
    html: string;
    className?: string;
    tag?: "div" | "span" | "p";
}

/**
 * Centralized component for rendering scripture text containing HTML (like <i> or links).
 * This provides a single point for future sanitization or specialized styling.
 */
export default function VerseText({ html, className, tag: Tag = "div" }: VerseTextProps) {
    if (!html) return null;
    
    return (
        <Tag
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
