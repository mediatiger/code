// TabZen Background Service Worker
// Handles tab operations and storage

chrome.runtime.onInstalled.addListener(() => {
  console.log('TabZen installed');
});

// Message handler for popup and dashboard communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabs') {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ tabs });
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
        chrome.tabs.remove(tab.id);
        sendResponse({ success: true });
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
    chrome.storage.local.get(['projectOrder'], (result) => {
      chrome.storage.local.set({ projectOrder: request.order }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});
