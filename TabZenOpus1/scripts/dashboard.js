// TabZen Dashboard — A calm visual workspace
// Full-featured: i18n, open tabs, drag&drop, options, save session

// ============================================
// i18n — Localization
// ============================================

const i18n = {
  ru: {
    greeting_morning: 'Доброе утро',
    greeting_afternoon: 'Добрый день',
    greeting_evening: 'Добрый вечер',
    greeting_night: 'Работаем допоздна',
    spaces: 'Пространства',
    all: 'Все',
    inbox: 'Входящие',
    search_placeholder: 'Поиск вкладок, проектов...',
    options: 'Настройки',
    projects: 'Проекты',
    no_projects: 'Проектов пока нет',
    no_projects_desc: 'Группируйте вкладки в проекты для удобной работы.',
    no_matching_projects: 'Проекты не найдены',
    try_different: 'Попробуйте другой запрос.',
    inbox_clear: 'Входящие пусты',
    inbox_clear_desc: 'Сохранённые вкладки появятся здесь. Используйте попап расширения.',
    no_matching_tabs: 'Вкладки не найдены',
    today: 'Сегодня',
    earlier: 'Ранее',
    open_tabs: 'Открытые вкладки',
    no_open_tabs: 'Нет открытых вкладок',
    no_open_tabs_desc: 'Ваши открытые вкладки браузера появятся здесь.',
    save_all_tabs: 'Сохранить все',
    save_close_all: 'Сохранить и закрыть все',
    saved: 'Сохранено',
    close_tab: 'Закрыть вкладку',
    save_tab: 'Сохранить вкладку',
    open_in_tab: 'Открыть в новой вкладке',
    delete: 'Удалить',
    tabs_word: 'вкл.',
    language: 'Язык',
    russian: 'Русский',
    english: 'English',
    settings_title: 'Настройки',
    close: 'Закрыть',
    new_tab: 'Новая вкладка',
    tab_saved: 'Вкладка сохранена!',
    all_saved: 'Все вкладки сохранены!',
    active_tab: 'активная',
  },
  en: {
    greeting_morning: 'Good morning',
    greeting_afternoon: 'Good afternoon',
    greeting_evening: 'Good evening',
    greeting_night: 'Working late',
    spaces: 'Spaces',
    all: 'All',
    inbox: 'Inbox',
    search_placeholder: 'Search tabs, projects...',
    options: 'Options',
    projects: 'Projects',
    no_projects: 'No projects yet',
    no_projects_desc: 'Group your tabs into projects to keep related work together.',
    no_matching_projects: 'No matching projects',
    try_different: 'Try a different search term.',
    inbox_clear: 'Inbox is clear',
    inbox_clear_desc: 'Saved tabs will appear here. Use the extension popup to save tabs.',
    no_matching_tabs: 'No matching tabs',
    today: 'Today',
    earlier: 'Earlier',
    open_tabs: 'Open Tabs',
    no_open_tabs: 'No open tabs',
    no_open_tabs_desc: 'Your open browser tabs will appear here.',
    save_all_tabs: 'Save all',
    save_close_all: 'Save & close all',
    saved: 'Saved',
    close_tab: 'Close tab',
    save_tab: 'Save tab',
    open_in_tab: 'Open in new tab',
    delete: 'Delete',
    tabs_word: 'tabs',
    language: 'Language',
    russian: 'Русский',
    english: 'English',
    settings_title: 'Settings',
    close: 'Close',
    new_tab: 'New tab',
    tab_saved: 'Tab saved!',
    all_saved: 'All tabs saved!',
    active_tab: 'active',
  }
};

function t(key) {
  return i18n[state.lang]?.[key] || i18n.en[key] || key;
}

// ============================================
// State Management
// ============================================

const state = {
  lang: 'ru',
  activeSpace: 'all',
  searchQuery: '',
  optionsOpen: false,
  spaces: [
    { id: 'media', name: 'MEDIA Tiger', color: 'media', count: 0 },
    { id: 'projects', name: 'Projects', color: 'projects', count: 0 },
    { id: 'crypto', name: 'Web3 / Crypto', color: 'crypto', count: 0 },
    { id: 'learning', name: 'Learning', color: 'learning', count: 0 },
    { id: 'personal', name: 'Personal', color: 'personal', count: 0 }
  ],
  projects: [
    {
      id: 1, name: 'Brand Redesign', icon: '◆', tabCount: 12, lastActive: '2 hours ago',
      tabs: [
        { title: 'Figma - Brand Guidelines', favicon: null },
        { title: 'Dribbble - Inspiration', favicon: null },
        { title: 'Notion - Project Brief', favicon: null }
      ]
    },
    {
      id: 2, name: 'Research Notes', icon: '◇', tabCount: 8, lastActive: 'Yesterday',
      tabs: [
        { title: 'Wikipedia - Design Patterns', favicon: null },
        { title: 'Medium - UX Articles', favicon: null }
      ]
    },
    {
      id: 3, name: 'Side Project', icon: '○', tabCount: 5, lastActive: '3 days ago',
      tabs: [
        { title: 'GitHub - Repository', favicon: null },
        { title: 'Stack Overflow', favicon: null }
      ]
    }
  ],
  inbox: { today: [], older: [] },
  openTabs: [],
  tabDataMap: {}
};

