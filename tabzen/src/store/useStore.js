import { create } from 'zustand';
import { spaceId, sessId, groupId, tabId } from '../utils/ids';
import { loadState, saveState, getOpenTabs } from '../utils/chrome';

const SPACE_COLORS = ['media', 'projects', 'crypto', 'learning', 'personal', 'amber', 'orange', 'coral', 'rose', 'violet', 'indigo', 'teal', 'emerald', 'lime', 'slate'];

const defaultSpaces = [
  { id: 'space_default_1', name: 'MEDIA Tiger', color: 'media', sessions: [] },
  { id: 'space_default_2', name: 'Projects', color: 'projects', sessions: [] },
  { id: 'space_default_3', name: 'Web3 / Crypto', color: 'crypto', sessions: [] },
  { id: 'space_default_4', name: 'Learning', color: 'learning', sessions: [] },
  { id: 'space_default_5', name: 'Personal', color: 'personal', sessions: [] },
];

function persist(state) {
  saveState({ spaces: state.spaces });
}

const useStore = create((set, get) => ({
  // --- State ---
  spaces: defaultSpaces,
  activeSpaceId: null, // null = show all
  openTabs: [],
  openTabsLoading: true,
  hydrated: false,

  // --- Hydrate from chrome.storage ---
  hydrate: async () => {
    const data = await loadState();
    if (data?.spaces?.length) {
      set({ spaces: data.spaces, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },

  // --- Open tabs ---
  loadOpenTabs: async () => {
    // Only show loading spinner on initial fetch (when openTabs is empty)
    const isInitial = get().openTabs.length === 0 && get().openTabsLoading;
    if (isInitial) set({ openTabsLoading: true });
    const tabs = await getOpenTabs();
    set({ openTabs: tabs, openTabsLoading: false });
  },

  // ============================================
  // SPACE CRUD
  // ============================================
  addSpace: () => {
    const id = spaceId();
    const color = SPACE_COLORS[get().spaces.length % SPACE_COLORS.length];
    set((s) => {
      const spaces = [...s.spaces, { id, name: 'Новое пространство', color, sessions: [] }];
      persist({ spaces });
      return { spaces, activeSpaceId: id };
    });
    return id;
  },

  renameSpace: (id, name) => {
    set((s) => {
      const spaces = s.spaces.map((sp) => (sp.id === id ? { ...sp, name } : sp));
      persist({ spaces });
      return { spaces };
    });
  },

  updateSpaceColor: (id, color) => {
    set((s) => {
      const spaces = s.spaces.map((sp) => (sp.id === id ? { ...sp, color } : sp));
      persist({ spaces });
      return { spaces };
    });
  },

  deleteSpace: (id) => {
    set((s) => {
      const spaces = s.spaces.filter((sp) => sp.id !== id);
      persist({ spaces });
      return { spaces, activeSpaceId: s.activeSpaceId === id ? null : s.activeSpaceId };
    });
  },

  setActiveSpace: (id) => set({ activeSpaceId: id }),

  // ============================================
  // SESSION CRUD
  // ============================================
  addSession: (spaceIdTarget, title = 'Новая сессия') => {
    const id = sessId();
    set((s) => {
      const spaces = s.spaces.map((sp) => {
        if (sp.id !== spaceIdTarget) return sp;
        return {
          ...sp,
          sessions: [
            ...sp.sessions,
            {
              id,
              title,
              createdAt: new Date().toISOString(),
              groups: [{ id: groupId(), name: 'Вкладки', tabs: [] }],
            },
          ],
        };
      });
      persist({ spaces });
      return { spaces };
    });
    return id;
  },

  renameSession: (spaceIdTarget, sessionId, title) => {
    set((s) => {
      const spaces = s.spaces.map((sp) => {
        if (sp.id !== spaceIdTarget) return sp;
        return {
          ...sp,
          sessions: sp.sessions.map((sess) =>
            sess.id === sessionId ? { ...sess, title } : sess
          ),
        };
      });
      persist({ spaces });
      return { spaces };
    });
  },

  deleteSession: (spaceIdTarget, sessionId) => {
    set((s) => {
      const spaces = s.spaces.map((sp) => {
        if (sp.id !== spaceIdTarget) return sp;
        return { ...sp, sessions: sp.sessions.filter((sess) => sess.id !== sessionId) };
      });
      persist({ spaces });
      return { spaces };
    });
  },

  saveCurrentTabs: async (spaceIdTarget, title) => {
    const tabs = await getOpenTabs();
    if (!tabs.length) return null;

    const id = sessId();
    const sessionTabs = tabs.map((t) => ({
      id: tabId(),
      title: t.title || 'Untitled',
      url: t.url,
      favicon: t.favIconUrl || '',
    }));

    set((s) => {
      const spaces = s.spaces.map((sp) => {
        if (sp.id !== spaceIdTarget) return sp;
        return {
          ...sp,
          sessions: [
            {
              id,
              title: title || `Сессия ${new Date().toLocaleString('ru-RU')}`,
              createdAt: new Date().toISOString(),
              groups: [{ id: groupId(), name: 'Вкладки', tabs: sessionTabs }],
            },
            ...sp.sessions,
          ],
        };
      });
      persist({ spaces });
      return { spaces };
    });
    return id;
  },

  // ============================================
  // GROUP CRUD
  // ============================================
  addGroup: (spaceIdTarget, sessionId, name = 'Новая группа') => {
    const id = groupId();
    set((s) => {
      const spaces = s.spaces.map((sp) => {
        if (sp.id !== spaceIdTarget) return sp;
        return {
          ...sp,
          sessions: sp.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return { ...sess, groups: [...sess.groups, { id, name, tabs: [] }] };
          }),
        };
      });
      persist({ spaces });
      return { spaces };
    });
    return id;
  },

  renameGroup: (spaceIdTarget, sessionId, gId, name) => {
    set((s) => {
      const spaces = s.spaces.map((sp) => {
        if (sp.id !== spaceIdTarget) return sp;
        return {
          ...sp,
          sessions: sp.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return {
              ...sess,
              groups: sess.groups.map((g) => (g.id === gId ? { ...g, name } : g)),
            };
          }),
        };
      });
      persist({ spaces });
      return { spaces };
    });
  },

  deleteGroup: (spaceIdTarget, sessionId, gId) => {
    set((s) => {
      const spaces = s.spaces.map((sp) => {
        if (sp.id !== spaceIdTarget) return sp;
        return {
          ...sp,
          sessions: sp.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return { ...sess, groups: sess.groups.filter((g) => g.id !== gId) };
          }),
        };
      });
      persist({ spaces });
      return { spaces };
    });
  },

  // ============================================
  // TAB CRUD
  // ============================================
  addTab: (spaceIdTarget, sessionId, gId, tab) => {
    const id = tabId();
    set((s) => {
      const spaces = s.spaces.map((sp) => {
        if (sp.id !== spaceIdTarget) return sp;
        return {
          ...sp,
          sessions: sp.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return {
              ...sess,
              groups: sess.groups.map((g) => {
                if (g.id !== gId) return g;
                return { ...g, tabs: [...g.tabs, { id, ...tab }] };
              }),
            };
          }),
        };
      });
      persist({ spaces });
      return { spaces };
    });
    return id;
  },

  removeTab: (spaceIdTarget, sessionId, gId, tId) => {
    set((s) => {
      const spaces = s.spaces.map((sp) => {
        if (sp.id !== spaceIdTarget) return sp;
        return {
          ...sp,
          sessions: sp.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return {
              ...sess,
              groups: sess.groups.map((g) => {
                if (g.id !== gId) return g;
                return { ...g, tabs: g.tabs.filter((t) => t.id !== tId) };
              }),
            };
          }),
        };
      });
      persist({ spaces });
      return { spaces };
    });
  },

  moveTab: (fromSpaceId, fromSessionId, fromGroupId, toSpaceId, toSessionId, toGroupId, tId, toIndex) => {
    set((s) => {
      let movedTab = null;
      // Remove from source
      let spaces = s.spaces.map((sp) => {
        if (sp.id !== fromSpaceId) return sp;
        return {
          ...sp,
          sessions: sp.sessions.map((sess) => {
            if (sess.id !== fromSessionId) return sess;
            return {
              ...sess,
              groups: sess.groups.map((g) => {
                if (g.id !== fromGroupId) return g;
                movedTab = g.tabs.find((t) => t.id === tId);
                return { ...g, tabs: g.tabs.filter((t) => t.id !== tId) };
              }),
            };
          }),
        };
      });

      if (!movedTab) return {};

      // Insert into target
      spaces = spaces.map((sp) => {
        if (sp.id !== toSpaceId) return sp;
        return {
          ...sp,
          sessions: sp.sessions.map((sess) => {
            if (sess.id !== toSessionId) return sess;
            return {
              ...sess,
              groups: sess.groups.map((g) => {
                if (g.id !== toGroupId) return g;
                const tabs = [...g.tabs];
                const idx = toIndex != null ? toIndex : tabs.length;
                tabs.splice(idx, 0, movedTab);
                return { ...g, tabs };
              }),
            };
          }),
        };
      });

      persist({ spaces });
      return { spaces };
    });
  },
}));

export default useStore;
