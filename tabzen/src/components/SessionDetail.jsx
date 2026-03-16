import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { createTab } from '../utils/chrome';

function safeHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function TabRow({ tab, spaceId, sessionId, groupId }) {
  const removeTab = useStore((s) => s.removeTab);

  return (
    <div
      className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-canvas-hover/50 transition-colors"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(
          'application/tabzen-tab',
          JSON.stringify({ tabId: tab.id, fromSpaceId: spaceId, fromSessionId: sessionId, fromGroupId: groupId })
        );
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="w-4 h-4 shrink-0 flex items-center justify-center">
        {tab.favicon ? (
          <img src={tab.favicon} width="14" height="14" className="rounded-sm" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <rect x="2" y="2" width="12" height="12" rx="2" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => createTab(tab.url)}>
        <p className="text-sm text-txt-primary truncate hover:text-warm transition-colors">{tab.title}</p>
        <p className="text-xs text-txt-muted truncate">{safeHostname(tab.url)}</p>
      </div>
      <button
        onClick={() => removeTab(spaceId, sessionId, groupId, tab.id)}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-muted text-txt-muted hover:text-rose-accent transition-all"
        title="Удалить"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}

function GroupSection({ group, spaceId, sessionId }) {
  const renameGroup = useStore((s) => s.renameGroup);
  const deleteGroup = useStore((s) => s.deleteGroup);
  const moveTab = useStore((s) => s.moveTab);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(group.name);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = () => {
    if (editValue.trim()) renameGroup(spaceId, sessionId, group.id, editValue.trim());
    setEditing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    // Handle internal tab move
    const tabData = e.dataTransfer.getData('application/tabzen-tab');
    if (tabData) {
      try {
        const { tabId, fromSpaceId, fromSessionId, fromGroupId } = JSON.parse(tabData);
        if (fromGroupId !== group.id) {
          moveTab(fromSpaceId, fromSessionId, fromGroupId, spaceId, sessionId, group.id, tabId);
        }
      } catch {}
      return;
    }

    // Handle browser tab drop
    const browserTab = e.dataTransfer.getData('application/tabzen-browser-tab');
    if (browserTab) {
      try {
        const tab = JSON.parse(browserTab);
        useStore.getState().addTab(spaceId, sessionId, group.id, tab);
      } catch {}
    }
  };

  return (
    <div
      className={`rounded-xl border transition-colors mb-4 ${
        dragOver ? 'border-warm/40 bg-warm/5' : 'border-white/[0.04] bg-canvas-elevated/50'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/tabzen-tab') ? 'move' : 'copy';
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.03]">
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
            className="bg-transparent outline-none text-sm font-medium text-txt-primary border-b border-warm/40 flex-1"
          />
        ) : (
          <h4
            className="text-sm font-medium text-txt-secondary flex-1 cursor-pointer hover:text-txt-primary transition-colors"
            onClick={() => { setEditing(true); setEditValue(group.name); }}
          >
            {group.name}
          </h4>
        )}
        <span className="text-xs text-txt-muted">{group.tabs.length}</span>
        <button
          onClick={() => {
            if (confirm(`Удалить группу "${group.name}"?`)) {
              deleteGroup(spaceId, sessionId, group.id);
            }
          }}
          className="p-1 rounded text-txt-muted hover:text-rose-accent hover:bg-rose-muted transition-colors"
          title="Удалить группу"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      <div className="p-2">
        {group.tabs.length === 0 ? (
          <p className="text-xs text-txt-muted text-center py-4">
            Перетащите вкладки сюда
          </p>
        ) : (
          group.tabs.map((tab) => (
            <TabRow key={tab.id} tab={tab} spaceId={spaceId} sessionId={sessionId} groupId={group.id} />
          ))
        )}
      </div>
    </div>
  );
}

export default function SessionDetail({ spaceId, sessionId, onBack }) {
  const spaces = useStore((s) => s.spaces);
  const addGroup = useStore((s) => s.addGroup);
  const renameSession = useStore((s) => s.renameSession);

  const space = spaces.find((s) => s.id === spaceId);
  const session = space?.sessions.find((s) => s.id === sessionId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(session?.title || '');
  const titleRef = useRef(null);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  if (!space || !session) {
    return (
      <div className="py-8">
        <button onClick={onBack} className="text-sm text-txt-secondary hover:text-txt-primary">
          ← Назад
        </button>
        <p className="text-txt-muted mt-4">Сессия не найдена</p>
      </div>
    );
  }

  const commitTitle = () => {
    if (titleValue.trim()) renameSession(spaceId, sessionId, titleValue.trim());
    setEditingTitle(false);
  };

  const allTabs = session.groups.flatMap((g) => g.tabs);

  const handleRestoreAll = () => {
    allTabs.forEach((tab) => createTab(tab.url));
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-canvas-hover transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>

        <div className="flex-1">
          {editingTitle ? (
            <input
              ref={titleRef}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') setEditingTitle(false);
              }}
              className="bg-transparent outline-none text-xl font-semibold text-txt-primary border-b border-warm/40 w-full"
            />
          ) : (
            <h2
              className="text-xl font-semibold text-txt-primary cursor-pointer hover:text-warm transition-colors"
              onClick={() => { setEditingTitle(true); setTitleValue(session.title); }}
            >
              {session.title}
            </h2>
          )}
          <p className="text-xs text-txt-muted mt-0.5">
            {space.name} · {allTabs.length} вкл. · {session.groups.length} групп
          </p>
        </div>

        <button
          onClick={handleRestoreAll}
          className="flex items-center gap-2 text-sm text-warm border border-warm/20 rounded-xl px-4 py-2 hover:bg-warm/10 transition-colors font-medium"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 9v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h4" />
            <path d="M9 2h5v5" />
            <path d="M14 2L7 9" />
          </svg>
          Открыть все
        </button>
      </div>

      {/* Groups */}
      {session.groups.map((group) => (
        <GroupSection key={group.id} group={group} spaceId={spaceId} sessionId={sessionId} />
      ))}

      {/* Add group button */}
      <button
        onClick={() => addGroup(spaceId, sessionId)}
        className="w-full py-3 rounded-xl border border-dashed border-white/[0.06] text-sm text-txt-muted hover:text-txt-secondary hover:border-white/[0.1] transition-colors"
      >
        + Добавить группу
      </button>
    </div>
  );
}