// ============================================
// Utilities
// ============================================

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return t('greeting_morning');
  if (hour >= 12 && hour < 17) return t('greeting_afternoon');
  if (hour >= 17 && hour < 21) return t('greeting_evening');
  return t('greeting_night');
}

function getDateString() {
  const now = new Date();
  const locale = state.lang === 'ru' ? 'ru-RU' : 'en-US';
  return now.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

function safeHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function faviconHtml(favicon, size = 14) {
  if (favicon) {
    return `<img src="${favicon}" width="${size}" height="${size}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><svg style="display:none" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"><rect x="2" y="2" width="12" height="12" rx="2"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"><rect x="2" y="2" width="12" height="12" rx="2"/></svg>`;
}

// ============================================
// Component Renderers
// ============================================

function renderSidebar() {
  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">◈</div>
          <span>TabZen</span>
        </div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">${t('spaces')}</div>
        <nav class="spaces-list">
          <div class="space-item ${state.activeSpace === 'all' ? 'active' : ''}" data-space="all">
            <span class="space-dot all"></span>
            <span class="space-name">${t('all')}</span>
            <span class="space-count">${getTotalTabCount()}</span>
          </div>
          ${state.spaces.map(space => `
            <div class="space-item ${state.activeSpace === space.id ? 'active' : ''}" data-space="${space.id}">
              <span class="space-dot ${space.color}"></span>
              <span class="space-name">${space.name}</span>
              <span class="space-count">${space.count}</span>
            </div>
          `).join('')}
          <div class="space-item ${state.activeSpace === 'inbox' ? 'active' : ''}" data-space="inbox">
            <span class="space-dot inbox"></span>
            <span class="space-name">${t('inbox')}</span>
            <span class="space-count">${state.inbox.today.length + state.inbox.older.length}</span>
          </div>
        </nav>
      </div>
    </aside>
  `;
}

function getTotalTabCount() {
  return state.inbox.today.length + state.inbox.older.length;
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="topbar-greeting">
          <span class="greeting-accent">${getGreeting()}</span>
        </h1>
        <p class="topbar-date">${getDateString()}</p>
      </div>
      <div class="topbar-right">
        <div class="search-container">
          <input type="text" class="search-input focus-animated" placeholder="${t('search_placeholder')}" value="${state.searchQuery}">
          <span class="search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/>
            </svg>
          </span>
          <span class="search-hint">⌘K</span>
        </div>
        <button class="action-btn" id="options-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
          </svg>
          <span>${t('options')}</span>
        </button>
      </div>
    </header>
  `;
}

function renderOptionsModal() {
  if (!state.optionsOpen) return '';
  return `
    <div class="modal-overlay" id="options-overlay">
      <div class="modal-panel">
        <div class="modal-header">
          <h2 class="modal-title">${t('settings_title')}</h2>
          <button class="modal-close-btn" id="modal-close-btn" title="${t('close')}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4l8 8M12 4l-8 8"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="setting-row">
            <div class="setting-label">${t('language')}</div>
            <div class="setting-control">
              <button class="lang-btn ${state.lang === 'ru' ? 'active' : ''}" data-lang="ru">${t('russian')}</button>
              <button class="lang-btn ${state.lang === 'en' ? 'active' : ''}" data-lang="en">${t('english')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProjectCard(project) {
  const tabPreviews = project.tabs.slice(0, 3).map(tab => `
    <div class="tab-preview">
      <div class="tab-preview-favicon"></div>
      <span class="tab-preview-title">${tab.title}</span>
    </div>
  `).join('');
  const moreCount = project.tabCount - 3;

  return `
    <article class="project-card" data-project="${project.id}" draggable="true">
      <div class="project-card-header">
        <div class="project-icon">${project.icon}</div>
        <div class="project-info">
          <h3 class="project-name">${project.name}</h3>
          <p class="project-meta">${project.tabCount} ${t('tabs_word')} · ${project.lastActive}</p>
        </div>
      </div>
      <div class="project-tabs-preview">
        ${tabPreviews}
        ${moreCount > 0 ? `<span class="tab-preview-more">+${moreCount}</span>` : ''}
      </div>
    </article>
  `;
}

function renderSavedTabCard(tab) {
  return `
    <article class="tab-card" data-tab="${tab.id}" data-url="${tab.fullUrl || ''}" data-space="${tab.spaceId || 'inbox'}" draggable="true">
      <div class="tab-favicon">${faviconHtml(tab.favicon)}</div>
      <div class="tab-content">
        <h4 class="tab-title">${tab.title}</h4>
        <p class="tab-url">${tab.url}</p>
      </div>
      <span class="tab-time">${tab.time}</span>
      <div class="tab-actions">
        <button class="tab-action-btn open-tab-btn" title="${t('open_in_tab')}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h4"/><path d="M9 2h5v5"/><path d="M14 2L7 9"/>
          </svg>
        </button>
        <button class="tab-action-btn delete-tab-btn" title="${t('delete')}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </button>
      </div>
    </article>
  `;
}

function renderOpenTabCard(tab) {
  return `
    <article class="tab-card open-tab-card" data-browser-tab-id="${tab.id}" data-url="${tab.url}" draggable="true">
      <div class="tab-favicon">${faviconHtml(tab.favIconUrl)}</div>
      <div class="tab-content">
        <h4 class="tab-title">${tab.title || t('new_tab')}</h4>
        <p class="tab-url">${safeHostname(tab.url)}</p>
      </div>
      ${tab.active ? `<span class="tab-badge">${t('active_tab')}</span>` : ''}
      <div class="tab-actions">
        <button class="tab-action-btn save-open-tab-btn" title="${t('save_tab')}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3v10M3 8l5 5 5-5"/>
          </svg>
        </button>
        <button class="tab-action-btn close-open-tab-btn" title="${t('close_tab')}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </button>
      </div>
    </article>
  `;
}

// ============================================
// Sections
// ============================================

function getFilteredInbox() {
  const filterBySearch = (tabs) => {
    if (!state.searchQuery) return tabs;
    const q = state.searchQuery.toLowerCase();
    return tabs.filter(t => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q));
  };
  const filterBySpace = (tabs) => {
    if (state.activeSpace === 'all') return tabs;
    if (state.activeSpace === 'inbox') return tabs.filter(t => !t.spaceId || t.spaceId === 'inbox');
    return tabs.filter(t => t.spaceId === state.activeSpace);
  };
  return {
    today: filterBySearch(filterBySpace(state.inbox.today)),
    older: filterBySearch(filterBySpace(state.inbox.older))
  };
}

function getFilteredProjects() {
  if (!state.searchQuery) return state.projects;
  const q = state.searchQuery.toLowerCase();
  return state.projects.filter(p =>
    p.name.toLowerCase().includes(q) || p.tabs.some(t => t.title.toLowerCase().includes(q))
  );
}

function getFilteredOpenTabs() {
  if (!state.searchQuery) return state.openTabs;
  const q = state.searchQuery.toLowerCase();
  return state.openTabs.filter(t =>
    (t.title || '').toLowerCase().includes(q) || (t.url || '').toLowerCase().includes(q)
  );
}

function renderOpenTabsSection() {
  const tabs = getFilteredOpenTabs();

  if (tabs.length === 0) {
    return `
      <section class="open-tabs-section">
        <div class="section-header">
          <h2 class="section-title">${t('open_tabs')}</h2>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">◎</div>
          <h3 class="empty-state-title">${state.searchQuery ? t('no_matching_tabs') : t('no_open_tabs')}</h3>
          <p class="empty-state-description">${state.searchQuery ? t('try_different') : t('no_open_tabs_desc')}</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="open-tabs-section">
      <div class="section-header">
        <h2 class="section-title">${t('open_tabs')}</h2>
        <span class="section-count">${tabs.length}</span>
        <div class="section-actions">
          <button class="section-btn" id="save-all-btn" title="${t('save_all_tabs')}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3v10M3 8l5 5 5-5"/>
            </svg>
            ${t('save_all_tabs')}
          </button>
          <button class="section-btn danger" id="save-close-all-btn" title="${t('save_close_all')}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 9v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h4"/><path d="M9 2h5v5"/><path d="M14 2L7 9"/>
            </svg>
            ${t('save_close_all')}
          </button>
        </div>
      </div>
      <div class="tabs-list open-tabs-list">
        ${tabs.map(renderOpenTabCard).join('')}
      </div>
    </section>
  `;
}

function renderProjectsSection() {
  const projects = getFilteredProjects();
  if (projects.length === 0) {
    return `
      <section class="projects-section">
        <div class="section-header"><h2 class="section-title">${t('projects')}</h2></div>
        <div class="empty-state">
          <div class="empty-state-icon">◇</div>
          <h3 class="empty-state-title">${state.searchQuery ? t('no_matching_projects') : t('no_projects')}</h3>
          <p class="empty-state-description">${state.searchQuery ? t('try_different') : t('no_projects_desc')}</p>
        </div>
      </section>
    `;
  }
  return `
    <section class="projects-section">
      <div class="section-header">
        <h2 class="section-title">${t('projects')}</h2>
        <span class="section-count">${projects.length}</span>
      </div>
      <div class="projects-grid" id="projects-grid">${projects.map(renderProjectCard).join('')}</div>
    </section>
  `;
}

function renderInboxSection() {
  const filtered = getFilteredInbox();
  const hasToday = filtered.today.length > 0;
  const hasOlder = filtered.older.length > 0;
  const isEmpty = !hasToday && !hasOlder;

  const sectionTitle = state.activeSpace === 'all'
    ? t('inbox')
    : (state.spaces.find(s => s.id === state.activeSpace)?.name || t('inbox'));

  if (isEmpty) {
    return `
      <section class="inbox-section">
        <div class="section-header"><h2 class="section-title">${sectionTitle}</h2></div>
        <div class="empty-state">
          <div class="empty-state-icon">○</div>
          <h3 class="empty-state-title">${state.searchQuery ? t('no_matching_tabs') : t('inbox_clear')}</h3>
          <p class="empty-state-description">${state.searchQuery ? t('try_different') : t('inbox_clear_desc')}</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="inbox-section">
      <div class="section-header">
        <h2 class="section-title">${sectionTitle}</h2>
        <span class="section-count">${filtered.today.length + filtered.older.length}</span>
      </div>
      ${hasToday ? `
        <div class="inbox-subsection">
          <h3 class="inbox-subsection-title">${t('today')}</h3>
          <div class="tabs-list" data-drop-zone="today">${filtered.today.map(renderSavedTabCard).join('')}</div>
        </div>
      ` : ''}
      ${hasOlder ? `
        <div class="inbox-subsection">
          <h3 class="inbox-subsection-title">${t('earlier')}</h3>
          <div class="tabs-list" data-drop-zone="older">${filtered.older.map(renderSavedTabCard).join('')}</div>
        </div>
      ` : ''}
    </section>
  `;
}

function renderWorkspace() {
  return `
    <main class="workspace">
      <div class="workspace-inner">
        ${renderOpenTabsSection()}
        ${renderProjectsSection()}
        ${renderInboxSection()}
      </div>
    </main>
  `;
}

function renderDashboard() {
  return `
    <div class="dashboard">
      ${renderSidebar()}
      ${renderTopbar()}
      ${renderWorkspace()}
    </div>
    ${renderOptionsModal()}
    <div class="toast-container" id="toast-container"></div>
    <div class="zen-orb" aria-hidden="true"></div>
  `;
}

// ============================================
// Toast notifications
// ============================================

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ============================================
// Event Handlers
// ============================================

let currentListeners = [];

function cleanupListeners() {
  currentListeners.forEach(({ el, event, handler }) => el.removeEventListener(event, handler));
  currentListeners = [];
}

function addListener(el, event, handler) {
  el.addEventListener(event, handler);
  currentListeners.push({ el, event, handler });
}

function setupEventListeners() {
  cleanupListeners();

  // Options button
  const optionsBtn = document.getElementById('options-btn');
  if (optionsBtn) {
    addListener(optionsBtn, 'click', () => {
      state.optionsOpen = true;
      renderModal();
    });
  }

  // Space switching
  document.querySelectorAll('.space-item').forEach(item => {
    addListener(item, 'click', () => {
      document.querySelectorAll('.space-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      state.activeSpace = item.dataset.space;

      const workspace = document.querySelector('.workspace');
      workspace.style.opacity = '0';
      workspace.style.transform = 'translateY(4px)';
      setTimeout(() => {
        workspace.innerHTML = renderWorkspaceInner();
        setupWorkspaceListeners();
        workspace.style.transition = 'opacity 350ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 350ms cubic-bezier(0.22, 0.61, 0.36, 1)';
        workspace.style.opacity = '1';
        workspace.style.transform = 'translateY(0)';
      }, 80);
    });

    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    addListener(item, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });
  });

  setupWorkspaceListeners();
  setupSearch();
  setupKeyboard();
}

function renderWorkspaceInner() {
  return `<div class="workspace-inner">
    ${renderOpenTabsSection()}
    ${renderProjectsSection()}
    ${renderInboxSection()}
  </div>`;
}

function setupWorkspaceListeners() {
  setupTabAndProjectListeners();
  setupOpenTabListeners();
  setupDragAndDrop();
  setupSaveAllButtons();
}

function renderModal() {
  // Remove existing modal
  document.getElementById('options-overlay')?.remove();
  if (!state.optionsOpen) return;

  const frag = document.createElement('div');
  frag.innerHTML = renderOptionsModal();
  document.body.appendChild(frag.firstElementChild);

  // Close button
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('options-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'options-overlay') closeModal();
  });

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      state.lang = lang;

      // Persist setting
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'saveSettings', settings: { lang } });
      }

      closeModal();
      // Full re-render with new language
      const root = document.getElementById('root');
      root.innerHTML = renderDashboard();
      setupEventListeners();
      loadOpenTabs();
    });
  });
}

function closeModal() {
  state.optionsOpen = false;
  const overlay = document.getElementById('options-overlay');
  if (overlay) {
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 200);
  }
}

function setupTabAndProjectListeners() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('mouseenter', () => { card.style.willChange = 'transform, box-shadow'; });
    card.addEventListener('mouseleave', () => { requestAnimationFrame(() => { card.style.willChange = 'auto'; }); });
    card.addEventListener('click', () => console.log('Open project:', card.dataset.project));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
  });

  // Saved tab cards
  document.querySelectorAll('.tab-card:not(.open-tab-card)').forEach(card => {
    card.setAttribute('tabindex', '0');
    const openBtn = card.querySelector('.open-tab-btn');
    const deleteBtn = card.querySelector('.delete-tab-btn');
    const tabUrl = card.dataset.url;
    const tabId = parseInt(card.dataset.tab, 10);

    card.addEventListener('click', (e) => { if (!e.target.closest('.tab-action-btn')) openTabUrl(tabUrl); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTabUrl(tabUrl); } });
    if (openBtn) openBtn.addEventListener('click', (e) => { e.stopPropagation(); openTabUrl(tabUrl); });
    if (deleteBtn) deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteTabCard(card, tabId); });
  });
}

function setupOpenTabListeners() {
  document.querySelectorAll('.open-tab-card').forEach(card => {
    const browserTabId = parseInt(card.dataset.browserTabId, 10);
    const tabUrl = card.dataset.url;
    const saveBtn = card.querySelector('.save-open-tab-btn');
    const closeBtn = card.querySelector('.close-open-tab-btn');

    // Click card to switch to that tab
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.tab-action-btn')) {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
          chrome.tabs.update(browserTabId, { active: true });
        }
      }
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tabData = state.openTabs.find(t => t.id === browserTabId);
        if (tabData && typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({
            action: 'saveTab',
            tab: { url: tabData.url, title: tabData.title, favIconUrl: tabData.favIconUrl }
          }, (resp) => {
            if (resp?.duplicate) {
              showToast(t('saved') + ' (dup)');
            } else {
              showToast(t('tab_saved'));
              // Add to local state immediately
              state.inbox.today.unshift({
                id: Date.now(),
                title: tabData.title || 'Untitled',
                url: safeHostname(tabData.url),
                fullUrl: tabData.url,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                favicon: tabData.favIconUrl,
                spaceId: 'inbox'
              });
              updateSpaceCounts();
              refreshWorkspace();
            }
          });
        }
        // Visual feedback
        saveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--accent-warm)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l3 3 5-5"/></svg>`;
        setTimeout(() => {
          saveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v10M3 8l5 5 5-5"/></svg>`;
        }, 1500);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({ action: 'closeTab', tabId: browserTabId }, () => {
            // Animate removal
            card.classList.add('deleting');
            card.style.pointerEvents = 'none';
            setTimeout(() => {
              state.openTabs = state.openTabs.filter(t => t.id !== browserTabId);
              card.style.height = card.offsetHeight + 'px';
              card.style.overflow = 'hidden';
              requestAnimationFrame(() => {
                card.style.transition = 'height 250ms ease, opacity 200ms ease, padding 250ms ease';
                card.style.height = '0';
                card.style.paddingTop = '0';
                card.style.paddingBottom = '0';
                card.style.opacity = '0';
              });
              setTimeout(() => card.remove(), 280);
            }, 100);
          });
        }
      });
    }
  });
}

