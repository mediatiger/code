// TabZen Background Service Worker
// Handles tab operations and storage

chrome.runtime.onInstalled.addListener(() => {
  console.log('TabZen installed');
  // Set default settings
  chrome.storage.local.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.local.set({ settings: { lang: 'ru' } });
    }
  });
});

// Message handler for popup and dashboard communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabs') {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ tabs });
    });
    return true;
  }

  if (request.action === 'getOpenTabs') {
    // Get all tabs from all windows, excluding chrome:// and extension pages
    chrome.tabs.query({}, (tabs) => {
      const filtered = tabs.filter(t =>
        t.url &&
        !t.url.startsWith('chrome://') &&
        !t.url.startsWith('chrome-extension://') &&
        !t.url.startsWith('about:') &&
        !t.url.startsWith('edge://')
      );
      sendResponse({ tabs: filtered });
    });
    return true;
  }

  if (request.action === 'saveAndClose') {
    const { tab } = request;
    chrome.storage.local.get(['savedTabs'], (result) => {
      const savedTabs = result.savedTabs || [];
      savedTabs.unshift({
        id: Date.now(),
        url: tab.url,
        title: tab.title,
        favicon: tab.favIconUrl,
        savedAt: new Date().toISOString(),
        spaceId: request.spaceId || 'inbox'
      });
      chrome.storage.local.set({ savedTabs }, () => {
        if (tab.id) chrome.tabs.remove(tab.id);
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.action === 'saveTab') {
    // Save without closing
    const { tab } = request;
    chrome.storage.local.get(['savedTabs'], (result) => {
      const savedTabs = result.savedTabs || [];
      // Avoid duplicates by URL
      if (!savedTabs.some(t => t.url === tab.url)) {
        savedTabs.unshift({
          id: Date.now() + Math.random(),
          url: tab.url,
          title: tab.title,
          favicon: tab.favIconUrl || tab.favicon,
          savedAt: new Date().toISOString(),
          spaceId: request.spaceId || 'inbox'
        });
        chrome.storage.local.set({ savedTabs }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: true, duplicate: true });
      }
    });
    return true;
  }

  if (request.action === 'saveAllTabs') {
    // Save all open tabs as a session
    chrome.tabs.query({}, (tabs) => {
      const validTabs = tabs.filter(t =>
        t.url &&
        !t.url.startsWith('chrome://') &&
        !t.url.startsWith('chrome-extension://') &&
        !t.url.startsWith('about:') &&
        !t.url.startsWith('edge://')
      );

      chrome.storage.local.get(['savedTabs'], (result) => {
        const savedTabs = result.savedTabs || [];
        const existingUrls = new Set(savedTabs.map(t => t.url));
        let added = 0;

        validTabs.forEach((tab, i) => {
          if (!existingUrls.has(tab.url)) {
            savedTabs.unshift({
              id: Date.now() + i,
              url: tab.url,
              title: tab.title,
              favicon: tab.favIconUrl,
              savedAt: new Date().toISOString(),
              spaceId: request.spaceId || 'inbox'
            });
            added++;
          }
        });

        chrome.storage.local.set({ savedTabs }, () => {
          if (request.closeTabs) {
            const tabIds = validTabs.map(t => t.id);
            // Keep at least one tab open
            if (tabIds.length > 0) {
              chrome.tabs.create({ url: 'dashboard.html' }, () => {
                chrome.tabs.remove(tabIds);
              });
            }
          }
          sendResponse({ success: true, added, total: validTabs.length });
        });
      });
    });
    return true;
  }

  if (request.action === 'getSavedTabs') {
    chrome.storage.local.get(['savedTabs'], (result) => {
      sendResponse({ tabs: result.savedTabs || [] });
    });
    return true;
  }

  if (request.action === 'deleteSavedTab') {
    chrome.storage.local.get(['savedTabs'], (result) => {
      const savedTabs = (result.savedTabs || []).filter(t => t.id !== request.tabId);
      chrome.storage.local.set({ savedTabs }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.action === 'moveTabToSpace') {
    chrome.storage.local.get(['savedTabs'], (result) => {
      const savedTabs = result.savedTabs || [];
      const tab = savedTabs.find(t => t.id === request.tabId);
      if (tab) {
        tab.spaceId = request.spaceId;
      }
      chrome.storage.local.set({ savedTabs }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.action === 'reorderProjects') {
    chrome.storage.local.set({ projectOrder: request.order }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'getSettings') {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse({ settings: result.settings || { lang: 'ru' } });
    });
    return true;
  }

  if (request.action === 'saveSettings') {
    chrome.storage.local.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'closeTab') {
    chrome.tabs.remove(request.tabId, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
