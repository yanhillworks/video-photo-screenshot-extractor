# 📸 Video Screenshot & Frame Extractor

A lightweight, universal Chrome Extension to instantly capture high-quality, clutter-free screenshots from **YouTube, Instagram, Facebook, Reddit, X (Twitter)**, and generic HTML5 videos.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![Manifest](https://img.shields.io/badge/Manifest-V3-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

* **Universal Support:** Works on YouTube, Instagram (Reels/Stories), Facebook, Reddit, Twitter/X, and generic HTML5 video players.
* **Zero UI Clutter:** Captures the raw video frame directly from the buffer, ignoring overlays, subtitles, buttons, and comments.
* **Smart Hover UI:** The capture button is invisible by default and only appears when you hover over a video, keeping your viewing experience clean.
* **Smart Positioning:** Automatically adjusts button placement (e.g., shifts down on Facebook, moves to avoid YouTube settings) to prevent overlapping native controls.
* **High Quality:** Downloads the frame at the full native resolution of the source video (PNG format).

## 📥 Installation

1.  **Clone or Download** this repository.
    ```bash
    git clone [https://github.com/tanvir63566/video-screenshot.git](https://github.com/tanvir63566/video-screenshot.git)
    ```
2.  Open your browser (Chrome, Brave, Edge) and navigate to `chrome://extensions/`.
3.  Toggle **Developer Mode** on (top right corner).
4.  Click **Load Unpacked**.
5.  Select the folder containing this project.

## 🛠️ How to Use

1.  **Browse:** Go to any website with a video (e.g., YouTube or Instagram).
2.  **Hover:** Move your mouse over the video player.
3.  **Click:** A Camera Icon 📷 will appear in the top-right corner. Click it to download the frame.
    * *Note: If the button doesn't appear immediately, ensure the extension has "All Sites" access in your browser extension settings.*

## 📂 Project Structure

* `manifest.json` - Configuration and permissions (Manifest V3).
* `content.js` - The core logic that injects the button and handles frame capture.
* `icon.png` - Extension toolbar icon.

## 🤝 Contributing

Pull requests are welcome! If you find a website where the button alignment is off, feel free to open an issue or submit a fix.

## 📝 Attribution & License

* **Icons:** Camera icons created by [Freepik - Flaticon](https://www.flaticon.com/free-icons/camera).
* **License:** Distributed under the MIT License.
