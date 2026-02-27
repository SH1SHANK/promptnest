# Architecture

PromptNest is a Manifest V3 Chrome Extension. The architecture is split into multiple distinct areas, allowing secure cross-communication between content scripts inside web pages and background services.

## Directory Structure

```text
├── background/
│   └── service_worker.js   # Main background script (handles API requests, indexing)
├── content/
│   ├── content.js          # Injected logic to interface with the DOM of AI platforms
│   ├── injector.js         # DOM polling, floating toolbar injection, and scraping logic
│   └── toolbar.css         # Styling for the floating in-page UI
├── popup/
│   ├── popup.html          # Extension quick-access popup
│   ├── popup.js            # General UI logic, rendering of cards
│   └── popup.css           # Core styling and animation primitives
├── sidepanel/
│   ├── sidepanel.html      # Persistent side-panel structure
│   └── sidepanel.js        # Advanced control sets (Exports, settings, Improve Prompt UI)
├── utils/
│   ├── ai.js               # Helper functions to normalize tags, search, and parse NLP
│   ├── constants.js        # Global configuration, selector strings for supported hosts
│   ├── dom-helpers.js      # Extraction utilities for reading messages from chat DOMs
│   ├── exporter.js         # Chat formatting engine (MD, TXT, JSON, PDF via html2pdf)
│   ├── platform.js         # Site-specific messaging bridges
│   └── storage.js          # Abstraction wrapper around chrome.storage.local
└── manifest.json           # Extension configuration metadata
```

## Core Workflows

### 1. In-Page Injection and Scraping
When you visit a supported URL (like `chatgpt.com`), `manifest.json` activates `content.js`. 
- `injector.js` watches the DOM via a `MutationObserver` to attach the floating toolbar as soon as the interface is ready.
- If the user clicks **Export**, it calls `dom-helpers.js` to scrape the proprietary internal DOM structure of the host page (identifying User messages versus AI messages).
- Raw data is sent into a `chrome.runtime.sendMessage` event to open the Side Panel UI.

### 2. Export Generation
The `exporter.js` engine reads standard chat payloads.
- It parses user options (e.g., message numbering, timestamps).
- For text models (Markdown, TXT, JSON), it generates Blobs or serializes data.
- For PDF models, it applies a hidden HTML iframe rendering template, styled beautifully, and uses `html2pdf.js` to trigger a local browser download.

### 3. API Communication
Prompt improvement uses the Gemini API.
- The Side Panel sends an action (`enhancePrompt`) via `chrome.runtime.sendMessage`.
- The background `service_worker.js` intercepts this rule. Wait, why background? Content Security Policy (CSP) headers on sites like ChatGPT completely block outbound network requests.
- Escaping to the background service worker removes the CSP block, safely contacts the Gemini API, and passes the polished payload back up to the frontend UI modal.

## Design Philosophy

- **Vanilla JS**: No heavy frameworks like React or Vue are needed. The entire UI relies on fast DOM operations, ensuring a lightweight and incredibly fast payload size.
- **Tailwind Principles**: CSS architecture avoids massive monolithic classes for highly-reusable atomic-like structures and variable definitions.
