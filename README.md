# Eternal Word

Eternal Word is a modern, minimalist web application for daily Bible reading and study. Built with Next.js and Tailwind CSS, it provides a clean, distraction-free environment to engage with the Scriptures.

## High-Level Features

- **Daily Verse**: Start each day with a randomly selected verse of Scripture.
- **Full Chapter Reading**: Navigate to any chapter in the Bible for deeper study.
- **Multiple Translations**: Choose from various Bible translations including NKJV, KJV, and others.
- **Reading Streak**: Keep track of your daily reading habits with a built-in streak counter.
- **Smart Navigation**: Easily switch between books and chapters with an intuitive selector.
- **Distraction-Free Design**: A dark-mode, minimalist interface focused entirely on the text.

## Features Breakdown

### 🕊️ Daily Verse
Every time you visit the homepage, a random verse is selected to inspire and encourage you. The verse is cached locally for the day to ensure consistency as you return to the app.

### 📖 Comprehensive Library
Access the full text of the Bible, organized by Old and New Testament. The app includes a robust chapter selector that allows you to jump to any book and chapter quickly.

### 🌍 Translation Support
Toggle between different translations on the fly while reading a chapter. Your translation preference is saved locally, so your favorite version is always ready when you return.

### ⚡ Streak Tracking
The app automatically tracks your daily reading streak using local storage. Seeing your progress helps build a consistent habit of engaging with the Word.

### 🛠️ Advanced Text Processing
Includes custom logic to clean up text from various API sources, such as removing Strong's numbers from the KJV or separating embedded comments from the main verse text for better readability.

## Local Development

Follow these steps to get the project running on your local machine.

### Prerequisites

- **Node.js**: Version 18.x or later
- **npm** or **yarn** or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/eternal-word.git
   cd eternal-word
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **API**: Powered by [Bolls.life](https://bolls.life/api/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Contributing

Contributions are welcome! If you have suggestions for new features or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
