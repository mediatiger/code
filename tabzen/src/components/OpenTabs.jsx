import React, { useState, useMemo } from 'react';
import useStore, { getSessionTabs } from '../store/useStore';
import { closeTab, focusTab } from '../utils/chrome';

function Favicon({ url, size = 14 }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
        <circle cx="8" cy="8" r="6" />
        <path d="M3 8h10M8 2.5c-1.5 2-1.5 9 0 11M8 2.5c1.5 2 1.5 9 0 11" />
      </svg>
    );
  }
  return (
    <img
      src={url}
      width={size}
      height={size}
      alt=""
      className="rounded-sm"
      onError={() => setFailed(true)}
    />
  );
}

function safeHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

export default function OpenTabs({ searchQuery }) {
  const openTabs = useStore((s) => s.openTabs);
  const openTabsLoading = useStore((s) => s.openTabsLoading);
  const spaces = useStore((s) => s.spaces);
  const activeSpaceId = useStore((s) => s.activeSpaceId);
  const saveCurrentTabs = useStore((s) => s.saveCurrentTabs);
  const saveAndCloseAll = useStore((s) => s.saveAndCloseAll);
  const addTab = useStore((s) => s.addTab);
  const addSession = useStore((s) => s.addSession);
  const settings = useStore((s) => s.settings);
  const [savedIds, setSavedIds] = useState(new Set());

  // Build set of URLs already saved in the current space
  const savedUrls = useMemo(() => {
    const urls = new Set();
    const targetSpaces = activeSpaceId
      ? spaces.filter((s) => s.id === activeSpaceId)
      : spaces;
    for (const sp of targetSpaces) {
      for (const sess of sp.sessions) {
        for (const tab of getSessionTabs(sess)) {
          urls.add(tab.url);
        }
      }
    }
    return urls;
  }, [spaces, activeSpaceId]);

  const filtered = searchQuery
    ? openTabs.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.url || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : openTabs;

  const targetSpaceId = activeSpaceId || spaces[0]?.id;

  const handleSaveAll = async () => {
    if (!targetSpaceId) return;
    await saveCurrentTabs(targetSpaceId);
  };

  const handleSaveAndCloseAll = async () => {
    if (!targetSpaceId) return;
    await saveAndCloseAll(targetSpaceId);
  };

  const handleSaveTab = async (tab) => {
    if (!targetSpaceId) return;
    const space = spaces.find((s) => s.id === targetSpaceId);
    if (!space) return;

    let session = space.sessions[0];
    let sId, gId;

    if (session && session.groups[0]) {
      sId = session.id;
      gId = session.groups[0].id;
    } else {
      sId = addSession(targetSpaceId, 'Сохранённые вкладки');
      const updatedSpace = useStore.getState().spaces.find((s) => s.id === targetSpaceId);
      const newSession = updatedSpace?.sessions.find((s) => s.id === sId);
      gId = newSession?.groups[0]?.id;
      if (!gId) return;
    }

    const result = addTab(targetSpaceId, sId, gId, {
      title: tab.title || 'Untitled',
      url: tab.url,
      favicon: tab.favIconUrl || '',
    });

    if (result === 'duplicate') return;

    // Close browser tab if setting enabled
    if (settings.closeOnSave) {
      await closeTab(tab.id);
    }

    setSavedIds((prev) => new Set(prev).add(tab.id));
    setTimeout(() => setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(tab.id);
      return next;
    }), 1500);
  };

  const handleCloseTab = async (tabId) => {
    await closeTab(tabId);
  };

  return (
    <section className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[10px] font-semibold text-txt-muted tracking-[0.1em] uppercase">
          Открытые вкладки
        </h2>
        {!openTabsLoading && filtered.length > 0 && (
          <>
            <span className="text-xs text-txt-muted bg-canvas-surface px-1.5 py-0.5 rounded">
              {filtered.length}
            </span>
            <div className="flex-1" />
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 text-xs text-txt-secondary hover:text-warm border border-white/[0.06] rounded-lg px-3 py-1.5 hover:border-warm/30 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v10M3 8l5 5 5-5" />
              </svg>
              Сохранить сессию
            </button>
            <button
              onClick={handleSaveAndCloseAll}
              className="flex items-center gap-1.5 text-xs text-txt-muted hover:text-txt-secondary border border-white/[0.06] rounded-lg px-3 py-1.5 hover:border-white/[0.1] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v7M3 8l5 2 5-2" />
                <path d="M4 13h8" />
              </svg>
              Сохранить и закрыть все
            </button>
          </>
        )}
      </div>

      {openTabsLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-canvas-hover border-t-warm animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-txt-muted">
          <div className="text-2xl mb-2 opacity-30">◎</div>
          <p className="text-sm font-medium text-txt-tertiary">
            {searchQuery ? 'Ничего не найдено' : 'Нет открытых вкладок'}
          </p>
        </div>
      ) : (
        <div
          className="flex flex-wrap gap-2 overflow-y-auto px-1 pb-1 scrollbar-thin"
          style={{ maxHeight: '120px', scrollbarWidth: 'thin' }}
        >
          {filtered.map((tab) => {
            const alreadySaved = savedUrls.has(tab.url);
            return (
              <div
                key={tab.id}
                className="group relative flex items-center gap-1.5 pl-2 pr-1 py-1.5 rounded-lg bg-canvas-surface/60 border border-white/[0.04] hover:border-white/[0.08] hover:bg-canvas-surface transition-colors cursor-pointer"
                style={{ maxWidth: '180px', minWidth: '140px' }}
                onClick={() => focusTab(tab.id)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/tabzen-browser-tab',
                    JSON.stringify({
                      title: tab.title,
                      url: tab.url,
                      favicon: tab.favIconUrl || '',
                      browserTabId: tab.id,
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0 relative">
                  <Favicon url={tab.favIconUrl} />
                  {alreadySaved && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-warm border border-canvas-surface" title="Уже сохранена" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-txt-primary truncate leading-tight">{tab.title || 'Новая вкладка'}</p>
                </div>
                {tab.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-warm shrink-0" title="активная" />
                )}
                <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSaveTab(tab); }}
                    className="p-0.5 rounded hover:bg-warm/15 text-txt-muted hover:text-warm transition-colors"
                    title="Сохранить"
                  >
                    {savedIds.has(tab.id) ? (
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm">
                        <path d="M4 8l3 3 5-5" />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 3v10M3 8l5 5 5-5" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
                    className="p-0.5 rounded hover:bg-rose-muted text-txt-muted hover:text-rose-accent transition-colors"
                    title="Закрыть"
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
