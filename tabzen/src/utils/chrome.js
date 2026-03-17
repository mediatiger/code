// Chrome API helpers — safe for both extension and dev contexts

const isChromeExt = typeof chrome !== 'undefined' && chrome.storage;

export async function loadState() {
  if (!isChromeExt) return null;
  try {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tabzen'], (result) => {
        resolve(result.tabzen || null);
      });
    });
  } catch { return null; }
}

export async function saveState(data) {
  if (!isChromeExt) return;
  try {
    return new Promise((resolve) => {
      chrome.storage.local.set({ tabzen: data }, resolve);
    });
  } catch { /* ignore */ }
}

export async function loadSettings() {
  if (!isChromeExt) return null;
  try {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tabzen_settings'], (result) => {
        resolve(result.tabzen_settings || null);
      });
    });
  } catch { return null; }
}

export async function saveSettings(settings) {
  if (!isChromeExt) return;
  try {
    return new Promise((resolve) => {
      chrome.storage.local.set({ tabzen_settings: settings }, resolve);
    });
  } catch { /* ignore */ }
}

export async function getOpenTabs() {
  if (!isChromeExt || !chrome.tabs) return [];
  try {
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
  } catch { return []; }
}

export async function createTab(url) {
  if (!isChromeExt || !chrome.tabs) {
    window.open(url, '_blank');
    return;
  }
  try { return chrome.tabs.create({ url }); } catch { /* ignore */ }
}

export async function closeTab(tabId) {
  if (!isChromeExt || !chrome.tabs) return;
  try { return chrome.tabs.remove(tabId); } catch { /* ignore */ }
}

export async function focusTab(tabId) {
  if (!isChromeExt || !chrome.tabs) return;
  try { return chrome.tabs.update(tabId, { active: true }); } catch { /* ignore */ }
}

export async function getCurrentTab() {
  if (!isChromeExt || !chrome.tabs) return null;
  try {
    return new Promise((resolve) => {
      chrome.tabs.getCurrent((tab) => resolve(tab || null));
    });
  } catch { return null; }
}

export async function closeAllTabsExcept(keepTabId) {
  if (!isChromeExt || !chrome.tabs) return;
  try {
    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const toClose = (tabs || [])
          .filter((t) => t.id !== keepTabId && !t.url?.startsWith('chrome://') && !t.url?.startsWith('chrome-extension://'))
          .map((t) => t.id);
        if (toClose.length) chrome.tabs.remove(toClose, resolve);
        else resolve();
      });
    });
  } catch { /* ignore */ }
}

export async function getTabGroups(groupIds) {
  if (!isChromeExt || !chrome.tabGroups) return {};
  const map = {};
  for (const gid of groupIds) {
    if (gid === -1) continue;
    try {
      const group = await chrome.tabGroups.get(gid);
      map[gid] = { title: group.title || '', color: group.color || '' };
    } catch { /* ignore */ }
  }
  return map;
}

export async function getStorageUsage() {
  if (!isChromeExt) return 0;
  try {
    return new Promise((resolve) => {
      chrome.storage.local.getBytesInUse(null, (bytes) => resolve(bytes || 0));
    });
  } catch { return 0; }
}

export async function exportAllData() {
  if (!isChromeExt) return null;
  try {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tabzen', 'tabzen_settings'], (result) => {
        resolve(result);
      });
    });
  } catch { return null; }
}

export async function importAllData(data) {
  if (!isChromeExt) return;
  try {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve);
    });
  } catch { /* ignore */ }
}
