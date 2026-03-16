// TabZen Dashboard — A calm visual workspace
// Phase L: Delight

// ============================================
// State Management
// ============================================

const state = {
  activeSpace: 'all',
  spaces: [
    { id: 'media', name: 'MEDIA Tiger', color: 'media', count: 3 },
    { id: 'projects', name: 'Projects', color: 'projects', count: 5 },
    { id: 'crypto', name: 'Web3 / Crypto', color: 'crypto', count: 2 },
    { id: 'learning', name: 'Learning', color: 'learning', count: 8 },
    { id: 'personal', name: 'Personal', color: 'personal', count: 4 }
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
    today: [
      { id: 101, title: 'The Art of Calm Design — A Manifesto', url: 'medium.com', time: '10:32 AM', favicon: null },
      { id: 102, title: 'Framer Motion Documentation', url: 'framer.com', time: '9:15 AM', favicon: null },
      { id: 103, title: 'GitHub - shadcn/ui: Components', url: 'github.com', time: '8:45 AM', favicon: null }
    ],
    older: [
      { id: 201, title: 'Arc Browser - The Internet Computer', url: 'arc.net', time: 'Yesterday', favicon: null },
      { id: 202, title: 'Toby - Visual Tab Manager', url: 'gettoby.com', time: '2 days ago', favicon: null }
    ]
  }
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
          ${state.spaces.map(space => `
            <div class="space-item ${state.activeSpace === space.id ? 'active' : ''}" data-space="${space.id}">
              <span class="space-dot ${space.color}"></span>
              <span class="space-name">${space.name}</span>
              <span class="space-count">${space.count}</span>
            </div>
          `).join('')}
        </nav>
      </div>
    </aside>
  `;
}

function renderTopbar() {
  const { greeting, period } = getTimeOfDayGreeting();
  
  return `
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="topbar-greeting">
          <span class="greeting-accent">${greeting}</span>
        </h1>
      </div>
      <div class="topbar-right">
        <div class="search-container">
          <input type="text" class="search-input focus-animated" placeholder="Search tabs, projects...">
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
    <article class="project-card" data-project="${project.id}">
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
    <article class="tab-card" data-tab="${tab.id}">
      <div class="tab-favicon">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
          <rect x="2" y="2" width="12" height="12" rx="2"/>
        </svg>
      </div>
      <div class="tab-content">
        <h4 class="tab-title">${tab.title}</h4>
        <p class="tab-url">${tab.url}</p>
      </div>
      <span class="tab-time">${tab.time}</span>
      <div class="tab-actions">
        <button class="tab-action-btn" title="Open">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h4"/>
            <path d="M9 2h5v5"/>
            <path d="M14 2L7 9"/>
          </svg>
        </button>
        <button class="tab-action-btn" title="Delete">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </button>
      </div>
    </article>
  `;
}

function renderProjectsSection() {
  if (state.projects.length === 0) {
    return `
      <section class="projects-section">
        <div class="section-header">
          <h2 class="section-title">Projects</h2>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">◇</div>
          <h3 class="empty-state-title">No projects yet</h3>
          <p class="empty-state-description">Group your tabs into projects to keep related work together.</p>
        </div>
      </section>
    `;
  }
  
  return `
    <section class="projects-section">
      <div class="section-header">
        <h2 class="section-title">Projects</h2>
        <span class="section-count">${state.projects.length}</span>
      </div>
      <div class="projects-grid">
        ${state.projects.map(renderProjectCard).join('')}
      </div>
    </section>
  `;
}

function renderInboxSection() {
  const hasToday = state.inbox.today.length > 0;
  const hasOlder = state.inbox.older.length > 0;
  const isEmpty = !hasToday && !hasOlder;
  
  if (isEmpty) {
    return `
      <section class="inbox-section">
        <div class="section-header">
          <h2 class="section-title">Inbox</h2>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">○</div>
          <h3 class="empty-state-title">Inbox is clear</h3>
          <p class="empty-state-description">Saved tabs will appear here. Use the extension popup to save tabs.</p>
        </div>
      </section>
    `;
  }
  
  return `
    <section class="inbox-section">
      <div class="section-header">
        <h2 class="section-title">Inbox</h2>
        <span class="section-count">${state.inbox.today.length + state.inbox.older.length}</span>
      </div>
      
      ${hasToday ? `
        <div class="inbox-subsection">
          <h3 class="inbox-subsection-title">Today</h3>
          <div class="tabs-list">
            ${state.inbox.today.map(renderTabCard).join('')}
          </div>
        </div>
      ` : ''}
      
      ${hasOlder ? `
        <div class="inbox-subsection">
          <h3 class="inbox-subsection-title">Earlier</h3>
          <div class="tabs-list">
            ${state.inbox.older.map(renderTabCard).join('')}
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

function setupEventListeners() {
  // Space switching with calm transition
  document.querySelectorAll('.space-item').forEach(item => {
    item.addEventListener('click', () => {
      const spaceId = item.dataset.space;
      
      // Update active state with subtle ripple effect
      document.querySelectorAll('.space-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      
      state.activeSpace = spaceId;
      
      // Subtle workspace fade transition
      const workspace = document.querySelector('.workspace');
      workspace.style.opacity = '0';
      workspace.style.transform = 'translateY(4px)';
      
      setTimeout(() => {
        workspace.style.transition = 'opacity 350ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 350ms cubic-bezier(0.22, 0.61, 0.36, 1)';
        workspace.style.opacity = '1';
        workspace.style.transform = 'translateY(0)';
      }, 80);
    });
    
    // Add keyboard support for spaces
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
  
  // Project card interactions
  document.querySelectorAll('.project-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    
    // Performance optimization
    card.addEventListener('mouseenter', () => {
      card.style.willChange = 'transform, box-shadow';
    });
    
    card.addEventListener('mouseleave', () => {
      requestAnimationFrame(() => {
        card.style.willChange = 'auto';
      });
    });
    
    // Drag support
    card.setAttribute('draggable', 'true');
    
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.project);
      
      // Create ghost image with opacity
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
    });
    
    card.addEventListener('click', () => {
      // Would open project detail view
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
    card.setAttribute('role', 'button');
    
    const openBtn = card.querySelector('.tab-action-btn:first-child');
    const deleteBtn = card.querySelector('.tab-action-btn:last-child');
    
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.tab-action-btn')) {
        console.log('Open tab:', card.dataset.tab);
      }
    });
    
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('Open tab:', card.dataset.tab);
      }
    });
    
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Open in new tab:', card.dataset.tab);
      });
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTabCard(card);
      });
    }
  });
  
  // Search focus enhancement with smooth scale
  const searchInput = document.querySelector('.search-input');
  const searchContainer = document.querySelector('.search-container');
  
  if (searchInput && searchContainer) {
    searchInput.addEventListener('focus', () => {
      searchContainer.style.transform = 'scale(1.02)';
      searchContainer.style.transition = 'transform 250ms cubic-bezier(0.22, 0.61, 0.36, 1)';
    });
    
    searchInput.addEventListener('blur', () => {
      searchContainer.style.transform = 'scale(1)';
    });
    
    // Typing feedback
    searchInput.addEventListener('input', () => {
      if (searchInput.value.length > 0) {
        searchContainer.style.boxShadow = '0 0 0 1px var(--accent-warm-subtle)';
      } else {
        searchContainer.style.boxShadow = 'none';
      }
    });
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // ⌘K or Ctrl+K to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
      searchInput?.select();
    }
    
    // Escape to blur and clear
    if (e.key === 'Escape') {
      if (document.activeElement === searchInput && searchInput.value) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      } else {
        document.activeElement.blur();
      }
    }
  });
}

// Smooth tab card deletion animation
function deleteTabCard(card) {
  // Add deleting class for CSS animation
  card.classList.add('deleting');
  card.style.pointerEvents = 'none';
  
  // Get current height for collapse animation
  const height = card.offsetHeight;
  const gap = 8; // var(--space-sm)
  
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
    
    setTimeout(() => card.remove(), 280);
  }, 180);
}

// ============================================
// Initialization
// ============================================

function init() {
  const root = document.getElementById('root');
  root.innerHTML = renderDashboard();
  setupEventListeners();
  
  // Load saved tabs from storage if available
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ action: 'getSavedTabs' }, (response) => {
      if (response && response.tabs && response.tabs.length > 0) {
        // Merge with existing state
        const today = [];
        const older = [];
        const now = new Date();
        
        response.tabs.forEach(tab => {
          const savedDate = new Date(tab.savedAt);
          const isToday = savedDate.toDateString() === now.toDateString();
          
          const tabData = {
            id: tab.id,
            title: tab.title || 'Untitled',
            url: new URL(tab.url).hostname,
            time: isToday ? savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier',
            favicon: tab.favicon
          };
          
          if (isToday) {
            today.push(tabData);
          } else {
            older.push(tabData);
          }
        });
        
        if (today.length > 0 || older.length > 0) {
          state.inbox.today = today.length > 0 ? today : state.inbox.today;
          state.inbox.older = older.length > 0 ? older : state.inbox.older;
          
          // Re-render inbox section with fade
          const inboxSection = document.querySelector('.inbox-section');
          if (inboxSection) {
            inboxSection.style.opacity = '0';
            setTimeout(() => {
              inboxSection.outerHTML = renderInboxSection();
              const newInboxSection = document.querySelector('.inbox-section');
              newInboxSection.style.opacity = '0';
              newInboxSection.style.transition = 'opacity 300ms ease-out';
              requestAnimationFrame(() => {
                newInboxSection.style.opacity = '1';
              });
              setupEventListeners();
            }, 150);
          }
        }
      }
    });
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
