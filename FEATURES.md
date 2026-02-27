# Features

PromptNest offers a deep feature set designed to enhance the experience of using leading AI chatbots seamlessly inside your browser. Here is a comprehensive overview:

## 1. Supported Platforms

PromptNest auto-detects and injects natively into the major conversational AI platforms:

- **ChatGPT** (`chatgpt.com`)
- **Claude** (`claude.ai`)
- **Gemini** (`gemini.google.com`)
- **Perplexity** (`www.perplexity.ai`)
- **Microsoft Copilot** (`copilot.microsoft.com`)

When you visit any of these pages, PromptNest adds a floating toolbar to the bottom right of the screen.

## 2. In-Page Floating Toolbar

A completely non-intrusive floating action button available on all supported LLM sites.
- **Save Prompts**: Click to quickly save the current prompt you are writing.
- **Export Chat Session**: Easily access export capabilities straight from the active conversation without needing to open the popup.

## 3. On-Device AI (Transformers.js)

PromptNest runs a local, privacy-first AI model directly in your browser using **Transformers.js**. Your saved prompts never leave your device for these operations:
- **Semantic Search**: Find prompts based on their *meaning*, not just exact keyword matches. Searching for "react bug" will find a prompt titled "Fix frontend error".
- **Auto-Tag Suggestions**: When saving a new prompt, the local AI analyzes the text and automatically suggests relevant tags (e.g., `coding`, `creative`, `study`).
- **Smart Duplicate Detection**: Before saving, PromptNest checks if you already have a semantically similar prompt saved and warns you, keeping your library clean.

## 4. Popup & Side Panel Control Center

The PromptNest central UI is accessible as both a traditional Extension Popup and a persistent Side Panel (if supported/configured by your browser).

### Saved Prompts Library
- **Direct Injection**: Click **Inject** to immediately send the saved prompt into the chat window of the supported platform you're viewing.
- **Copy to Clipboard**: Quick, one-click copy button with animated visual feedback.
- **Text Truncation**: Extremely long prompts are elegantly truncated to prevent visual clutter, with an expanding **"Show more"** toggle.

### Chat History Management
- Logs your recent export sessions.
- Displays metadata including message counts, source platform, and relative time of export.
- Quick **Export** button to re-export in your chosen format (PDF/JSON/etc) straight from the history view.

## 5. Advanced Export Controls

Export your entire multi-turn chat sessions exactly how you want them:
- **Formats**: Available in Markdown (`.md`), Plain Text (`.txt`), structured object (`.json`), or rendered Portable Document Format (`.pdf`).
- **Granular Toggles**: 
  - Add or remove message numbering (e.g., `1. `, `2. `) across all formats.
  - Include platform origin labels.
  - Include export timestamps.
- **Direct Clipboard Integration**: A single click copies the entire parsed chat format directly to your system clipboard.
- **Custom Filenames**: Override auto-generated naming conventions (like `promptnest_chatgpt_2026-02-27.md`) with a name of your choice.

## 6. AI "Improve Prompt"

Let an AI system dynamically refine your prompt before you send it:
- A dedicated **Improve** button opens a full comparison modal showing what changes were made.
- **Side-by-side Diff View**: See the original next to the improved version with exact character count differences.
- **Styles**: Choose between **General Polish**, **Coding/Tech**, **Study/Summarize**, and **Creative Writing**.
- **Undo Capability**: A safe "Undo" toast drops in immediately after saving in case you change your mind.

## 7. Modern Clean UI

PromptNest uses an ultra-modern aesthetic standard using Tailwind CSS.
- Completely fully-styled **Dark Mode**.
- Smooth CSS animations, skeleton loaders, and micro-interactions (e.g., copy confirmations, AI visual badges).
- Semantic search score chips, mono-spaced data badges, and floating action menus.
