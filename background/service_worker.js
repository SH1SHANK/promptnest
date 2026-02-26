/**
 * File: background/service_worker.js
 * Purpose: Initializes storage, configures side panel behavior, and handles extension-level runtime actions.
 * Communicates with: utils/storage.js, popup/popup.js, content/content.js.
 */

const SIDE_PANEL_PATH = 'sidepanel/sidepanel.html';
const SIDEPANEL_SESSION_KEY = 'pnSidePanelPayload';
const ALLOWED_LLM_HOSTS = new Set([
  'chatgpt.com',
  'claude.ai',
  'gemini.google.com',
  'www.perplexity.ai',
  'copilot.microsoft.com'
]);

/** Ensures prompts and chatHistory keys exist in storage without overwriting existing data. */
const initializeStorageKeys = async () => {
  const state = await chrome.storage.local.get(['prompts', 'chatHistory']);
  const updates = {};

  if (!Array.isArray(state.prompts)) {
    updates.prompts = [];
  }

  if (!Array.isArray(state.chatHistory)) {
    updates.chatHistory = [];
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
};

// Manually open the side panel when the user clicks the extension action icon.
// This often works more reliably than the declarative setPanelBehavior API.
chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch((error) => {
      console.error('[PromptNest][ServiceWorker] Failed to open side panel on action click.', error);
    });
  }
});

/** Handles extension install lifecycle and applies initial storage and side panel setup. */
const onInstalled = async () => {
  try {
    await initializeStorageKeys();
  } catch (error) {
    console.error('[PromptNest][ServiceWorker] Initialization failed.', error);
  }
};


/** Opens a new browser tab when content scripts request cross-LLM navigation. */
const handleOpenLlmTab = async (url) => {
  try {
    const parsed = new URL(String(url || ''));

    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return { ok: false, error: 'Invalid tab URL.' };
    }

    if (!ALLOWED_LLM_HOSTS.has(parsed.hostname.toLowerCase())) {
      return { ok: false, error: 'Target host is not allowlisted.' };
    }

    await chrome.tabs.create({ url: parsed.toString() });
    return { ok: true };
  } catch (_error) {
    return { ok: false, error: 'Failed to open requested tab.' };
  }
};

/** Stores side panel payload in trusted service-worker context session storage. */
const handleSetSidePanelPayload = async (payload) => {
  const value = payload && typeof payload === 'object' ? payload : null;

  if (!value || !Array.isArray(value.messages)) {
    return { ok: false, error: 'Invalid side panel payload.' };
  }

  try {
    await chrome.storage.session.set({ [SIDEPANEL_SESSION_KEY]: value });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || 'Failed to persist side panel payload.' };
  }
};

/** Persists payload on side panel action. The panel must be opened manually by clicking the action icon. */
const handleOpenSidePanel = async (_sender, payload = null) => {
  try {
    if (payload && typeof payload === 'object') {
      const persisted = await handleSetSidePanelPayload(payload);

      if (!persisted.ok) {
        return { ok: false, error: persisted.error || 'Payload failed to persist.' };
      }
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || 'Unable to handle payload.' };
  }
};

/** Routes runtime messages and keeps channel open for async response delivery. */
const onRuntimeMessage = (message, sender, sendResponse) => {
  let sidePanelPromise = null;

  if (message?.action === 'OPEN_SIDEPANEL') {
    const windowId = sender?.tab?.windowId;
    if (windowId) {
      // Must be called synchronously to consume gesture
      sidePanelPromise = chrome.sidePanel.open({ windowId, tabId: sender.tab.id }).catch((err) => err);
    }
  }

  void (async () => {
    let responded = false;

    const respond = (payload) => {
      if (responded) {
        return;
      }

      responded = true;

      try {
        sendResponse(payload);
      } catch (_error) {
        return;
      }
    };

    try {
      if (message?.action === 'openLlmTab') {
        respond(await handleOpenLlmTab(message.url));
        return;
      }

      if (message?.action === 'OPEN_SIDEPANEL') {
        const payloadResult = await handleOpenSidePanel(sender, message.payload || null);
        
        // Wait for the synchronous side panel open attempt to settle
        let openError = null;
        if (sidePanelPromise) {
          const result = await sidePanelPromise;
          if (result instanceof Error) {
            openError = result.message;
          }
        }

        if (openError) {
          respond({ ok: false, error: `SidePanel Error: ${openError}` });
          return;
        }

        respond(payloadResult);
        return;
      }

      if (message?.action === 'SET_SIDEPANEL_PAYLOAD') {
        respond(await handleSetSidePanelPayload(message.payload));
        return;
      }

      respond({ ok: false, error: `Unknown action: ${String(message?.action || 'undefined')}` });
    } catch (error) {
      respond({ ok: false, error: error?.message || 'Unexpected service worker failure.' });
    }
  })();

  return true;
};

chrome.runtime.onInstalled.addListener(() => {
  void onInstalled();
});

chrome.runtime.onMessage.addListener(onRuntimeMessage);
