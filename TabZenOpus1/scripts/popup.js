// TabZen Popup — Minimal Micro-Actions with i18n

const popupI18n = {
  ru: {
    save_close: 'Сохранить и закрыть',
    send_to_space: 'В пространство',
    open_tabzen: 'Открыть TabZen',
    save_all: 'Сохранить все вкладки',
  },
  en: {
    save_close: 'Save & Close Tab',
    send_to_space: 'Send to Space',
    open_tabzen: 'Open TabZen',
    save_all: 'Save All Tabs',
  }
};

function pt(key, lang) {
  return popupI18n[lang]?.[key] || popupI18n.en[key] || key;
}

document.addEventListener('DOMContentLoaded', () => {
  // Load language setting then render
  chrome.storage.local.get(['settings'], (result) => {
    const lang = result?.settings?.lang || 'ru';
    renderPopup(lang);
  });
});

function renderPopup(lang) {
  const root = document.getElementById('popup-root');

  root.innerHTML = `
    <div class="popup">
      <div class="popup-header">
        <div class="popup-logo">◈</div>
        <span class="popup-title">TabZen</span>
      </div>

      <div class="popup-actions">
        <button class="popup-btn primary" id="save-close-btn">
          <span class="popup-btn-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3v10M3 8l5 5 5-5"/>
            </svg>
          </span>
          <span>${pt('save_close', lang)}</span>
          <span class="popup-btn-hint">⌘S</span>
        </button>

        <button class="popup-btn" id="save-all-btn">
          <span class="popup-btn-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="12" height="12" rx="2"/>
              <path d="M6 6h4M6 10h4"/>
            </svg>
          </span>
          <span>${pt('save_all', lang)}</span>
        </button>

        <button class="popup-btn" id="open-dashboard-btn">
          <span class="popup-btn-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="5" height="5" rx="1"/>
              <rect x="9" y="2" width="5" height="5" rx="1"/>
              <rect x="2" y="9" width="5" height="5" rx="1"/>
              <rect x="9" y="9" width="5" height="5" rx="1"/>
            </svg>
          </span>
          <span>${pt('open_tabzen', lang)}</span>
        </button>
      </div>
    </div>
  `;

  // Save & Close current tab
  document.getElementById('save-close-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      chrome.runtime.sendMessage({
        action: 'saveAndClose',
        tab: { id: tab.id, url: tab.url, title: tab.title, favIconUrl: tab.favIconUrl }
      });
      window.close();
    }
  });

  // Save All Tabs
  document.getElementById('save-all-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'saveAllTabs', closeTabs: false }, () => {
      window.close();
    });
  });

  // Open Dashboard
  document.getElementById('open-dashboard-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'dashboard.html' });
    window.close();
  });
}
