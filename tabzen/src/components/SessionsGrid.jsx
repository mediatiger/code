import React, { useState, useRef, useEffect } from 'react';
import useStore, { getSessionTabs } from '../store/useStore';
import { createTab, closeTab } from '../utils/chrome';

function safeHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function FaviconSaved({ url, size = 14 }) {
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

function SessionCard({ space, session }) {
  const renameSession = useStore((s) => s.renameSession);
  const deleteSession = useStore((s) => s.deleteSession);
  const removeTab = useStore((s) => s.removeTab);
  const addTab = useStore((s) => s.addTab);
  const moveTab = useStore((s) => s.moveTab);
  const settings = useStore((s) => s.settings);

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = () => {
    if (editValue.trim()) renameSession(space.id, session.id, editValue.trim());
    setEditing(false);
  };

  const allTabs = getSessionTabs(session);
  const group0Id = session.groups[0]?.id;

  const handleRestore = (e) => {
    e.stopPropagation();
    allTabs.forEach((tab) => createTab(tab.url));
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (allTabs.length > 0 && !confirm(`Удалить сессию "${session.title}" (${allTabs.length} вкл.)?`)) return;
    deleteSession(space.id, session.id);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!group0Id) return;

    const tabData = e.dataTransfer.getData('application/tabzen-tab');
    if (tabData) {
      try {
        const { tabId, fromSpaceId, fromSessionId, fromGroupId } = JSON.parse(tabData);
        moveTab(fromSpaceId, fromSessionId, fromGroupId, space.id, session.id, group0Id, tabId);
      } catch {}
      return;
    }

    const browserTab = e.dataTransfer.getData('application/tabzen-browser-tab');
    if (browserTab) {
      try {
        const tab = JSON.parse(browserTab);
        const result = addTab(space.id, session.id, group0Id, tab);
        if (result !== 'duplicate' && settings.closeOnSave && tab.browserTabId) {
          closeTab(tab.browserTabId);
        }
      } catch {}
    }
  };

  const displayDate = session.updatedAt || session.createdAt;
  const dateStr = displayDate
    ? new Date(displayDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <article
      className={`relative bg-canvas-surface border rounded-2xl transition-all ${
        dragOver ? 'border-warm/40 bg-warm/5' : 'border-white/[0.04] hover:border-white/[0.08]'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/tabzen-tab') ? 'move' : 'copy';
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <svg
          width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          className={`text-txt-muted shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
        >
          <path d="M6 3l5 5-5 5" />
        </svg>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setEditing(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent outline-none text-sm font-semibold text-txt-primary border-b border-warm/40 w-full"
            />
          ) : (
            <h3 className="text-sm font-semibold text-txt-primary truncate">{session.title}</h3>
          )}
        </div>

        <span className="text-xs text-txt-muted shrink-0">{allTabs.length} вкл.</span>
        {dateStr && <span className="text-xs text-txt-muted shrink-0 hidden sm:inline">{dateStr}</span>}

        {/* Always-visible action buttons */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={handleRestore}
            className="p-1.5 rounded-lg text-txt-muted hover:text-warm hover:bg-warm/15 transition-colors"
            title="Открыть все"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 9v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h4" />
              <path d="M9 2h5v5" />
              <path d="M14 2L7 9" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-txt-muted hover:text-rose-accent hover:bg-rose-muted transition-colors"
            title="Удалить"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
          {/* ... menu on hover */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1.5 rounded-lg text-txt-muted opacity-0 group-hover:opacity-100 hover:text-txt-primary transition-all"
              title="Ещё"
            >
              <span className="text-xs">⋯</span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                <div className="absolute right-0 top-8 z-50 bg-canvas-elevated border border-white/[0.06] rounded-lg shadow-xl py-1 min-w-[140px] animate-fade-in">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(true); setEditValue(session.title); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-canvas-hover"
                  >
                    Переименовать
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded: vertical tab list */}
      {expanded && (
        <div className="border-t border-white/[0.04] px-5 py-2">
          {allTabs.length === 0 ? (
            <p className="text-xs text-txt-muted text-center py-4">
              Перетащите вкладки сюда
            </p>
          ) : (
            allTabs.map((tab) => {
              const ownerGroup = session.groups.find((g) => g.tabs.some((t) => t.id === tab.id));
              const gId = ownerGroup?.id;
              return (
                <div
                  key={tab.id}
                  className="group/tab flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-canvas-hover/50 transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'application/tabzen-tab',
                      JSON.stringify({ tabId: tab.id, fromSpaceId: space.id, fromSessionId: session.id, fromGroupId: gId })
                    );
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <FaviconSaved url={tab.favicon} />
                  </div>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => createTab(tab.url)}
                  >
                    <p className="text-sm text-txt-primary truncate hover:text-warm hover:underline transition-colors">{tab.title}</p>
                    <p className="text-xs text-txt-muted truncate">{safeHostname(tab.url)}</p>
                  </div>
                  <button
                    onClick={() => gId && removeTab(space.id, session.id, gId, tab.id)}
                    className="p-1 rounded opacity-0 group-hover/tab:opacity-100 hover:bg-rose-muted text-txt-muted hover:text-rose-accent transition-all"
                    title="Удалить"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </article>
  );
}

export default function SessionsGrid({ searchQuery }) {
  const spaces = useStore((s) => s.spaces);
  const activeSpaceId = useStore((s) => s.activeSpaceId);
  const addSession = useStore((s) => s.addSession);
  const saveCurrentTabs = useStore((s) => s.saveCurrentTabs);

  const visibleSpaces = activeSpaceId ? spaces.filter((s) => s.id === activeSpaceId) : spaces;

  const allSessions = visibleSpaces.flatMap((sp) =>
    sp.sessions.map((sess) => ({ space: sp, session: sess }))
  );

  const filtered = searchQuery
    ? allSessions.filter(
        ({ session }) =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getSessionTabs(session).some(
            (t) =>
              t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.url.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : allSessions;

  // Sort by updatedAt (or createdAt) descending — newest first
  const sorted = [...filtered].sort((a, b) => {
    const aTime = a.session.updatedAt || a.session.createdAt || '';
    const bTime = b.session.updatedAt || b.session.createdAt || '';
    return bTime.localeCompare(aTime);
  });

  const targetSpaceId = activeSpaceId || spaces[0]?.id;

  return (
    <section className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[10px] font-semibold text-txt-muted tracking-[0.1em] uppercase">
          Проекты
        </h2>
        {sorted.length > 0 && (
          <span className="text-xs text-txt-muted bg-canvas-surface px-1.5 py-0.5 rounded">
            {sorted.length}
          </span>
        )}
        <div className="flex-1" />
        {targetSpaceId && (
          <>
            <button
              onClick={() => saveCurrentTabs(targetSpaceId)}
              className="flex items-center gap-1.5 text-xs text-warm border border-warm/20 rounded-lg px-3 py-1.5 hover:bg-warm/10 transition-colors font-medium"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v10M3 8l5 5 5-5" />
              </svg>
              Сохранить текущую сессию
            </button>
            <button
              onClick={() => addSession(targetSpaceId)}
              className="flex items-center gap-1.5 text-xs text-txt-secondary border border-white/[0.06] rounded-lg px-3 py-1.5 hover:border-white/[0.1] hover:text-txt-primary transition-colors"
            >
              + Новая сессия
            </button>
          </>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-txt-muted">
          <div className="text-3xl mb-3 opacity-30">◇</div>
          <p className="text-sm font-medium text-txt-tertiary">
            {searchQuery ? 'Сессии не найдены' : 'Пока нет сессий'}
          </p>
          <p className="text-xs text-txt-muted mt-1">
            {searchQuery
              ? 'Попробуйте другой запрос'
              : 'Сохраните текущие вкладки или создайте пустую сессию'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map(({ space, session }) => (
            <SessionCard
              key={session.id}
              space={space}
              session={session}
            />
          ))}
        </div>
      )}
    </section>
  );
}
