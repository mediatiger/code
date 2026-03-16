import React from 'react';
import useStore from '../store/useStore';
import { createTab, closeTab, focusTab } from '../utils/chrome';

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

  const handleSaveTab = (tab) => {
    if (!targetSpaceId) return;
    const space = spaces.find((s) => s.id === targetSpaceId);
    if (!space) return;
    const session = space.sessions[0];
    if (!session || !session.groups[0]) return;
    addTab(targetSpaceId, session.id, session.groups[0].id, {
      title: tab.title || 'Untitled',
      url: tab.url,
      favicon: tab.favIconUrl || '',
    });
  };

  const handleCloseTab = async (tabId) => {
    await closeTab(tabId);
    // Will auto-refresh via interval
  };

  return (
    <section className="mb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
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
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 rounded-full border-2 border-canvas-hover border-t-warm animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-txt-muted">
          <div className="text-3xl mb-3 opacity-30">◎</div>
          <p className="text-sm font-medium text-txt-tertiary">
            {searchQuery ? 'Ничего не найдено' : 'Нет открытых вкладок'}
          </p>
          <p className="text-xs text-txt-muted mt-1">
            {searchQuery ? 'Попробуйте другой запрос' : 'Ваши вкладки браузера появятся здесь'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((tab) => (
            <div
              key={tab.id}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-canvas-surface/50 border border-white/[0.03] hover:border-white/[0.06] hover:bg-canvas-surface transition-colors cursor-pointer"
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
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <Favicon url={tab.favIconUrl} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-txt-primary truncate">{tab.title || 'Новая вкладка'}</p>
                <p className="text-xs text-txt-muted truncate">{safeHostname(tab.url)}</p>
              </div>
              {tab.active && (
                <span className="text-[10px] font-semibold uppercase text-warm bg-warm/10 px-1.5 py-0.5 rounded shrink-0">
                  активная
                </span>
              )}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleSaveTab(tab); }}
                  className="p-1 rounded hover:bg-warm/15 text-txt-muted hover:text-warm transition-colors"
                  title="Сохранить"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 3v10M3 8l5 5 5-5" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
                  className="p-1 rounded hover:bg-rose-muted text-txt-muted hover:text-rose-accent transition-colors"
                  title="Закрыть"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
