import React, { useState } from 'react';
import useStore from '../store/useStore';
import { closeTab, focusTab } from '../utils/chrome';

function Favicon({ url, size = 14 }) {
  if (!url) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
        <rect x="2" y="2" width="12" height="12" rx="2" />
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
      onError={(e) => { e.target.style.display = 'none'; }}
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
  const addTab = useStore((s) => s.addTab);
  const addSession = useStore((s) => s.addSession);
  const [savedIds, setSavedIds] = useState(new Set());

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

  // Bug 5 fix: auto-create session if none exists
  const handleSaveTab = (tab) => {
    if (!targetSpaceId) return;
    const space = spaces.find((s) => s.id === targetSpaceId);
    if (!space) return;

    let session = space.sessions[0];
    let sId, gId;

    if (session && session.groups[0]) {
      sId = session.id;
      gId = session.groups[0].id;
    } else {
      // Auto-create a session
      sId = addSession(targetSpaceId, 'Сохранённые вкладки');
      // Re-read space after mutation
      const updatedSpace = useStore.getState().spaces.find((s) => s.id === targetSpaceId);
      const newSession = updatedSpace?.sessions.find((s) => s.id === sId);
      gId = newSession?.groups[0]?.id;
      if (!gId) return;
    }

    addTab(targetSpaceId, sId, gId, {
      title: tab.title || 'Untitled',
      url: tab.url,
      favicon: tab.favIconUrl || '',
    });

    // Visual feedback
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
        /* Bug 1 fix: horizontal scrollable row of compact chips */
        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-canvas-deep to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-canvas-deep to-transparent z-10" />

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin px-1" style={{ scrollbarWidth: 'thin' }}>
            {filtered.map((tab) => (
              <div
                key={tab.id}
                className="group flex items-center gap-2 pl-2.5 pr-1.5 py-2 rounded-xl bg-canvas-surface/60 border border-white/[0.04] hover:border-white/[0.08] hover:bg-canvas-surface transition-colors cursor-pointer shrink-0"
                style={{ maxWidth: '220px', minWidth: '160px' }}
                onClick={() => focusTab(tab.id)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/tabzen-browser-tab',
                    JSON.stringify({
                      title: tab.title,
                      url: tab.url,
                      favicon: tab.favIconUrl || '',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <Favicon url={tab.favIconUrl} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-txt-primary truncate leading-tight">{tab.title || 'Новая вкладка'}</p>
                  <p className="text-[10px] text-txt-muted truncate leading-tight">{safeHostname(tab.url)}</p>
                </div>
                {tab.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-warm shrink-0" title="активная" />
                )}
                {/* Action buttons */}
                <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSaveTab(tab); }}
                    className="p-1 rounded hover:bg-warm/15 text-txt-muted hover:text-warm transition-colors"
                    title="Сохранить"
                  >
                    {savedIds.has(tab.id) ? (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm">
                        <path d="M4 8l3 3 5-5" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 3v10M3 8l5 5 5-5" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
                    className="p-1 rounded hover:bg-rose-muted text-txt-muted hover:text-rose-accent transition-colors"
                    title="Закрыть"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
