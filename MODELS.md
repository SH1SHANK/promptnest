# AI Models & Intelligence Layer

PromptNest uses different layers of AI computation to run efficiently within a browser extension environment. The core goal is preserving privacy using on-device operations when possible, while securely tunneling complex tasks to a robust API.

## 1. Local Browser Embedding (Transformers.js)

For standard prompt management operations (like searching for previously saved prompts or determining semantic similarity), PromptNest leverages on-device neural network models using **Transformers.js**.

- **Why**: Keeps your prompt data private and local. Searches are fast and do not drain API credits.
- **Storage**: Vector embeddings (a mathematical representation of your prompt text) are generated in the browser and saved straight into `chrome.storage.local`.
- **Latency**: First-run generation prompts a download of a quantized mini-model (usually ~20MB-30MB) which is cached in the browser permanently unless cleared.

## 2. Gemini API 

For intensive tasks requiring generative text generation, such as the **Improve Prompt** feature, PromptNest connects to the Gemini API.

- **Routing**: API requests are funneled through the Chrome Extension's Background Service Worker.
- **Prompt Engineering**: When a user selects "Coding/Tech" or "Creative Writing", PromptNest automatically wraps the original user prompt with a predefined system message. For example, the Coding prompt forces the model to specify logic, parameters, edge conditions, and outputs while completely preventing conversational filler.
- **Error Handling**: Network failures immediately propagate back to the PromptNest UI, where the specific error message is passed inside a visually styled popup.

## 3. Heuristic NLP Fallbacks

When AI models fail (due to API rate limits, lack of network connection, or configuration errors), PromptNest gracefully degrades to primitive techniques.
- Smart suggestions for tags fall back to regex-based Keyword scans (e.g., matching the word "function" to automatically apply the "coding" tag).
- Semantic search falls back to lowercase sub-string inclusion (`title.includes(term)`).
