// TabZen Dashboard — A calm visual workspace
// Phase L: Delight — now with working functionality

// ============================================
// State Management
// ============================================

const state = {
  activeSpace: 'all',
  searchQuery: '',
  spaces: [
    { id: 'media', name: 'MEDIA Tiger', color: 'media', count: 0 },
    { id: 'projects', name: 'Projects', color: 'projects', count: 0 },
    { id: 'crypto', name: 'Web3 / Crypto', color: 'crypto', count: 0 },
    { id: 'learning', name: 'Learning', color: 'learning', count: 0 },
    { id: 'personal', name: 'Personal', color: 'personal', count: 0 }
  ],
  projects: [
    {
      id: 1,
      name: 'Brand Redesign',
      icon: '◆',
      tabCount: 12,
      lastActive: '2 hours ago',
      tabs: [
        { title: 'Figma - Brand Guidelines', favicon: null },
        { title: 'Dribbble - Inspiration', favicon: null },
        { title: 'Notion - Project Brief', favicon: null }
      ]
    },
    {
      id: 2,
      name: 'Research Notes',
      icon: '◇',
      tabCount: 8,
      lastActive: 'Yesterday',
      tabs: [
        { title: 'Wikipedia - Design Patterns', favicon: null },
        { title: 'Medium - UX Articles', favicon: null }
      ]
    },
    {
      id: 3,
      name: 'Side Project',
      icon: '○',
      tabCount: 5,
      lastActive: '3 days ago',
      tabs: [
        { title: 'GitHub - Repository', favicon: null },
        { title: 'Stack Overflow', favicon: null }
      ]
    }
  ],
  inbox: {
    today: [],
    older: []
  },
  // Store full tab data with URLs for opening
  tabDataMap: {}
};

// ============================================
// Utilities
// ============================================

function getTimeOfDayGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning', period: 'morning' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', period: 'afternoon' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good evening', period: 'evening' };
  } else {
    return { greeting: 'Working late', period: 'night' };
  }
}

function getDateString() {
  const now = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return now.toLocaleDateString('en-US', options);
}

function safeHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
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
        <div class="sidebar-section-title">Spaces</div>
        <nav class="spaces-list">
          <div class="space-item ${state.activeSpace === 'all' ? 'active' : ''}" data-space="all">
            <span class="space-dot all"></span>
            <span class="space-name">All</span>
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
            <span class="space-name">Inbox</span>
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
  const { greeting } = getTimeOfDayGreeting();

  return `
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="topbar-greeting">
          <span class="greeting-accent">${greeting}</span>
        </h1>
      </div>
      <div class="topbar-right">
        <div class="search-container">
          <input type="text" class="search-input focus-animated" placeholder="Search tabs, projects..." value="${state.searchQuery}">
          <span class="search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7" cy="7" r="4.5"/>
              <path d="M10.5 10.5L14 14"/>
            </svg>
          </span>
          <span class="search-hint">⌘K</span>
        </div>
        <button class="action-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="8" r="1.5"/>
            <circle cx="8" cy="3" r="1.5"/>
            <circle cx="8" cy="13" r="1.5"/>
          </svg>
          <span>Options</span>
        </button>
      </div>
    </header>
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
          <p class="project-meta">${project.tabCount} tabs · ${project.lastActive}</p>
        </div>
      </div>
      <div class="project-tabs-preview">
        ${tabPreviews}
        ${moreCount > 0 ? `<span class="tab-preview-more">+${moreCount} more</span>` : ''}
      </div>
    </article>
  `;
}

