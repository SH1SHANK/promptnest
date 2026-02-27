/**
 * File: utils/constants.js
 * Purpose: Shared constants used across multiple extension contexts.
 */

const PLATFORM_LABELS = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  copilot: 'Copilot'
};

const SUPPORTED_URLS = [
  'https://chatgpt.com/',
  'https://claude.ai/',
  'https://gemini.google.com/',
  'https://www.perplexity.ai/',
  'https://copilot.microsoft.com/'
];

if (typeof window !== 'undefined') {
  window.PLATFORM_LABELS = PLATFORM_LABELS;
  window.SUPPORTED_URLS = SUPPORTED_URLS;
}
