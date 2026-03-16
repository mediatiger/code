import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useStore from '../store/useStore';

const COLORS = [
  { id: 'media', label: 'Фиолетовый', css: 'bg-space-media' },
  { id: 'projects', label: 'Зелёный', css: 'bg-space-projects' },
  { id: 'crypto', label: 'Коричневый', css: 'bg-space-crypto' },
  { id: 'learning', label: 'Синий', css: 'bg-space-learning' },
  { id: 'personal', label: 'Розовый', css: 'bg-space-personal' },
];

const dotColor = (c) => {
  const map = {
    media: 'bg-space-media',
    projects: 'bg-space-projects',
    crypto: 'bg-space-crypto',
    learning: 'bg-space-learning',
    personal: 'bg-space-personal',
  };
  return map[c] || 'bg-warm';
};

export default function Sidebar() {
  const spaces = useStore((s) => s.spaces);
  const activeSpaceId = useStore((s) => s.activeSpaceId);
  const setActiveSpace = useStore((s) => s.setActiveSpace);
  const addSpace = useStore((s) => s.addSpace);
  const renameSpace = useStore((s) => s.renameSpace);
  const deleteSpace = useStore((s) => s.deleteSpace);
  const updateSpaceColor = useStore((s) => s.updateSpaceColor);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [menuId, setMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [colorPickerId, setColorPickerId] = useState(null);
  const editRef = useRef(null);

  const openMenu = useCallback((spaceId, e) => {
    // Get the position of the trigger element for fixed positioning
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.top, left: rect.right + 4 });
    setMenuId(menuId === spaceId ? null : spaceId);
  }, [menuId]);

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  const handleAdd = () => {
    const id = addSpace();
    setEditingId(id);
    setEditValue('Новое пространство');
  };

  const commitRename = (id) => {
    if (editValue.trim()) renameSpace(id, editValue.trim());
    setEditingId(null);
  };

  const handleDelete = (sp) => {
    if (sp.sessions.length > 0) {
      if (!confirm(`Удалить "${sp.name}" и все его сессии (${sp.sessions.length})?`)) return;
    }
    deleteSpace(sp.id);
    setMenuId(null);
  };

  const totalTabs = spaces.reduce(
    (sum, sp) =>
      sum + sp.sessions.reduce((s2, sess) => s2 + sess.groups.reduce((s3, g) => s3 + g.tabs.length, 0), 0),
    0
  );

  return (
    <aside className="w-56 bg-canvas-base border-r border-white/[0.04] flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-warm/15 flex items-center justify-center text-warm text-sm font-semibold">
          ◈
        </div>
        <span className="text-txt-primary font-semibold text-base tracking-tight">TabZen</span>
      </div>

      {/* Spaces */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="text-[10px] font-semibold text-txt-muted tracking-[0.1em] uppercase px-2 mb-2">
          Пространства
        </div>

        {/* All */}
        <button
          onClick={() => setActiveSpace(null)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
            activeSpaceId === null
              ? 'bg-canvas-hover text-txt-primary'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-canvas-elevated'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-warm shrink-0" />
          <span className="flex-1 text-left truncate">Все</span>
          <span className="text-xs text-txt-muted">{totalTabs}</span>
        </button>

        {/* Each space */}
        {spaces.map((sp) => (
          <div key={sp.id} className="relative group">
            <button
              onClick={() => setActiveSpace(sp.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                openMenu(sp.id, e);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                activeSpaceId === sp.id
                  ? 'bg-canvas-hover text-txt-primary'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-canvas-elevated'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dotColor(sp.color)} shrink-0`} />
              {editingId === sp.id ? (
                <input
                  ref={editRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => commitRename(sp.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(sp.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-transparent outline-none text-sm text-txt-primary border-b border-warm/40 py-0"
                />
              ) : (
                <span className="flex-1 text-left truncate">{sp.name}</span>
              )}
              <span className="text-xs text-txt-muted">
                {sp.sessions.reduce((s, sess) => s + sess.groups.reduce((s2, g) => s2 + g.tabs.length, 0), 0)}
              </span>

              {/* ... menu trigger */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  openMenu(sp.id, e);
                }}
                className="opacity-0 group-hover:opacity-100 text-txt-muted hover:text-txt-primary transition-opacity cursor-pointer ml-1 text-xs"
              >
                ⋯
              </span>
            </button>

            {/* Context menu — rendered via portal to escape overflow clipping */}
          </div>
        ))}

        {/* Add space */}
        <button
          onClick={handleAdd}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-txt-muted hover:text-txt-secondary hover:bg-canvas-elevated transition-colors mt-1"
        >
          <span className="w-4 h-4 flex items-center justify-center text-xs">+</span>
          <span>Добавить</span>
        </button>
      </div>

      {/* Context menu — portal to body so it's never clipped by sidebar overflow */}
      {menuId && createPortal(
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => { setMenuId(null); setColorPickerId(null); }} />
          <div
            className="fixed z-[1000] bg-canvas-elevated border border-white/[0.06] rounded-lg shadow-xl py-1 min-w-[160px] animate-fade-in"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {(() => {
              const sp = spaces.find((s) => s.id === menuId);
              if (!sp) return null;
              return (
                <>
                  <button
                    onClick={() => { setEditingId(sp.id); setEditValue(sp.name); setMenuId(null); }}
                    className="w-full text-left px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-canvas-hover"
                  >
                    Переименовать
                  </button>
                  <button
                    onClick={() => setColorPickerId(colorPickerId === sp.id ? null : sp.id)}
                    className="w-full text-left px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-canvas-hover"
                  >
                    Цвет
                  </button>
                  {colorPickerId === sp.id && (
                    <div className="flex gap-1.5 px-3 py-1.5">
                      {COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { updateSpaceColor(sp.id, c.id); setColorPickerId(null); setMenuId(null); }}
                          className={`w-4 h-4 rounded-full ${c.css} ${sp.color === c.id ? 'ring-2 ring-white/40' : ''} hover:scale-125 transition-transform`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(sp)}
                    className="w-full text-left px-3 py-1.5 text-sm text-rose-accent hover:bg-rose-muted"
                  >
                    Удалить
                  </button>
                </>
              );
            })()}
          </div>
        </>,
        document.body
      )}
    </aside>
  );
}