function setupSaveAllButtons() {
  const saveAllBtn = document.getElementById('save-all-btn');
  const saveCloseAllBtn = document.getElementById('save-close-all-btn');

  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'saveAllTabs', closeTabs: false }, (resp) => {
          if (resp?.success) {
            showToast(`${t('all_saved')} (${resp.added}/${resp.total})`);
            // Reload saved tabs
            loadSavedTabs();
          }
        });
      }
    });
  }

  if (saveCloseAllBtn) {
    saveCloseAllBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'saveAllTabs', closeTabs: true }, (resp) => {
          if (resp?.success) {
            showToast(`${t('all_saved')} (${resp.added}/${resp.total})`);
            state.openTabs = [];
            loadSavedTabs();
            refreshWorkspace();
          }
        });
      }
    });
  }
}

function openTabUrl(url) {
  if (!url) return;
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: fullUrl });
  } else {
    window.open(fullUrl, '_blank');
  }
}

// ============================================
// Drag & Drop
// ============================================

let draggedElement = null;
let draggedType = null;
let placeholder = null;

function setupDragAndDrop() {
  setupProjectDragDrop();
  setupTabDragDrop();
  setupSpaceDropTargets();
}

function createPlaceholder() {
  const el = document.createElement('div');
  el.className = 'drag-placeholder';
  el.style.cssText = 'height:4px;background:var(--accent-warm,#d4b06a);border-radius:2px;margin:4px 0;opacity:0.7;transition:opacity 150ms ease;';
  return el;
}