function renderTabCard(tab) {
  return `
    <article class="tab-card" data-tab="${tab.id}" data-url="${tab.fullUrl || ''}" data-space="${tab.spaceId || 'inbox'}" draggable="true">
      <div class="tab-favicon">
        ${tab.favicon
          ? `<img src="${tab.favicon}" width="14" height="14" alt="" onerror="this.parentElement.innerHTML='<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 16 16\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' opacity=\\'0.4\\'><rect x=\\'2\\' y=\\'2\\' width=\\'12\\' height=\\'12\\' rx=\\'2\\'/></svg>'">`
          : `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
              <rect x="2" y="2" width="12" height="12" rx="2"/>
            </svg>`
        }
      </div>
      <div class="tab-content">
        <h4 class="tab-title">${tab.title}</h4>
        <p class="tab-url">${tab.url}</p>
      </div>
      <span class="tab-time">${tab.time}</span>
      <div class="tab-actions">
        <button class="tab-action-btn open-tab-btn" title="Open in new tab">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h4"/>
            <path d="M9 2h5v5"/>
            <path d="M14 2L7 9"/>
          </svg>
        </button>
        <button class="tab-action-btn delete-tab-btn" title="Delete">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </button>
      </div>
    </article>
  `;
}

function getFilteredInbox() {
  const filterBySearch = (tabs) => {
    if (!state.searchQuery) return tabs;
    const q = state.searchQuery.toLowerCase();
    return tabs.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.url.toLowerCase().includes(q)
    );
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
    p.name.toLowerCase().includes(q) ||
    p.tabs.some(t => t.title.toLowerCase().includes(q))
  );
}

