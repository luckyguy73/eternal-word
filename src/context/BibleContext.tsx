"use client";

import React from "react";
import { SettingsProvider } from "./SettingsContext";
import { LibraryProvider } from "./LibraryContext";
import { DailyVerseProvider } from "./DailyVerseContext";
import { UserProvider } from "./UserContext";


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