function setupProjectDragDrop() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedElement = card;
      draggedType = 'project';
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.project);
      const ghost = card.cloneNode(true);
      ghost.style.cssText = 'opacity:0.8;position:absolute;top:-1000px;';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 20, 20);
      setTimeout(() => ghost.remove(), 0);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedElement = null; draggedType = null;
      if (placeholder?.parentNode) placeholder.remove();
      placeholder = null;
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
  });

  grid.addEventListener('dragover', (e) => {
    if (draggedType !== 'project') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const after = getDragAfterElement(grid, e.clientX, e.clientY);
    if (!placeholder) placeholder = createPlaceholder();
    after ? grid.insertBefore(placeholder, after) : grid.appendChild(placeholder);
  });

  grid.addEventListener('drop', (e) => {
    if (draggedType !== 'project') return;
    e.preventDefault();
    if (draggedElement && placeholder?.parentNode) {
      grid.insertBefore(draggedElement, placeholder);
      placeholder.remove();
      const newOrder = [...grid.querySelectorAll('.project-card')].map(c => parseInt(c.dataset.project, 10));
      state.projects = newOrder.map(id => state.projects.find(p => p.id === id)).filter(Boolean);
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'reorderProjects', order: newOrder });
      }
    }
    draggedElement = null; draggedType = null; placeholder = null;
  });
}

