import React, { useState } from 'react';

export default function PopupApp() {
  const [status, setStatus] = useState(null);

  const handleSaveClose = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const result = await chrome.storage.local.get(['tabzen']);
      const data = result.tabzen || { spaces: [] };
      const space = data.spaces[0];
      if (space && space.sessions[0] && space.sessions[0].groups[0]) {
        space.sessions[0].groups[0].tabs.push({
          id: `tab_${Date.now()}`,
          title: tab.title || '',
          url: tab.url,
          favicon: tab.favIconUrl || '',
        });
        await chrome.storage.local.set({ tabzen: data });
        chrome.tabs.remove(tab.id);
        setStatus('Сохранено!');
        setTimeout(() => window.close(), 500);
      }
    }
  };

  const handleSaveAll = async () => {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const valid = tabs.filter(
      (t) => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')
    );

    const result = await chrome.storage.local.get(['tabzen']);
    const data = result.tabzen || { spaces: [] };
    const space = data.spaces[0];
    if (space) {
      const sess = {
        id: `sess_${Date.now()}`,
        title: `Сессия ${new Date().toLocaleString('ru-RU')}`,
        createdAt: new Date().toISOString(),
        groups: [
          {
            id: `group_${Date.now()}`,
            name: 'Вкладки',
            tabs: valid.map((t) => ({
              id: `tab_${Date.now()}_${t.id}`,
              title: t.title || '',
              url: t.url,
              favicon: t.favIconUrl || '',
            })),
          },
        ],
      };
      space.sessions.unshift(sess);
      await chrome.storage.local.set({ tabzen: data });
      setStatus(`Сохранено ${valid.length} вкладок!`);
      setTimeout(() => setStatus(null), 2000);
    }
  };

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: 'index.html' });
    window.close();
  };

  return (
    <div className="p-4 min-w-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded bg-warm/15 flex items-center justify-center text-warm text-xs font-bold">
          ◈
        </div>
        <span className="text-sm font-semibold">TabZen</span>
      </div>

      {status && (
        <div className="mb-3 text-xs text-warm bg-warm/10 rounded-lg px-3 py-2 text-center">{status}</div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleSaveClose}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-warm/15 text-warm hover:bg-warm/25 transition-colors text-sm font-medium"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 3v10M3 8l5 5 5-5" />
          </svg>
          Сохранить и закрыть
        </button>

        <button
          onClick={handleSaveAll}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-canvas-surface border border-white/[0.04] text-txt-secondary hover:text-txt-primary hover:border-white/[0.08] transition-colors text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <path d="M6 6h4M6 10h4" />
          </svg>
          Сохранить все вкладки
        </button>

        <button
          onClick={handleOpenDashboard}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-canvas-surface border border-white/[0.04] text-txt-secondary hover:text-txt-primary hover:border-white/[0.08] transition-colors text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="5" height="5" rx="1" />
            <rect x="9" y="2" width="5" height="5" rx="1" />
            <rect x="2" y="9" width="5" height="5" rx="1" />
            <rect x="9" y="9" width="5" height="5" rx="1" />
          </svg>
          Открыть TabZen
        </button>
      </div>
    </div>
  );
}
