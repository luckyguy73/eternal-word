import ReadWordLink from "@/components/ReadWordLink";
import DailyVerse from "@/components/DailyVerse";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 bg-black border-b border-gray-800 z-10">
                <div className="max-w-4xl mx-auto h-24 md:h-34 flex items-center justify-center relative px-4 md:px-6">
                    <ReadWordLink />

                    <h1 className="text-3xl md:text-4xl font-bold text-center">
                        Eternal Word
                    </h1>
                </div>
            </header>

            {/* Daily Verse Content */}
            <DailyVerse />
        </div>
    );
}