function setupTabDragDrop() {
  document.querySelectorAll('.tabs-list').forEach(list => {
    list.addEventListener('dragover', (e) => {
      if (draggedType !== 'tab' && draggedType !== 'open-tab') return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const after = getDragAfterElement(list, e.clientX, e.clientY);
      if (!placeholder) placeholder = createPlaceholder();
      after ? list.insertBefore(placeholder, after) : list.appendChild(placeholder);
    });

    list.addEventListener('drop', (e) => {
      if (draggedType !== 'tab' && draggedType !== 'open-tab') return;
      e.preventDefault();
      if (draggedElement && placeholder?.parentNode) {
        list.insertBefore(draggedElement, placeholder);
        placeholder.remove();
      }
      draggedElement = null; draggedType = null; placeholder = null;
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
  });

  // Saved tab cards
  document.querySelectorAll('.tab-card:not(.open-tab-card)').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedElement = card; draggedType = 'tab';
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.tab);
      setTimeout(() => card.style.opacity = '0.4', 0);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging'); card.style.opacity = '1';
      draggedElement = null; draggedType = null;
      if (placeholder?.parentNode) placeholder.remove();
      placeholder = null;
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
  });

  // Open tab cards — draggable to spaces
  document.querySelectorAll('.open-tab-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedElement = card; draggedType = 'open-tab';
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.browserTabId);
      setTimeout(() => card.style.opacity = '0.4', 0);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging'); card.style.opacity = '1';
      draggedElement = null; draggedType = null;
      if (placeholder?.parentNode) placeholder.remove();
      placeholder = null;
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
  });
}

