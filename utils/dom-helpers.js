/**
 * File: utils/dom-helpers.js
 * Purpose: Shared DOM utility functions used across popup, sidepanel, toolbar, and content scripts.
 * Eliminates duplication of showToast, createEmptyState, createTagPill, byId, and sortNodesByDomOrder.
 */

/** Returns a required DOM node by id. */
const byId = (id) => document.getElementById(id);

/** Creates and displays a short-lived toast message. */
const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'pn-toast';
  toast.textContent = String(message || '').trim();
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 2400);
};

/** Builds reusable empty state markup with icon and copy. */
const createEmptyState = (message) => {
  const stateNode = document.createElement('div');
  stateNode.className = 'pn-empty-state';
  stateNode.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 6.5h16v11H4z"></path>
      <path d="M8 10h8"></path>
      <path d="M8 13h5"></path>
    </svg>
    <p>${String(message || '').trim()}</p>
  `;
  return stateNode;
};

/** Builds a reusable tag pill node. */
const createTagPill = (tag) => {
  const pill = document.createElement('span');
  pill.className = 'pn-tag-pill';
  pill.textContent = String(tag || '').trim();
  return pill;
};

/** Escapes unsafe markup content. */
const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

/** Sorts nodes by their document position order. */
const sortNodesByDomOrder = (nodes) =>
  Array.from(nodes || []).sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  );

/** Returns true when URL is one of supported LLM hosts. */
const isSupportedTabUrl = (url) => {
  const value = String(url || '').toLowerCase();
  return SUPPORTED_URLS.some((prefix) => value.startsWith(prefix));
};

/** Returns active tab metadata used for inject actions. */
const getActiveTabContext = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0] || null;
  return {
    tabId: tab?.id || null,
    url: tab?.url || '',
    supported: isSupportedTabUrl(tab?.url || '')
  };
};

/** Sends one action payload to the active tab content script. */
const sendToActiveTab = async (payload) => {
  const context = await getActiveTabContext();
  if (!context.tabId) {
    return { ok: false, error: 'No active tab found.' };
  }
  try {
    return await chrome.tabs.sendMessage(context.tabId, payload);
  } catch (error) {
    return { ok: false, error: error?.message || 'Unable to reach content script.' };
  }
};

const DomHelpers = {
  byId,
  showToast,
  createEmptyState,
  createTagPill,
  escapeHtml,
  sortNodesByDomOrder,
  isSupportedTabUrl,
  getActiveTabContext,
  sendToActiveTab
};

if (typeof window !== 'undefined') {
  window.DomHelpers = DomHelpers;
}
