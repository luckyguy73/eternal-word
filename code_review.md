# Code Review & Architecture Analysis: Eternal Word

## Executive Summary

**Eternal Word** is a minimalist, modern Bible reading and study application built with **Next.js 15+ (App Router)**, **React 19**, **Tailwind CSS 4**, and **TypeScript**. It connects to the public **Bolls.life API** to fetch scriptures, manage reading streaks, and allow users to save and tag passages locally.

This code review provides a comprehensive analysis of the project's file structure, code quality, security posture, performance, and maintainability.

---

## 1. File Structure & Architectural Overview

### Current Directory Layout

```
eternal-word/
├── public/                     # Static assets (favicons, manifest, Next.js starter SVGs)
├── src/
│   ├── app/                    # Next.js App Router (pages & API routes)
│   │   ├── api/proxy/          # Server-side proxy for API calls
│   │   ├── chapter/[bookId]/[chapterNumber]/ # Dynamic scripture reader route
│   │   ├── saved/              # Saved passages & tag management page
│   │   ├── globals.css         # Global Tailwind CSS imports & styles
│   │   ├── layout.tsx          # Root layout with providers & navigation
│   │   └── page.tsx            # Daily verse homepage
│   ├── components/             # React UI components
│   │   ├── ChapterDisplay.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── DailyVerse.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── NavBar.tsx
│   │   ├── SavedPassageCard.tsx
│   │   ├── SelectionOverlay.tsx
│   │   ├── StreakCounter.tsx
│   │   ├── TagBar.tsx
│   │   └── VerseText.tsx
│   ├── constants/              # Global constants
│   │   ├── bible.ts            # Default translation & storage keys
│   │   └── layout.ts           # Z-index and layout constants
│   ├── context/                # React Context state management
│   │   ├── BibleContext.tsx    # Master provider composition
│   │   ├── DailyVerseContext.tsx
│   │   ├── LibraryContext.tsx
│   │   ├── SettingsContext.tsx
│   │   └── UserContext.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── usePersistentState.ts
│   │   ├── useTagManagement.ts
│   │   └── useVerseCaching.ts
│   ├── lib/                    # Business logic & utility modules
│   │   ├── bibleService.ts     # Scripture transformation & text cleaning
│   │   ├── libraryService.ts   # Verse grouping & tag formatting
│   │   └── storage.ts          # Safe localStorage wrappers
│   ├── models/                 # TypeScript interfaces, constants, & schemas
│   │   ├── metadata.ts         # Bible book metadata (66 books)
│   │   ├── models.ts           # Data models (Verse, Chapter, SavedVerse, etc.)
│   │   ├── schemas.ts          # Zod validation schemas
│   │   └── translations.ts     # Available translation definitions
│   └── providers/data/         # Data fetching layer
│       └── repository.ts       # Bolls.life API repository
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies & scripts
├── postcss.config.mjs          # PostCSS configuration
├── README.md                   # Project documentation
└── tsconfig.json               # TypeScript configuration
```

### Key Architectural Strengths

- **Clean UI / UX Design**: Thoughtful dark mode aesthetic with consistent typography and smooth transitions (`framer-motion`).
- **Robust Persistence Layer**: Custom `usePersistentState` hook safely handles SSR hydration and multi-tab state sync via `StorageEvent`.
- **Context Composition**: `BibleContext.tsx` effectively composes smaller, focused contexts (`User`, `Settings`, `DailyVerse`, `Library`).

---

## 2. Orphaned, Unused & Dead Code

### Dead Files & Schemas

1. **`src/models/schemas.ts` (100% Unused)**:
   - Contains Zod validation schemas (`VerseSchema`, `ChapterSchema`, `TranslationInfoSchema`, etc.) that are **never imported or used anywhere** in the codebase.
   - API responses from `repository.ts` parse JSON without applying these Zod schemas, rendering the file dead code.