function setupSpaceDropTargets() {
  document.querySelectorAll('.space-item').forEach(spaceItem => {
    spaceItem.addEventListener('dragover', (e) => {
      if (draggedType !== 'tab' && draggedType !== 'open-tab') return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      spaceItem.classList.add('drag-over');
    });
    spaceItem.addEventListener('dragleave', () => spaceItem.classList.remove('drag-over'));

    spaceItem.addEventListener('drop', (e) => {
      e.preventDefault();
      spaceItem.classList.remove('drag-over');
      if (!draggedElement) return;
      const targetSpace = spaceItem.dataset.space;

      if (draggedType === 'tab') {
        const tabId = parseInt(draggedElement.dataset.tab, 10);
        moveTabToSpace(tabId, targetSpace);
        draggedElement.style.transition = 'opacity 200ms ease, transform 200ms ease';
        draggedElement.style.opacity = '0';
        draggedElement.style.transform = 'scale(0.95)';
        setTimeout(() => refreshWorkspace(), 220);
      } else if (draggedType === 'open-tab') {
        // Save open tab to a space
        const browserTabId = parseInt(draggedElement.dataset.browserTabId, 10);
        const tabData = state.openTabs.find(t => t.id === browserTabId);
        if (tabData && typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({
            action: 'saveTab',
            tab: { url: tabData.url, title: tabData.title, favIconUrl: tabData.favIconUrl },
            spaceId: targetSpace === 'all' ? 'inbox' : targetSpace
          }, () => {
            state.inbox.today.unshift({
              id: Date.now(),
              title: tabData.title || 'Untitled',
              url: safeHostname(tabData.url),
              fullUrl: tabData.url,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              favicon: tabData.favIconUrl,
              spaceId: targetSpace === 'all' ? 'inbox' : targetSpace
            });
            updateSpaceCounts();
            showToast(t('tab_saved'));
            refreshWorkspace();
          });
        }
        draggedElement.style.transition = 'opacity 200ms ease, transform 200ms ease';
        draggedElement.style.opacity = '0';
        draggedElement.style.transform = 'scale(0.95)';
        setTimeout(() => { draggedElement.style.opacity = '1'; draggedElement.style.transform = ''; }, 300);
      }

      draggedElement = null; draggedType = null;
    });
  });
}

