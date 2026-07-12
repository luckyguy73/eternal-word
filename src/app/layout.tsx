import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { BibleProvider } from "@/context/BibleContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Eternal Word",
    description: "The Eternal Word of God",
    manifest: '/manifest.json',
    icons: {
        icon: "/favicon.svg",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <BibleProvider>
            {children}
            <NavBar />
        </BibleProvider>
        </body>
        </html>
    );
}
