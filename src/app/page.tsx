import { getDailyWord } from "@/providers/data/repository";
import Link from "next/link";
import { FaBookOpen } from "react-icons/fa";

export default async function Home() {
    const daily = await getDailyWord();

    return (
        <div className="flex min-h-screen flex-col bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 bg-black border-b border-gray-800 p-4 md:p-6 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link
                        href="/chapter/1/1"
                        className="p-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                        title="Read the Word"
                    >
                        <FaBookOpen size={20} />
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold">
                        Eternal Word
                    </h1>
                    <div className="w-32"></div>
                </div>
            </header>

            {/* Daily Verse Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
                <div className="max-w-4xl w-full flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        {/* dangerouslySetInnerHTML renders the <i> tags from the API correctly */}
                        <div
                            className="text-2xl md:text-4xl font-serif leading-relaxed italic"
                            dangerouslySetInnerHTML={{ __html: `&ldquo;${daily.text}&rdquo;` }}
                        />

                        <p className="text-lg md:text-xl font-semibold text-gray-400">
                            {daily.bookName} {daily.chapterNumber}:{daily.verseNumber}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
