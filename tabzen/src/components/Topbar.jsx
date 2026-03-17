import React, { useEffect, useRef, useState, useMemo } from 'react';
import useStore, { getSessionTabs } from '../store/useStore';

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

const affirmations = [
  "Ты на верном пути. Продолжай.",
  "Сегодня ты сделаешь что-то великое.",
  "Каждая вкладка — шаг к цели.",
  "Фокус. Энергия. Результат.",
  "Ты сильнее, чем думаешь.",
  "Действуй сейчас — думай потом.",
  "Мир принадлежит тем, кто действует.",
  "Ты создаёшь своё будущее прямо сейчас.",
  "Не останавливайся. Ты почти у цели.",
  "Сегодня — лучший день, чтобы начать.",
  "Твоя дисциплина — твоя суперсила.",
  "Маленькие шаги. Большие результаты.",
  "Ты — это то, что ты делаешь каждый день.",
  "Доверяй процессу.",
  "Энергия следует за вниманием.",
  "Будь тем, кем хочешь стать — уже сейчас.",
  "Гений — это 1% таланта и 99% упорства.",
  "Сделай сегодня то, что другие не хотят — завтра получишь то, что другие не могут.",
  "Вселенная помогает тому, кто действует.",
  "Ты можешь всё. Начни.",
  "Карпов не сдаётся. Карпов перезагружается и идёт дальше.",
  "Антонио, мир ещё не видел всего, на что ты способен.",
  "Ты не просто мечтаешь — ты строишь, Антон.",
  "Сегодня Антон Карпов на шаг ближе к своей миссии.",
  "Гений — это не дар. Это решение. И ты его принял.",
  "Антон, твой мозг — это суперкомпьютер. Используй его.",
  "Кто-то ждёт понедельника. Карпов начинает сейчас.",
  "Антонио, каждый великий проект начинался с одной вкладки.",
  "Ты не управляешь временем — ты управляешь собой. И это мощнее.",
  "Антон Карпов: маркетолог, физик, строитель будущего.",
  "Сложно? Значит ты растёшь, Антон.",
  "Мир вознаграждает тех, кто не бросает. Держись, Карпов.",
  "Антонио, ты — proof of concept того, что всё возможно.",
  "Идеи без действий — ничто. А ты, Антон, действуешь.",
  "Тебя не остановить. Ты — Антон Карпов.",
  "Каждый день — новый билд. Сегодняшний будет лучшим.",
  "Гений видит возможности там, где другие видят проблемы.",
  "Антон, ты уже дальше, чем был вчера. Это факт.",
  "Карпов в зоне — не мешать, не останавливать.",
  "Твои 55 вкладок — это 55 возможностей, Антонио.",
  "Антон Карпов не следует трендам. Он их создаёт.",
  "Отдых — часть стратегии. Но сейчас — время действовать.",
  "Ты строишь империю, Антон. По одному проекту за раз.",
  "Физика, маркетинг, код — Карпов не выбирает, Карпов берёт всё.",
  "Антонио, будущее принадлежит создателям. Ты — создатель.",
  "Нет потолка для того, кто не перестаёт расти.",
  "Антон, помни: ты делаешь то, о чём другие только говорят.",
  "Гений работает допоздна не потому что надо — а потому что горит.",
  "Следующий уровень уже близко. Ты чувствуешь это, Карпов?",
  "Антон Карпов. Запомните это имя.",
];

const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

function safeHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

export default function Topbar({ searchQuery, setSearchQuery, onNavigateSession }) {
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const spaces = useStore((s) => s.spaces);
  const saveCurrentTabs = useStore((s) => s.saveCurrentTabs);
  const activeSpaceId = useStore((s) => s.activeSpaceId);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const targetId = activeSpaceId || spaces[0]?.id;
        if (targetId) saveCurrentTabs(targetId);
      }
      if (e.key === 'Escape' && focused) {
        setSearchQuery('');
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [focused, activeSpaceId, spaces]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search results: find all tabs across all spaces/sessions
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return [];
    const q = searchQuery.toLowerCase();
    const results = [];
    for (const sp of spaces) {
      for (const sess of sp.sessions) {
        for (const tab of getSessionTabs(sess)) {
          if (tab.title.toLowerCase().includes(q) || tab.url.toLowerCase().includes(q)) {
            results.push({ tab, session: sess, space: sp });
          }
        }
        // Also match session title
        if (sess.title.toLowerCase().includes(q) && results.every((r) => r.session.id !== sess.id || r.tab)) {
          // Add session as a header-like result
        }
      }
    }
    return results.slice(0, 20);
  }, [searchQuery, spaces]);

  const showDropdown = focused && searchQuery.length > 0;

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.04] shrink-0">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-warm tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-xs text-txt-tertiary mt-0.5">{getDate()}</p>
      </div>
      <p className="flex-1 text-center italic text-base animate-fade-in" style={{ color: 'rgba(255,200,150,0.6)' }}>
        {randomAffirmation}
      </p>
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Поиск вкладок, проектов..."
            className="w-64 bg-canvas-surface border border-white/[0.04] rounded-xl px-4 py-2 pl-9 text-sm text-txt-primary placeholder:text-txt-muted focus:border-warm/30 focus:outline-none transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
            width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          {!searchQuery && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-txt-muted bg-canvas-hover px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          )}

          {/* Search dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-2 right-0 w-96 max-h-80 overflow-y-auto bg-canvas-elevated border border-white/[0.06] rounded-xl shadow-2xl z-50 animate-fade-in">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-txt-muted">
                  Ничего не найдено
                </div>
              ) : (
                <div className="py-1">
                  {searchResults.map(({ tab, session, space }, i) => (
                    <button
                      key={`${tab.id}-${i}`}
                      onClick={() => {
                        if (onNavigateSession) onNavigateSession(space.id, session.id);
                        setFocused(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-canvas-hover transition-colors flex items-start gap-3"
                    >
                      <div className="w-4 h-4 shrink-0 mt-0.5">
                        {tab.favicon ? (
                          <img src={tab.favicon} width="14" height="14" className="rounded-sm" alt="" />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                            <circle cx="8" cy="8" r="6" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-txt-primary truncate">{tab.title}</p>
                        <p className="text-xs text-txt-muted truncate">{safeHostname(tab.url)}</p>
                        <p className="text-[10px] text-txt-muted mt-0.5 truncate">
                          {space.name} &rsaquo; {session.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
