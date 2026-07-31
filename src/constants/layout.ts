/**
 * Centralized z-index values to avoid "z-index wars".
 */
export const Z_INDEX = {
    BASE: 0,
    NAV_NAVBAR: 40,
    NAV_BACKDROP: 50,
    NAV_DRAWER: 50,
    OVERLAY_HEADER: 30,
    OVERLAY_NAV: 20,
    DIALOG_BACKDROP: 60,
    DIALOG_CONTENT: 70,
} as const;

export const LAYOUT = {
    HEADER_HEIGHT: 80,
    NAVBAR_HEIGHT: 90,
    SCROLL_OFFSET: 200, // Account for sticky header when scrolling to verse
} as const;
