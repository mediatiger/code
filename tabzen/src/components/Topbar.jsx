import React, { useEffect, useRef } from 'react';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Доброе утро';
  if (h >= 12 && h < 17) return 'Добрый день';
  if (h >= 17 && h < 21) return 'Добрый вечер';
  return 'Работаем допоздна';
}

function getDate() {
  return new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function Topbar({ searchQuery, setSearchQuery }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.04] shrink-0">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-warm tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-xs text-txt-tertiary mt-0.5">{getDate()}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск вкладок, проектов..."
            className="w-64 bg-canvas-surface border border-white/[0.04] rounded-xl px-4 py-2 pl-9 text-sm text-txt-primary placeholder:text-txt-muted focus:border-warm/30 focus:outline-none transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-txt-muted bg-canvas-hover px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>
      </div>
    </header>
  );
}