2. **Unused Public Assets (`public/*.svg`)**:
   - `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, and `window.svg` are default Next.js starter templates that are not referenced in the application.

### Unused Functions & Exports

1. **`getDailyVerse()` in `src/providers/data/repository.ts`**:
   - Redundant wrapper around `fetchDailyVerse()`. Never called across the application.
2. **`getTranslationInfo()` in `src/models/translations.ts`**:
   - Utility function exported but never imported; component code directly accesses `TRANSLATIONS_MAP[slug]` or `TRANSLATIONS_ARRAY`.
3. **`isClient()` in `src/providers/data/repository.ts`**:
   - Helper function defined and used internally in `repository.ts` where `typeof window !== "undefined"` is already used standardly elsewhere.
4. **`OldTestament` & `NewTestament` in `src/models/metadata.ts`**:
   - Exported array constants that are never referenced by UI components or filtering logic.

### Unused Imports & Dead Variables

- **`src/app/page.tsx`**: `isInitialized` from `useSettings()` is destructured but never used.
- **`src/app/saved/page.tsx`**:
  - `PassageWithText` imported from `@/context/BibleContext` (unused).
  - `FaTrash`, `FaChevronRight`, `FaTag` imported from `react-icons/fa` (unused).
  - `removePassageFromContext` destructured from `useLibrary()` (unused).
- **`src/context/LibraryContext.tsx`**: `SavedPassage` imported from `@/models/models` (unused).
- **`src/context/BibleContext.tsx`**: `Verse` imported from `@/models/models` (unused).

---

## 3. Security, Reliability & Data Integrity Vulnerabilities

### Critical Security Vulnerabilities

#### 1. Process-Wide SSL Verification Disable (`NODE_TLS_REJECT_UNAUTHORIZED = '0'`)
- **Location**: `src/providers/data/repository.ts` (Line 13) and `src/app/api/proxy/route.ts` (Line 8).
- **Issue**: Setting `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'` globally turns off TLS certificate validation for **all** HTTPS requests in the entire Node.js process runtime.
- **Risk**: Exposes server-side fetches to Man-In-The-Middle (MITM) attacks and credential eavesdropping.
- **Recommendation**: Remove process-level overrides. If upstream API has certificate issues, configure a custom HTTPS agent for that specific fetch instance rather than disabling security globally.

#### 2. SSRF / Unvalidated Input in API Proxy (`/api/proxy`)
- **Location**: `src/app/api/proxy/route.ts` (Line 24).
- **Issue**: Accepts an arbitrary `endpoint` query parameter and constructs `https://bolls.life/${endpoint}` without validating or sanitizing path traversals (`..`) or query strings.
- **Risk**: Allows malicious actors to make arbitrary HTTP requests through the application's backend server to unintended bolls.life endpoints or internal routes.
- **Recommendation**: Validate `endpoint` against an allowlist pattern (e.g., `/^[a-zA-Z0-9_\-\/]+$/`) or constrain proxying to valid Bible translations/chapters.

#### 3. Unsanitized `dangerouslySetInnerHTML` Usage
- **Location**: `src/components/VerseText.tsx` (Line 19).
- **Issue**: Renders raw HTML strings returned from an external API directly into the DOM using `dangerouslySetInnerHTML`.
- **Risk**: Potential Cross-Site Scripting (XSS) if upstream API content is compromised or contains unexpected tags/scripts.
- **Recommendation**: Integrate DOMPurify (`isomorphic-dompurify` or `sanitize-html`) inside `VerseText.tsx` before rendering HTML.

---

## 4. Code Duplication & Logic Redundancy

### 1. Daily Verse Index & Seed Calculation Duplication
- **Locations**:
  - `src/providers/data/repository.ts` (`fetchDailyVerse`)
  - `src/context/DailyVerseContext.tsx` (`getDailyIndex`)
- **Issue**: Both files independently recalculate date string formats (`YYYY-MM-DD`), day-of-year integer calculations, and pseudo-random index generation logic.
- **Impact**: Inconsistent random verse selection if formulas drift between context and repository.
- **Recommendation**: Consolidate daily verse calculation into a single pure utility function in `src/lib/bibleService.ts`.

### 2. LocalStorage Access Abstraction Inconsistency
- **Locations**: `src/hooks/usePersistentState.ts` vs `src/context/SettingsContext.tsx`.
- **Issue**: While `usePersistentState` wraps `localStorage` safely via `storage.ts`, `SettingsContext.tsx` directly calls `localStorage.getItem` and `localStorage.setItem` inside custom `useEffect` hooks.
- **Recommendation**: Refactor `SettingsContext.tsx` to use `usePersistentState` for `translation` and `lastRead`.

### 3. Tag Filtering Predicate Duplication
- **Location**: `src/app/saved/page.tsx` (Lines 48–53 & 61–67).
- **Issue**: The logic to filter passages by tag ("All", "No Tags", or specific tag name) is written twice in `SavedPage`.
- **Recommendation**: Extract the tag matching predicate into a reusable function or single `useMemo` block.

