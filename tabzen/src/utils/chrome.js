// Chrome API helpers — safe for both extension and dev contexts

const isChromeExt = typeof chrome !== 'undefined' && chrome.storage;

export async function loadState() {
  if (!isChromeExt) return null;
  return new Promise((resolve) => {
    chrome.storage.local.get(['tabzen'], (result) => {
      resolve(result.tabzen || null);
    });
  });
}

export async function saveState(data) {
  if (!isChromeExt) return;
  return new Promise((resolve) => {
    chrome.storage.local.set({ tabzen: data }, resolve);
  });
}

export async function loadSettings() {
  if (!isChromeExt) return null;
  return new Promise((resolve) => {
    chrome.storage.local.get(['tabzen_settings'], (result) => {
      resolve(result.tabzen_settings || null);
    });
  });
}

export async function saveSettings(settings) {
  if (!isChromeExt) return;
  return new Promise((resolve) => {
    chrome.storage.local.set({ tabzen_settings: settings }, resolve);
  });
}

export async function getOpenTabs() {
  if (!isChromeExt || !chrome.tabs) return [];
  return new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      resolve(
        (tabs || []).filter(
          (t) =>
            t.url &&
            !t.url.startsWith('chrome://') &&
            !t.url.startsWith('chrome-extension://') &&
            !t.url.startsWith('about:') &&
            !t.url.startsWith('edge://')
        )
      );
    });
  });
}

export async function createTab(url) {
  if (!isChromeExt || !chrome.tabs) {
    window.open(url, '_blank');
    return;
  }
  return chrome.tabs.create({ url });
}

export async function closeTab(tabId) {
  if (!isChromeExt || !chrome.tabs) return;
  return chrome.tabs.remove(tabId);
}

export async function focusTab(tabId) {
  if (!isChromeExt || !chrome.tabs) return;
  return chrome.tabs.update(tabId, { active: true });
}

export async function getCurrentTab() {
  if (!isChromeExt || !chrome.tabs) return null;
  return new Promise((resolve) => {
    chrome.tabs.getCurrent((tab) => resolve(tab || null));
  });
}

export async function closeAllTabsExcept(keepTabId) {
  if (!isChromeExt || !chrome.tabs) return;
  return new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const toClose = (tabs || [])
        .filter((t) => t.id !== keepTabId && !t.url?.startsWith('chrome://') && !t.url?.startsWith('chrome-extension://'))
        .map((t) => t.id);
      if (toClose.length) chrome.tabs.remove(toClose, resolve);
      else resolve();
    });
  });
}