function getDragAfterElement(container, x, y) {
  const els = [...container.querySelectorAll('[draggable="true"]:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offsetY = y - box.top - box.height / 2;
    const offsetX = x - box.left - box.width / 2;
    const offset = container.classList.contains('projects-grid') ? offsetX + offsetY : offsetY;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function moveTabToSpace(tabId, spaceId) {
  const allTabs = [...state.inbox.today, ...state.inbox.older];
  const tab = allTabs.find(t => t.id === tabId);
  if (tab) tab.spaceId = spaceId;
  updateSpaceCounts();
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ action: 'moveTabToSpace', tabId, spaceId });
  }
}

function updateSpaceCounts() {
  const allTabs = [...state.inbox.today, ...state.inbox.older];
  state.spaces.forEach(space => {
    space.count = allTabs.filter(t => t.spaceId === space.id).length;
  });
}

// ============================================
// Search
// ============================================

function setupSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchContainer = document.querySelector('.search-container');
  if (!searchInput || !searchContainer) return;

  searchInput.addEventListener('focus', () => {
    searchContainer.style.transform = 'scale(1.02)';
    searchContainer.style.transition = 'transform 250ms cubic-bezier(0.22, 0.61, 0.36, 1)';
  });
  searchInput.addEventListener('blur', () => { searchContainer.style.transform = 'scale(1)'; });

  let timeout;
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    searchContainer.style.boxShadow = q.length > 0 ? '0 0 0 1px var(--accent-warm-subtle)' : 'none';
    clearTimeout(timeout);
    timeout = setTimeout(() => { state.searchQuery = q; refreshWorkspace(); }, 150);
  });
}

function refreshWorkspace() {
  const workspace = document.querySelector('.workspace');
  if (!workspace) return;
  workspace.innerHTML = renderWorkspaceInner();
  setupWorkspaceListeners();
  refreshSidebarCounts();
}

function refreshSidebarCounts() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  const allCount = sidebar.querySelector('[data-space="all"] .space-count');
  const inboxCount = sidebar.querySelector('[data-space="inbox"] .space-count');
  if (allCount) allCount.textContent = getTotalTabCount();
  if (inboxCount) inboxCount.textContent = state.inbox.today.length + state.inbox.older.length;
  state.spaces.forEach(space => {
    const el = sidebar.querySelector(`[data-space="${space.id}"] .space-count`);
    if (el) el.textContent = space.count;
  });
}

// ============================================
// Keyboard
// ============================================

function setupKeyboard() {
  addListener(document, 'keydown', (e) => {
    const searchInput = document.querySelector('.search-input');
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault(); searchInput?.focus(); searchInput?.select();
    }
    if (e.key === 'Escape') {
      if (state.optionsOpen) { closeModal(); return; }
      if (document.activeElement === searchInput && searchInput.value) {
        searchInput.value = ''; state.searchQuery = '';
        searchInput.dispatchEvent(new Event('input'));
        refreshWorkspace();
      } else {
        document.activeElement.blur();
      }
    }
  });
}

