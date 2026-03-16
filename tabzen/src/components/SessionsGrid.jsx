import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { createTab } from '../utils/chrome';

function safeHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function SessionCard({ space, session, onExpand }) {
  const renameSession = useStore((s) => s.renameSession);
  const deleteSession = useStore((s) => s.deleteSession);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = () => {
    if (editValue.trim()) renameSession(space.id, session.id, editValue.trim());
    setEditing(false);
  };

  const allTabs = session.groups.flatMap((g) => g.tabs);
  const previewTabs = allTabs.slice(0, 3);
  const moreCount = allTabs.length - 3;

  const handleRestore = (e) => {
    e.stopPropagation();
    allTabs.forEach((tab) => createTab(tab.url));
  };

  return (
    <article
      className="relative group bg-canvas-surface border border-white/[0.04] rounded-2xl p-5 hover:border-white/[0.08] hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onExpand(space.id, session.id)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData('application/tabzen-browser-tab');
        if (!raw) return;
        try {
          const tab = JSON.parse(raw);
          const group = session.groups[0];
          if (group) {
            useStore.getState().addTab(space.id, session.id, group.id, tab);
          }
        } catch {}
      }}
    >
      {/* Menu */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={handleRestore}
          className="p-1.5 rounded-lg bg-canvas-hover/80 text-txt-secondary hover:text-warm hover:bg-warm/15 transition-colors"
          title="Открыть все вкладки"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 9v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h4" />
            <path d="M9 2h5v5" />
            <path d="M14 2L7 9" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-1.5 rounded-lg bg-canvas-hover/80 text-txt-secondary hover:text-txt-primary transition-colors"
        >
          <span className="text-xs">⋯</span>
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
          <div className="absolute right-3 top-10 z-50 bg-canvas-elevated border border-white/[0.06] rounded-lg shadow-xl py-1 min-w-[140px] animate-fade-in">
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-canvas-hover"
            >
              Переименовать
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Удалить сессию "${session.title}"?`)) {
                  deleteSession(space.id, session.id);
                }
                setMenuOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-rose-accent hover:bg-rose-muted"
            >
              Удалить
            </button>
          </div>
        </>
      )}

      {/* Title */}
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
          className="bg-transparent outline-none text-base font-semibold text-txt-primary border-b border-warm/40 mb-1 w-full"
        />
      ) : (
        <h3 className="text-base font-semibold text-txt-primary mb-1 truncate pr-16">{session.title}</h3>
      )}

      <p className="text-xs text-txt-muted mb-3">
        {allTabs.length} вкл. · {session.groups.length} {session.groups.length === 1 ? 'группа' : 'групп'}
      </p>

      {/* Tab previews */}
      <div className="space-y-1.5">
        {previewTabs.map((tab) => (
          <div key={tab.id} className="flex items-center gap-2 text-xs text-txt-tertiary">
            <div className="w-3 h-3 rounded-sm bg-canvas-hover shrink-0" />
            <span className="truncate">{tab.title}</span>
          </div>
        ))}
        {moreCount > 0 && (
          <span className="text-xs text-txt-muted">+{moreCount} ещё</span>
        )}
      </div>
    </article>
  );
}

export default function SessionsGrid({ searchQuery, onExpandSession }) {
  const spaces = useStore((s) => s.spaces);
  const activeSpaceId = useStore((s) => s.activeSpaceId);
  const addSession = useStore((s) => s.addSession);
  const saveCurrentTabs = useStore((s) => s.saveCurrentTabs);

  // Collect sessions to show
  const visibleSpaces = activeSpaceId ? spaces.filter((s) => s.id === activeSpaceId) : spaces;

  const allSessions = visibleSpaces.flatMap((sp) =>
    sp.sessions.map((sess) => ({ space: sp, session: sess }))
  );

  const filtered = searchQuery
    ? allSessions.filter(
        ({ session }) =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.groups.some((g) =>
            g.tabs.some(
              (t) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.url.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
      )
    : allSessions;

  const targetSpaceId = activeSpaceId || spaces[0]?.id;

  return (
    <section className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[10px] font-semibold text-txt-muted tracking-[0.1em] uppercase">
          Проекты
        </h2>
        {filtered.length > 0 && (
          <span className="text-xs text-txt-muted bg-canvas-surface px-1.5 py-0.5 rounded">
            {filtered.length}
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

      {filtered.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(({ space, session }) => (
            <SessionCard
              key={session.id}
              space={space}
              session={session}
              onExpand={onExpandSession}
            />
          ))}
        </div>
      )}
    </section>
  );
}
