// TabZen Background Service Worker (MV3)
// Minimal — most logic lives in the React app via chrome.* APIs directly

chrome.runtime.onInstalled.addListener(() => {
  // Extension installed/updated
});
