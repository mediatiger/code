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
    // Save tab to storage and close it
    const { tab } = request;
    chrome.storage.local.get(['savedTabs'], (result) => {
      const savedTabs = result.savedTabs || [];
      savedTabs.unshift({
        id: Date.now(),
        url: tab.url,
        title: tab.title,
        favicon: tab.favIconUrl,
        savedAt: new Date().toISOString(),
        spaceId: 'inbox'
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
});
