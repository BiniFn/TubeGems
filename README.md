<h1 align="center">💎 TubeGems</h1>

<p align="center">
<div align="center">
  <strong>The ultimate AI-powered YouTube intelligence toolkit. Summarize, extract, and archive in seconds.</strong>
  <br><br>
  <strong>------> Made With ❤️ By BiniFn <------</strong>
</div>

<p align="center">
<a href="https://github.com/BiniFn/TubeGems/stargazers">
<img src="https://img.shields.io/github/stars/BiniFn/TubeGems?style=for-the-badge&logo=github&color=6e5494" alt="Stars">
</a>
<a href="https://github.com/BiniFn/TubeGems/network/members">
<img src="https://img.shields.io/github/forks/BiniFn/TubeGems?style=for-the-badge&logo=github&color=6e5494" alt="Forks">
</a>
<a href="https://github.com/BiniFn/TubeGems/blob/main/LICENSE">
  <img src="https://img.shields.io/badge/License-Apache--2.0-D22128?style=for-the-badge&logo=apache" alt="Apache-2.0 License">
</a>
</p>

<br />

## 🚀 Overview

**TubeGems** is a high-performance web application designed to eliminate information overload. Instead of scrubbing through lengthy videos, TubeGems uses Large Language Models (LLMs) to extract core insights instantly, while offering a set of practical tools for media extraction.

**🔗 Website:** [https://tubegems.onrender.com/](https://tubegems.onrender.com/)

### ✨ Core Functionalities

* 🤖 **Intelligent Summarization**: Processes video transcripts via AI to provide structured bullet points, key takeaways, and action items.
* 🎧 **Lossless Audio Extraction**: Converts YouTube streams into high-bitrate MP3s for offline listening.
* 📥 **Smart Video Downloader**: Multi-resolution support (HD/4K) with optimized stream buffering.
* 🖼️ **Thumbnail Gallery**: Fetches original `maxresdefault` artwork for high-quality assets.
* ⚡ **Speed Optimized**: Minimalist, high-speed UI built for both desktop and mobile efficiency.

---

## 🛠 Technical Architecture

### Tech Stack

* **Frontend**: [React.js](https://reactjs.org/) with **TypeScript** (TSX) for robust type-safety.
* **Styling**: **Tailwind CSS** using a modern glassmorphism design language.
* **Backend**: **Node.js** & **Express** for handling high-concurrency requests.
* **Media Engine**: Integrated with **yt-dlp** and **FFmpeg** for resilient media extraction and processing.
* **AI Integration**: RESTful communication with OpenAI (GPT-4) or Anthropic (Claude) API.

---

## 📦 Installation & Setup

### 1. Prerequisites

* **Node.js**: v18.0.0 or higher.
* **FFmpeg**: Must be installed on your system path (required for MP3 merging and media processing).
* **API Key**: A valid AI provider key (OpenAI or Anthropic).

### 2. Clone the Repository

```bash
git clone [https://github.com/BiniFn/TubeGems.git](https://github.com/BiniFn/TubeGems.git)
cd TubeGems

```

### 3. Install Dependencies

```bash
npm install

```

### 4. Configuration

Create a `.env` file in the root directory and add your API keys:

```env
OPENAI_API_KEY=your_key_here
# or
ANTHROPIC_API_KEY=your_key_here

```

### 5. Build and Run

**Development:**

```bash
npm run dev

```

**Production Build:**

```bash
npm run build
npm start

```

---

### ⚠️ Known Issues

* **Downloader Stability**: Due to frequent updates to YouTube's infrastructure, the video download and audio extraction features may occasionally fail.
* **Status**: Currently, the **Thumbnail Extractor** and **AI Summarizer** are fully functional. We use the actively maintained `yt-dlp` extractor stack to keep download support stable as YouTube changes.

---

### 🗺️ Roadmap

* [ ] 🌍 **Multi-language Support**: Summaries in 15+ major global languages.
* [ ] 📊 **Interactive Timestamps**: Clickable points that jump to specific video moments.
* [ ] 🎬 **Playlist Support**: Batch download and summarize entire YouTube playlists.
* [ ] 🔐 **User Accounts**: Personal dashboard to save "gems" and search history.
* [ ] ⚡ **Enhanced Engine**: Transition to Rust-based processing for even faster extraction.

---

### 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature.'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

### 📜 License & Credits

Distributed under the **MIT License**. Created by [BiniFn](https://github.com/BiniFn).

> **Disclaimer:** This tool is for educational purposes only. Please adhere to YouTube's Terms of Service and only download content you have the right to access.