// ============================================
// Tab deletion
// ============================================

function deleteTabCard(card, tabId) {
  card.classList.add('deleting');
  card.style.pointerEvents = 'none';
  const height = card.offsetHeight;
  setTimeout(() => {
    card.style.height = height + 'px';
    card.style.marginBottom = '0';
    card.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      card.style.transition = 'height 250ms cubic-bezier(0.22, 0.61, 0.36, 1), margin 250ms ease, padding 250ms ease';
      card.style.height = '0'; card.style.paddingTop = '0'; card.style.paddingBottom = '0'; card.style.borderWidth = '0';
    });
    setTimeout(() => {
      card.remove();
      state.inbox.today = state.inbox.today.filter(t => t.id !== tabId);
      state.inbox.older = state.inbox.older.filter(t => t.id !== tabId);
      updateSpaceCounts();
      refreshSidebarCounts();
      if (state.inbox.today.length === 0 && state.inbox.older.length === 0) refreshWorkspace();
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'deleteSavedTab', tabId });
      }
    }, 280);
  }, 180);
}

// ============================================
// Load data
// ============================================

function loadOpenTabs() {
  if (typeof chrome === 'undefined' || !chrome.runtime) return;
  chrome.runtime.sendMessage({ action: 'getOpenTabs' }, (response) => {
    if (chrome.runtime.lastError) { console.warn('TabZen:', chrome.runtime.lastError.message); return; }
    if (response?.tabs) {
      state.openTabs = response.tabs;
      refreshWorkspace();
    }
  });
}

function loadSavedTabs() {
  if (typeof chrome === 'undefined' || !chrome.runtime) return;
  chrome.runtime.sendMessage({ action: 'getSavedTabs' }, (response) => {
    if (chrome.runtime.lastError) { console.warn('TabZen:', chrome.runtime.lastError.message); return; }
    if (response?.tabs && response.tabs.length > 0) {
      const today = [], older = [];
      const now = new Date();
      response.tabs.forEach(tab => {
        const savedDate = new Date(tab.savedAt);
        const isToday = savedDate.toDateString() === now.toDateString();
        const tabData = {
          id: tab.id,
          title: tab.title || 'Untitled',
          url: safeHostname(tab.url),
          fullUrl: tab.url,
          time: isToday ? savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('earlier'),
          favicon: tab.favicon,
          spaceId: tab.spaceId || 'inbox'
        };
        (isToday ? today : older).push(tabData);
      });
      if (today.length > 0) state.inbox.today = today;
      if (older.length > 0) state.inbox.older = older;
      updateSpaceCounts();
      refreshWorkspace();
    }
  });
}

// ============================================
// Init
// ============================================

function init() {
  // Load settings first, then render
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('TabZen:', chrome.runtime.lastError.message);
      }
      if (response?.settings?.lang) {
        state.lang = response.settings.lang;
      }
      renderApp();
    });
  } else {
    renderApp();
  }
}

function renderApp() {
  const root = document.getElementById('root');
  root.innerHTML = renderDashboard();
  setupEventListeners();
  loadOpenTabs();
  loadSavedTabs();

  // Refresh open tabs every 5 seconds
  setInterval(loadOpenTabsSilent, 5000);
}

function loadOpenTabsSilent() {
  if (typeof chrome === 'undefined' || !chrome.runtime) return;
  chrome.runtime.sendMessage({ action: 'getOpenTabs' }, (response) => {
    if (chrome.runtime.lastError || !response?.tabs) return;
    const oldIds = new Set(state.openTabs.map(t => t.id));
    const newIds = new Set(response.tabs.map(t => t.id));
    // Only re-render if tabs changed
    if (oldIds.size !== newIds.size || [...oldIds].some(id => !newIds.has(id))) {
      state.openTabs = response.tabs;
      // Re-render only the open tabs section
      const section = document.querySelector('.open-tabs-section');
      if (section) {
        section.outerHTML = renderOpenTabsSection();
        setupOpenTabListeners();
        setupSaveAllButtons();
        // Re-setup drag for new cards
        document.querySelectorAll('.open-tab-card').forEach(card => {
          card.addEventListener('dragstart', (e) => {
            draggedElement = card; draggedType = 'open-tab';
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.browserTabId);
            setTimeout(() => card.style.opacity = '0.4', 0);
          });
          card.addEventListener('dragend', () => {
            card.classList.remove('dragging'); card.style.opacity = '1';
            draggedElement = null; draggedType = null;
            if (placeholder?.parentNode) placeholder.remove();
            placeholder = null;
          });
        });
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