---

## 5. Monolithic Components & Refactoring Opportunities

### 1. `SavedPassageCard.tsx` (205 lines)
- **Problem**: Holds excessive responsibilities:
  - Rendering passage text and range labels.
  - Managing tag addition form and input focus states.
  - Handling auto-complete tag suggestions.
  - Managing confirmation dialog state for passage deletion.
  - Managing confirmation dialog state for tag deletion.
- **Refactoring Strategy**:
  - Break into smaller, focused sub-components:
    - `<PassageHeader>`: Displays reference title and remove action.
    - `<TagList>`: Renders existing tag pills.
    - `<AddTagPopover>`: Encapsulates input, auto-complete suggestions, and focus handling.

### 2. `SelectionOverlay.tsx` (182 lines)
- **Problem**: Handles drawer drag gestures, tab switching ("book", "chapter", "translation"), book grid, chapter grid, and translation selection all in one component.
- **Refactoring Strategy**:
  - Split tab panels into dedicated views: `<BookGrid>`, `<ChapterGrid>`, `<TranslationGrid>`.

### 3. `useVerseCaching.ts` Custom Hook Complexity
- **Problem**: Combines cache lookup, cache eviction (LRU order ref), asynchronous multi-chapter fetching, and state batching in a single complex `useEffect`/`useCallback`.
- **Refactoring Strategy**:
  - Separate cache state management (LRU cache data structure) from asynchronous fetching logic.

---

## 6. Code Smells & Type Safety Deficiencies

### 1. Loose Type Checking & `any` Usage
- **Locations**:
  - `src/providers/data/repository.ts`: `const data: any = await res.json();`
  - `src/app/api/proxy/route.ts`: `catch (error: any)`
  - `src/hooks/useVerseCaching.ts`: `catch (err: any)`
- **Recommendation**: Replace `any` with explicit TypeScript interfaces (`VerseResponse[]`, `ChapterResponse`) or safe `unknown` error casting (`error instanceof Error ? error.message : ...`).

### 2. Lack of Suspense Boundary Around `useSearchParams()`
- **Location**: `src/components/ChapterDisplay.tsx` (Line 23).
- **Issue**: `useSearchParams()` is called directly inside client component without being wrapped in a React `<Suspense>` boundary in Next.js App Router.
- **Impact**: Can cause client-side opt-out from static optimization and trigger Next.js build warnings.

### 3. Missing Zod Runtime Validation Layer
- **Issue**: `schemas.ts` exists but is disconnected from data fetching. `repository.ts` assumes API returns valid structures without runtime checks.
- **Recommendation**: Leverage `schemas.ts` in `repository.ts` to validate external API responses before returning them to context/UI.

---

## 7. Actionable Recommendations & Prioritized Implementation Plan

| Priority | Issue / Task | Impact Area | Proposed Fix |
| :--- | :--- | :--- | :--- |
| **P0 (Critical)** | Remove `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'` | Security | Fix SSL/TLS process-wide vulnerability in `repository.ts` and `route.ts`. |
| **P0 (Critical)** | Validate proxy input (`/api/proxy`) | Security | Enforce endpoint regex validation to block SSRF and path traversal. |
| **P1 (High)** | Delete unused `src/models/schemas.ts` or wire it to API responses | Maintainability | Connect schemas to `repository.ts` or remove dead code. |
| **P1 (High)** | Clean up unused imports & variables | Code Hygiene | Remove unused imports in `page.tsx`, `saved/page.tsx`, `BibleContext.tsx`, `LibraryContext.tsx`. |
| **P1 (High)** | Delete obsolete Next.js starter SVGs | Asset Cleanup | Remove unused `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`. |
| **P2 (Medium)** | Consolidate Daily Verse calculation | Duplication | Move seed and date calculation into `lib/bibleService.ts`. |
| **P2 (Medium)** | Refactor `SettingsContext` to use `usePersistentState` | Consistency | Unify local storage persistence layer across context modules. |
| **P2 (Medium)** | Add HTML Sanitization to `VerseText.tsx` | Security / Reliability | Sanitize external HTML before rendering via `dangerouslySetInnerHTML`. |
| **P3 (Low)** | Refactor monolithic `SavedPassageCard.tsx` | Component Modularization | Extract `TagList` and `AddTagPopover` sub-components. |

---

*Report generated for Eternal Word Codebase Analysis.*
