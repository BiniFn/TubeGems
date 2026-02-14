<p align="center">
  <img src="https://raw.githubusercontent.com/BiniFn/TubeGems/main/assets/banner.png" alt="TubeGems Banner" width="100%">
</p>

<h1 align="center">💎 TubeGems</h1>

<p align="center">
  <strong>The ultimate AI-powered YouTube intelligence toolkit. Summarize, extract, and archive in seconds.</strong>
</p>

<p align="center">
  <a href="https://github.com/BiniFn/TubeGems/stargazers"><img src="https://img.shields.io/github/stars/BiniFn/TubeGems?style=for-the-badge&logo=github&color=6e5494" alt="Stars"></a>
  <a href="https://github.com/BiniFn/TubeGems/network/members"><img src="https://img.shields.io/github/forks/BiniFn/TubeGems?style=for-the-badge&logo=github&color=6e5494" alt="Forks"></a>
  <a href="https://github.com/BiniFn/TubeGems/blob/main/LICENSE"><img src="https://img.shields.io/github/license/BiniFn/TubeGems?style=for-the-badge&logo=googlesheets&color=34a853" alt="License"></a>
  <a href="https://github.com/BiniFn/TubeGems/issues"><img src="https://img.shields.io/github/issues/BiniFn/TubeGems?style=for-the-badge&logo=github&color=ea4335" alt="Issues"></a>
  <img src="https://img.shields.io/github/actions/workflow/status/BiniFn/TubeGems/build.yml?style=for-the-badge" alt="Build Status">
</p>

---

## 🚀 Overview
**TubeGems** is a high-performance web application designed to eliminate information overload. Instead of scrubbing through lengthy videos, TubeGems leverages Large Language Models (LLMs) to extract core insights instantly, while providing a suite of high-utility tools for media extraction.

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
* **Backend**: **Node.js** & Express for handling high-concurrency requests.
* **Media Engine**: Integrated with **ytdl-core** and **FFmpeg** for seamless media manipulation.
* **AI Integration**: RESTful communication with OpenAI (GPT-4) or Anthropic (Claude) API.

---

## 📦 Installation & Setup

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher.
* **FFmpeg**: Must be installed on your system path (required for MP3 merging).
* **API Key**: A valid AI provider key (OpenAI/Anthropic).

### 2. Clone & Install
```bash
git clone [https://github.com/BiniFn/TubeGems.git](https://github.com/BiniFn/TubeGems.git)
cd TubeGems
npm install
