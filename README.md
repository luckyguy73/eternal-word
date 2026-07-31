# Eternal Word

Eternal Word is a modern, minimalist web application for daily Bible reading and study. Built with Next.js 15, Tailwind CSS 4, and TypeScript, it provides a clean, distraction-free environment to engage with the Scriptures.

## 🚀 Live Demo

Experience the application at: [https://eternalword.vercel.app/](https://eternalword.vercel.app/)

## ✨ Key Features

- **🕊️ Daily Verse**: Start each day with a randomly selected verse of Scripture, cached locally to stay consistent throughout your day.
- **🔍 Context-Safe Exploration**: Explore the chapter context of the daily verse without overwriting your current reading position. Automatically scrolls to the relevant verse.
- **📚 Personal Library**: A dedicated space for your saved verses and passages.
    - **💾 One-Tap Saving**: Save or unsave any verse by simply clicking its verse number in the reading view—a convenient toggle for quick study.
    - **🎨 Visual Cues**: Saved verses are highlighted in **orange**, while the Daily Verse is highlighted in **yellow** when viewed in context, helping you stay oriented.
    - **🏷️ Smart Tagging**: Organize your collection with custom tags. Add and remove tags to categorize your study.
    - **⚡ Tag Filtering**: Use the integrated Tag Bar to filter your library by specific topics or categories.
- **📖 Full Chapter Reading**: Seamlessly navigate through any book and chapter of the Bible.
- **🌍 Multiple Translations**: Choose from various translations (NKJV, KJV, etc.). Preferences are persisted across sessions.
- **📱 Intuitive Navigation**: A sleek bottom navigation bar for quick access to Home, Bible, and your Personal Library.
- **⚡ Streak Tracking**: Build a consistent habit with an automated daily reading streak counter.
- **🌓 Distraction-Free Design**: A high-performance, dark-mode interface optimized for readability and focus.
- **📦 Smart Caching**: Integrated verse caching for smooth navigation and reduced API latency.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Validation**: [Zod](https://zod.dev) for robust API response handling and domain type safety.
- **State Management**: React Context API with custom hooks for persistence and synchronization.
- **API**: Powered by the [Bolls.life](https://bolls.life/api/) Bible API.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Deployment**: [Vercel](https://vercel.com)

## 🏗️ Architecture & Best Practices

Eternal Word is built with industry-standard patterns to ensure maintainability and scalability:

- **Repository Pattern**: Centralized data fetching and transformation logic in \`src/providers/data/repository.ts\`.
- **Type Safety**: Domain models are derived directly from Zod schemas, ensuring a single source of truth for data structures.
- **Persistent State**: A custom \`usePersistentState\` hook handles seamless synchronization between React state and \`localStorage\`.
- **Component-Based UI**: Atomic design principles with reusable components for grids, overlays, and typography.
- **Error Boundaries**: Robust error handling to ensure a graceful user experience.

## 💻 Local Development

### Prerequisites

- **Node.js**: Version 18.x or later
- **Package Manager**: npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/your-username/eternal-word.git
   cd eternal-word
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000).

## 🤝 Contributing

Contributions are welcome! Whether it's fixing bugs, adding new translations, or improving the UI, feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
