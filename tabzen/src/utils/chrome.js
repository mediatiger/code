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