function renderProjectsSection() {
  const projects = getFilteredProjects();

  if (projects.length === 0) {
    return `
      <section class="projects-section">
        <div class="section-header">
          <h2 class="section-title">Projects</h2>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">◇</div>
          <h3 class="empty-state-title">${state.searchQuery ? 'No matching projects' : 'No projects yet'}</h3>
          <p class="empty-state-description">${state.searchQuery ? 'Try a different search term.' : 'Group your tabs into projects to keep related work together.'}</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="projects-section">
      <div class="section-header">
        <h2 class="section-title">Projects</h2>
        <span class="section-count">${projects.length}</span>
      </div>
      <div class="projects-grid" id="projects-grid">
        ${projects.map(renderProjectCard).join('')}
      </div>
    </section>
  `;
}

function renderInboxSection() {
  const filtered = getFilteredInbox();
  const hasToday = filtered.today.length > 0;
  const hasOlder = filtered.older.length > 0;
  const isEmpty = !hasToday && !hasOlder;

  if (isEmpty) {
    return `
      <section class="inbox-section">
        <div class="section-header">
          <h2 class="section-title">Inbox</h2>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">○</div>
          <h3 class="empty-state-title">${state.searchQuery ? 'No matching tabs' : 'Inbox is clear'}</h3>
          <p class="empty-state-description">${state.searchQuery ? 'Try a different search term.' : 'Saved tabs will appear here. Use the extension popup to save tabs.'}</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="inbox-section">
      <div class="section-header">
        <h2 class="section-title">${state.activeSpace === 'all' ? 'Inbox' : state.spaces.find(s => s.id === state.activeSpace)?.name || 'Inbox'}</h2>
        <span class="section-count">${filtered.today.length + filtered.older.length}</span>
      </div>

      ${hasToday ? `
        <div class="inbox-subsection">
          <h3 class="inbox-subsection-title">Today</h3>
          <div class="tabs-list" data-drop-zone="today">
            ${filtered.today.map(renderTabCard).join('')}
          </div>
        </div>
      ` : ''}

      ${hasOlder ? `
        <div class="inbox-subsection">
          <h3 class="inbox-subsection-title">Earlier</h3>
          <div class="tabs-list" data-drop-zone="older">
            ${filtered.older.map(renderTabCard).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  `;
}

function renderWorkspace() {
  return `
    <main class="workspace">
      <div class="workspace-inner">
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
    <div class="zen-orb" aria-hidden="true"></div>
  `;
}

// ============================================
// Event Handlers
// ============================================

let currentListeners = [];

function cleanupListeners() {
  currentListeners.forEach(({ el, event, handler }) => {
    el.removeEventListener(event, handler);
  });
  currentListeners = [];
}

function addListener(el, event, handler) {
  el.addEventListener(event, handler);
  currentListeners.push({ el, event, handler });
}

function setupEventListeners() {
  cleanupListeners();

  // Space switching
  document.querySelectorAll('.space-item').forEach(item => {
    addListener(item, 'click', () => {
      const spaceId = item.dataset.space;
      document.querySelectorAll('.space-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      state.activeSpace = spaceId;

      // Re-render workspace content with fade
      const workspace = document.querySelector('.workspace');
      workspace.style.opacity = '0';
      workspace.style.transform = 'translateY(4px)';

      setTimeout(() => {
        workspace.innerHTML = `<div class="workspace-inner">
          ${renderProjectsSection()}
          ${renderInboxSection()}
        </div>`;
        setupTabAndProjectListeners();
        setupDragAndDrop();

        workspace.style.transition = 'opacity 350ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 350ms cubic-bezier(0.22, 0.61, 0.36, 1)';
        workspace.style.opacity = '1';
        workspace.style.transform = 'translateY(0)';
      }, 80);
    });

    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    addListener(item, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  setupTabAndProjectListeners();
  setupDragAndDrop();
  setupSearch();
  setupKeyboard();
}

function setupTabAndProjectListeners() {
  // Project card interactions
  document.querySelectorAll('.project-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');

    card.addEventListener('mouseenter', () => {
      card.style.willChange = 'transform, box-shadow';
    });
    card.addEventListener('mouseleave', () => {
      requestAnimationFrame(() => { card.style.willChange = 'auto'; });
    });

    card.addEventListener('click', () => {
      console.log('Open project:', card.dataset.project);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Tab card interactions
  document.querySelectorAll('.tab-card').forEach(card => {
    card.setAttribute('tabindex', '0');

    const openBtn = card.querySelector('.open-tab-btn');
    const deleteBtn = card.querySelector('.delete-tab-btn');
    const tabUrl = card.dataset.url;
    const tabId = parseInt(card.dataset.tab, 10);

    // Click on card itself opens the tab
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.tab-action-btn')) {
        openTabUrl(tabUrl);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTabUrl(tabUrl);
      }
    });

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTabUrl(tabUrl);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTabCard(card, tabId);
      });
    }
  });
}

function openTabUrl(url) {
  if (!url) return;
  // Ensure the URL has a protocol
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: fullUrl });
  } else {
    window.open(fullUrl, '_blank');
  }
}

// ============================================
// Drag & Drop — Full Implementation
// ============================================

let draggedElement = null;
let draggedType = null; // 'project' or 'tab'
let placeholder = null;

function setupDragAndDrop() {
  setupProjectDragDrop();
  setupTabDragDrop();
  setupSpaceDropTargets();
}

function createPlaceholder() {
  const el = document.createElement('div');
  el.className = 'drag-placeholder';
  el.style.cssText = `
    height: 4px;
    background: var(--accent-warm, #d4b06a);
    border-radius: 2px;
    margin: 4px 0;
    opacity: 0.7;
    transition: opacity 150ms ease;
  `;
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

      // Ghost image
      const ghost = card.cloneNode(true);
      ghost.style.opacity = '0.8';
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 20, 20);
      setTimeout(() => ghost.remove(), 0);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedElement = null;
      draggedType = null;
      if (placeholder && placeholder.parentNode) {
        placeholder.remove();
      }
      placeholder = null;
      // Remove all drop-over states
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
  });

  // Grid as drop zone for reordering projects
  grid.addEventListener('dragover', (e) => {
    if (draggedType !== 'project') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const afterElement = getDragAfterElement(grid, e.clientX, e.clientY);
    if (!placeholder) placeholder = createPlaceholder();

    if (afterElement) {
      grid.insertBefore(placeholder, afterElement);
    } else {
      grid.appendChild(placeholder);
    }
  });

  grid.addEventListener('drop', (e) => {
    if (draggedType !== 'project') return;
    e.preventDefault();

    if (draggedElement && placeholder && placeholder.parentNode) {
      grid.insertBefore(draggedElement, placeholder);
      placeholder.remove();

      // Update state order
      const newOrder = [...grid.querySelectorAll('.project-card')].map(c => parseInt(c.dataset.project, 10));
      const reordered = newOrder.map(id => state.projects.find(p => p.id === id)).filter(Boolean);
      state.projects = reordered;

      // Persist order
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'reorderProjects', order: newOrder });
      }
    }

    draggedElement = null;
    draggedType = null;
    placeholder = null;
  });
}

function setupTabDragDrop() {
  document.querySelectorAll('.tabs-list').forEach(list => {
    list.addEventListener('dragover', (e) => {
      if (draggedType !== 'tab') return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const afterElement = getDragAfterElement(list, e.clientX, e.clientY);
      if (!placeholder) placeholder = createPlaceholder();

      if (afterElement) {
        list.insertBefore(placeholder, afterElement);
      } else {
        list.appendChild(placeholder);
      }
    });

    list.addEventListener('drop', (e) => {
      if (draggedType !== 'tab') return;
      e.preventDefault();

      if (draggedElement && placeholder && placeholder.parentNode) {
        list.insertBefore(draggedElement, placeholder);
        placeholder.remove();
      }

      draggedElement = null;
      draggedType = null;
      placeholder = null;
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
  });

  document.querySelectorAll('.tab-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedElement = card;
      draggedType = 'tab';
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.tab);

      setTimeout(() => card.style.opacity = '0.4', 0);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      card.style.opacity = '1';
      draggedElement = null;
      draggedType = null;
      if (placeholder && placeholder.parentNode) {
        placeholder.remove();
      }
      placeholder = null;
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
  });
}

function setupSpaceDropTargets() {
  document.querySelectorAll('.space-item').forEach(spaceItem => {
    spaceItem.addEventListener('dragover', (e) => {
      if (draggedType !== 'tab') return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      spaceItem.classList.add('drag-over');
    });

    spaceItem.addEventListener('dragleave', () => {
      spaceItem.classList.remove('drag-over');
    });

    spaceItem.addEventListener('drop', (e) => {
      e.preventDefault();
      spaceItem.classList.remove('drag-over');

      if (draggedType !== 'tab' || !draggedElement) return;

      const tabId = parseInt(draggedElement.dataset.tab, 10);
      const targetSpace = spaceItem.dataset.space;

      // Move in state
      moveTabToSpace(tabId, targetSpace);

      // Animate removal from current position
      draggedElement.style.transition = 'opacity 200ms ease, transform 200ms ease';
      draggedElement.style.opacity = '0';
      draggedElement.style.transform = 'scale(0.95)';
      setTimeout(() => {
        refreshWorkspace();
      }, 220);

      draggedElement = null;
      draggedType = null;
    });
  });
}

function getDragAfterElement(container, x, y) {
  const draggableElements = [...container.querySelectorAll('[draggable="true"]:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offsetY = y - box.top - box.height / 2;
    const offsetX = x - box.left - box.width / 2;

    // Use Y for vertical lists, combined for grids
    const offset = container.classList.contains('projects-grid')
      ? offsetX + offsetY
      : offsetY;

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function moveTabToSpace(tabId, spaceId) {
  // Update local state
  const allTabs = [...state.inbox.today, ...state.inbox.older];
  const tab = allTabs.find(t => t.id === tabId);
  if (tab) {
    tab.spaceId = spaceId;
  }

  // Update space counts
  updateSpaceCounts();

  // Persist to storage
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

  searchInput.addEventListener('blur', () => {
    searchContainer.style.transform = 'scale(1)';
  });

  let searchTimeout;
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();

    if (query.length > 0) {
      searchContainer.style.boxShadow = '0 0 0 1px var(--accent-warm-subtle)';
    } else {
      searchContainer.style.boxShadow = 'none';
    }

    // Debounce search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = query;
      refreshWorkspace();
    }, 150);
  });
}

function refreshWorkspace() {
  const workspace = document.querySelector('.workspace');
  if (!workspace) return;

  workspace.innerHTML = `<div class="workspace-inner">
    ${renderProjectsSection()}
    ${renderInboxSection()}
  </div>`;
  setupTabAndProjectListeners();
  setupDragAndDrop();

  // Also refresh sidebar counts
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    const countEls = sidebar.querySelectorAll('.space-count');
    const allCount = sidebar.querySelector('[data-space="all"] .space-count');
    const inboxCount = sidebar.querySelector('[data-space="inbox"] .space-count');
    if (allCount) allCount.textContent = getTotalTabCount();
    if (inboxCount) inboxCount.textContent = state.inbox.today.length + state.inbox.older.length;
    state.spaces.forEach(space => {
      const el = sidebar.querySelector(`[data-space="${space.id}"] .space-count`);
      if (el) el.textContent = space.count;
    });
  }
}

// ============================================
// Keyboard
// ============================================

function setupKeyboard() {
  addListener(document, 'keydown', (e) => {
    const searchInput = document.querySelector('.search-input');

    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
      searchInput?.select();
    }

    if (e.key === 'Escape') {
      if (document.activeElement === searchInput && searchInput.value) {
        searchInput.value = '';
        state.searchQuery = '';
        searchInput.dispatchEvent(new Event('input'));
        refreshWorkspace();
      } else {
        document.activeElement.blur();
      }
    }
  });
}

// ============================================
// Tab card deletion with storage persistence
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
      card.style.transition = 'height 250ms cubic-bezier(0.22, 0.61, 0.36, 1), margin 250ms cubic-bezier(0.22, 0.61, 0.36, 1), padding 250ms cubic-bezier(0.22, 0.61, 0.36, 1)';
      card.style.height = '0';
      card.style.paddingTop = '0';
      card.style.paddingBottom = '0';
      card.style.borderWidth = '0';
    });

    setTimeout(() => {
      card.remove();

      // Update state
      state.inbox.today = state.inbox.today.filter(t => t.id !== tabId);
      state.inbox.older = state.inbox.older.filter(t => t.id !== tabId);
      updateSpaceCounts();

      // Update section counts in DOM
      const sectionCount = document.querySelector('.inbox-section .section-count');
      if (sectionCount) {
        sectionCount.textContent = state.inbox.today.length + state.inbox.older.length;
      }

      // If section is now empty, re-render
      if (state.inbox.today.length === 0 && state.inbox.older.length === 0) {
        refreshWorkspace();
      }

      // Persist deletion to storage
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'deleteSavedTab', tabId });
      }
    }, 280);
  }, 180);
}

// ============================================
// Initialization
// ============================================

function init() {
  const root = document.getElementById('root');
  root.innerHTML = renderDashboard();
  setupEventListeners();

  // Load saved tabs from storage
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ action: 'getSavedTabs' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('TabZen: Could not load saved tabs:', chrome.runtime.lastError.message);
        return;
      }

      if (response && response.tabs && response.tabs.length > 0) {
        const today = [];
        const older = [];
        const now = new Date();

        response.tabs.forEach(tab => {
          const savedDate = new Date(tab.savedAt);
          const isToday = savedDate.toDateString() === now.toDateString();

          const tabData = {
            id: tab.id,
            title: tab.title || 'Untitled',
            url: safeHostname(tab.url),
            fullUrl: tab.url,
            time: isToday ? savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier',
            favicon: tab.favicon,
            spaceId: tab.spaceId || 'inbox'
          };

          if (isToday) {
            today.push(tabData);
          } else {
            older.push(tabData);
          }
        });

        if (today.length > 0) state.inbox.today = today;
        if (older.length > 0) state.inbox.older = older;

        updateSpaceCounts();

        // Re-render with fade
        const inboxSection = document.querySelector('.inbox-section');
        if (inboxSection) {
          inboxSection.style.opacity = '0';
          setTimeout(() => {
            refreshWorkspace();
            const newSection = document.querySelector('.inbox-section');
            if (newSection) {
              newSection.style.opacity = '0';
              newSection.style.transition = 'opacity 300ms ease-out';
              requestAnimationFrame(() => { newSection.style.opacity = '1'; });
            }
          }, 150);
        }

        // Update sidebar counts
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          const allCount = sidebar.querySelector('[data-space="all"] .space-count');
          const inboxCount = sidebar.querySelector('[data-space="inbox"] .space-count');
          if (allCount) allCount.textContent = getTotalTabCount();
          if (inboxCount) inboxCount.textContent = state.inbox.today.length + state.inbox.older.length;
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
