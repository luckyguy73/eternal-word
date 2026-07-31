"use client";

import React, { createContext } from "react";
import { SettingsProvider } from "./SettingsContext";
import { LibraryProvider, PassageWithText } from "./LibraryContext";
import { DailyVerseProvider } from "./DailyVerseContext";
import { UserProvider } from "./UserContext";

export type { PassageWithText };

export function BibleProvider({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <LibraryProvider>
                <DailyVerseProvider>
                    <UserProvider>
                        {children}
                    </UserProvider>
                </DailyVerseProvider>
            </LibraryProvider>
        </SettingsProvider>
    );
}
