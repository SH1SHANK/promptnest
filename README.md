# Promptium

Promptium is a Manifest V3 Chrome extension for managing prompts and exporting chat content across modern LLM web apps.

It combines a reusable prompt library, semantic search, built-in templates, optional Gemini-based prompt improvement, and multi-format export in one workflow.

## Table of Contents

- [Extension Overview](#extension-overview)
- [Core Capabilities](#core-capabilities)
- [Supported Platforms](#supported-platforms)
- [How Promptium Works](#how-promptium-works)
- [Requirements](#requirements)
- [Installation and Setup](#installation-and-setup)
- [Detailed Usage Guide](#detailed-usage-guide)
- [Development Workflow](#development-workflow)
- [Detailed Folder Structure](#detailed-folder-structure)
- [Data, Privacy, and Permissions](#data-privacy-and-permissions)
- [Troubleshooting](#troubleshooting)
- [Related Project Docs](#related-project-docs)

## Extension Overview

Promptium is designed for users who frequently work inside ChatGPT, Claude, Gemini, Perplexity, and Copilot and need repeatable workflows for:

- Capturing and organizing prompts
- Finding old prompts quickly using keywords or semantic similarity
- Refining prompts before use
- Exporting selected parts of conversations in clean formats

The extension ships with three user-facing surfaces:

- Popup: quick actions and lightweight prompt/history access
- Side panel: full workspace for prompts, tags, history, export, and settings
- In-page content tools: floating action button (FAB), selection helpers, and prompt injection on supported sites

## Core Capabilities

### 1. Prompt Library

- Save prompts from the active page or extension UI
- Edit, delete, and tag prompts
- Reuse saved prompts by injecting them back into supported chat inputs

### 2. Semantic Search

- Uses on-device embeddings (Transformers.js) for meaning-based retrieval
- Ranks prompts by cosine similarity
- Falls back to deterministic keyword matching if semantic search is unavailable

### 3. Prompt Improvement

- Improves draft prompts using Gemini (`gemini-2.0-flash-lite`)
- Supports style presets (general, coding, study, creative)
- Returns results to a diff modal so users can review before saving/replacing/injecting

### 4. Template System

- Includes curated built-in prompt templates
- Templates are searchable and can be added to personal prompt storage
- Data-driven registry in `utils/templates.js` for easy extension

### 5. Chat Export

- Select message ranges directly on supported chat pages
- Export to Markdown, Text, JSON, or PDF
- Configure metadata, content mode, fonts, theme/background, and filename

## Supported Platforms

Promptium currently targets:

- ChatGPT (`chatgpt.com`)
- Claude (`claude.ai`)
- Gemini (`gemini.google.com`)
- Perplexity (`www.perplexity.ai`)
- Copilot (`copilot.microsoft.com`)

## How Promptium Works

High-level flow:

1. Content scripts run on supported LLM pages and provide in-page actions (save, improve, export, inject).
2. Popup and side panel UIs read/write extension state via shared utilities.
3. Background service worker handles:
   - Runtime coordination and message routing
   - Gemini API requests
   - Semantic embedding lifecycle
4. Data is stored locally in Chrome extension storage.

Key storage model:

- `chrome.storage.local`: persistent prompts/history/settings/API key/cache
- `chrome.storage.session`: short-lived side panel payload handoffs for export workflows

## Requirements

- Google Chrome with extension developer mode enabled
- Node.js and `pnpm` for local development tasks
- Gemini API key only if using Prompt Improvement features

## Installation and Setup

### 1. Clone and install dependencies

```bash
git clone <https://github.com/sh1shank/promptium>
cd Promptium
pnpm install
```

### 2. Build side panel CSS

Promptium uses Tailwind for side panel styles. Build once before loading:

```bash
pnpm build:sidepanel-css
```

For active development:

```bash
pnpm watch:sidepanel-css
```

### 3. Load extension in Chrome

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the project root folder (`Promptium`)

### 4. Verify installation

1. Open any supported LLM site
2. Confirm Promptium FAB appears on page
3. Click the extension icon and open the side panel

### 5. Optional Gemini setup

1. Open Promptium side panel
2. Go to `Settings`
3. Add your Gemini API key
4. Use Improve Prompt from side panel or FAB workflows

## Detailed Usage Guide

### A. In-page workflow (fastest path)

1. Open a supported chat page.
2. Use Promptium FAB actions to:
   - Save active prompt/content
   - Open Promptium workspace
   - Improve a draft prompt
   - Export selected messages
3. For export, mark message ranges in-page, then open export view and download.

### B. Side panel workflow (full workspace)

Main sections (hash-routable):

- `#prompts`: prompt library management and search
- `#history`: stored chat interaction history
- `#export`: preview and export selected payloads
- `#tags`: tag management and filtering
- `#settings`: feature toggles, API key, AI readiness

Typical side panel flow:

1. Search prompts (keyword + semantic if enabled)
2. Open a prompt and inject into active tab
3. Improve prompt quality if needed
4. Save final version back to library
5. Export selected conversation segments when required

### C. Popup workflow (quick actions)

Use popup for lightweight access when you do not need the full side panel:

- Quick prompt/history interactions
- Onboarding shortcuts
- Fast navigation into side panel for deeper tasks

## Development Workflow

### Available scripts

- `pnpm build:sidepanel-css`: one-time/minified side panel stylesheet build
- `pnpm watch:sidepanel-css`: watch mode while editing `src/input.css`

### Typical local dev loop

1. Run `pnpm watch:sidepanel-css` in one terminal.
2. Make code changes.
3. Reload extension from `chrome://extensions` (click reload on Promptium).
4. Refresh target LLM tab to re-run content scripts.

### Extension entry points

- `manifest.json`: extension registration, permissions, script wiring, icons
- `background/service_worker.js`: runtime orchestration and AI handlers
- `content/content.js`: page lifecycle + selection/export handoff
- `popup/popup.html`: popup shell
- `sidepanel/sidepanel.html`: full workspace shell

## Detailed Folder Structure

```text
Promptium/
├── background/
│   └── service_worker.js       # MV3 service worker; AI requests, search orchestration, messaging
├── content/
│   ├── content.js              # Host-page runtime, selection flow, side panel handoff
│   ├── injector.js             # Prompt injection into supported chat composers
│   ├── scraper.js              # Conversation scraping and normalization
│   ├── toolbar.js              # Floating action button actions and UI wiring
│   ├── fab.css                 # Floating action button styles
│   └── toolbar.css             # Toolbar/selection styles
├── icons/
│   ├── promptium/              # Extension icons referenced by manifest (16/32/48/128)
│   ├── promptium-logo.png      # Source brand logo asset
│   └── icon16|32|48|128.png    # Additional generated icon set
├── libs/
│   ├── jspdf.min.js            # PDF generation library
│   ├── markdown-it.min.js      # Markdown rendering
│   ├── transformers.min.js     # On-device embeddings runtime
│   └── turndown.js             # HTML -> Markdown conversion
├── popup/
│   ├── popup.html              # Popup markup
│   ├── popup.js                # Popup interactions and actions
│   ├── popup.css               # Popup styles
│   ├── onboarding.js           # Onboarding flow logic
│   └── onboarding.css          # Onboarding styles
├── sidepanel/
│   ├── sidepanel.html          # Side panel app shell
│   ├── sidepanel.js            # Main Promptium workspace logic
│   └── tailwind.css            # Built output from src/input.css
├── src/
│   └── input.css               # Tailwind input source for side panel styling
├── utils/
│   ├── ai-bridge.js            # UI -> background AI bridge wrappers
│   ├── ai.js                   # Shared AI/status helpers
│   ├── constants.js            # Shared platform/constants declarations
│   ├── dom-helpers.js          # Reusable DOM helpers
│   ├── exporter.js             # Markdown/PDF/JSON/TXT export transforms
│   ├── platform.js             # Platform detection and context helpers
│   ├── storage.js              # Prompt/history storage CRUD helpers
│   ├── tags.js                 # Tag generation/normalization helpers
│   └── templates.js            # Built-in prompt template catalog
├── manifest.json               # Chrome extension manifest (MV3)
├── package.json                # Project metadata + scripts
├── tailwind.config.js          # Tailwind configuration
├── FEATURES.md                 # Feature catalog
├── ARCHITECTURE.md             # Architecture and dataflow reference
├── MODELS.md                   # AI model and intelligence layer notes
└── README.md                   # This file
```

## Data, Privacy, and Permissions

### Local-first data handling

- Prompt and history data is stored in extension storage, not a separate backend
- Semantic embeddings are generated locally in extension context
- Export payloads are staged through extension storage/session channels

### External calls

- Gemini API is called only for improvement/generation flows that require it
- Calls are routed through the background service worker, not page context

### Permissions used (manifest)

- `storage`: persist prompts, history, settings, keys, cache
- `activeTab` + `scripting`: interact with active supported tabs
- `downloads`: save export files
- `sidePanel`: open and control side panel UI

## Troubleshooting

### Extension UI not updating after edits

1. Re-run `pnpm build:sidepanel-css` if style changes are not reflected.
2. Reload the extension in `chrome://extensions`.
3. Refresh the target chat tab.

### Semantic search not returning results

- Confirm prompts are saved (empty library returns empty semantic matches)
- Check AI/semantic status in Promptium settings UI
- Retry after model initialization finishes

### Improve Prompt fails

- Verify Gemini key in `Settings`
- Check network availability
- Retry from side panel and review error message shown by Promptium

### Export shows no messages

- Re-select message ranges on the source chat page
- Trigger Export Selected again from FAB
- Open side panel `#export` tab to confirm payload loaded

## Related Project Docs

- [FEATURES.md](FEATURES.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [MODELS.md](MODELS.md)
