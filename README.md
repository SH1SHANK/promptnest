# PromptNest

![Manifest V3](https://img.shields.io/badge/Manifest-V3-1f2937?style=flat-square)
![Multi-LLM](https://img.shields.io/badge/Multi--LLM-Supported-1f2937?style=flat-square)
![On-Device AI](https://img.shields.io/badge/On--Device-AI-1f2937?style=flat-square)
![Gemini API](https://img.shields.io/badge/Gemini-API-1f2937?style=flat-square)

PromptNest is a Chrome Extension designed for power users of Large Language Models (LLMs). It acts as a central hub for saving prompts, exporting chat sessions, and improving your prompts using AI, all directly inside your browser. It features a beautifully crafted popup/side panel control center and an unobtrusive in-page toolbar that seamlessly integrates with major LLM platforms.

## Key Features

- **Multi-Platform Support**: Works seamlessly with ChatGPT, Claude, Gemini, Perplexity, and Microsoft Copilot.
- **Universal Toolbar**: An in-page floating toolbar for quick access to saving prompts and exporting chats.
- **Advanced Exporting**: Export your entire chat history in multiple formats (Markdown, PDF, Plain Text, JSON) or copy directly to your clipboard.
- **On-Device AI (Transformers.js)**: Runs a local, private neural network right in your browser for lightning-fast **Semantic Search**, **Auto-Tag Suggestions**, and **Duplicate Prompt Detection** without ever sending your prompts to the cloud.
- **AI Prompt Improvement**: Select a style (Coding, Creative, Study, or General) and let the Gemini API refine and enhance your prompts before you send them.
- **Smart Management**: Organize your prompts with tags, find exactly what you need with meaning-based search (not just keyword matching), and inject them directly into your active chat window.
- **100+ Curated Templates**: Ships with a built-in library of expert prompt templates across Engineering & CAD, 3D Modeling, Design, Coding, Writing, Study, Career, Productivity, Data Analysis, and Daily Life — save any template to your personal library with one click.

For a detailed breakdown of all features, refer to the [FEATURES.md](./FEATURES.md) file.

## Installation Instructions

PromptNest is currently a developer preview. To install it locally:

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the `promptnest` folder (the directory containing `manifest.json`).
6. The extension will install. Pin PromptNest to your toolbar for quick access!

## Documentation

To help you navigate and understand the project, check out these detailed docs:

- [FEATURES.md](./FEATURES.md) - Comprehensive list of features and capabilities.
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design, extension structure, and data flow.
- [MODELS.md](./MODELS.md) - Details on AI integration, local models vs APIs.

## Privacy & Data

- **Local Storage**: All your saved prompts and chat histories are stored locally using `chrome.storage.local`.
- **API Usage**: AI prompt improvement uses the requested API (e.g., Gemini API). Communication happens via service workers, keeping your keys and queries secure within your browser environment.

## License

MIT License. See [LICENSE](./LICENSE) for details.
