import React, { useEffect, useState, useCallback } from 'react';
import useStore from './store/useStore';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import OpenTabs from './components/OpenTabs';
import SessionsGrid from './components/SessionsGrid';

function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] px-4 py-2.5 rounded-xl bg-canvas-elevated border border-white/[0.08] shadow-xl text-sm text-txt-primary animate-fade-in max-w-xs">
      {toast.message}
    </div>
  );
}

export default function App() {
  const hydrate = useStore((s) => s.hydrate);
  const loadOpenTabs = useStore((s) => s.loadOpenTabs);
  const hydrated = useStore((s) => s.hydrated);
  const setActiveSpace = useStore((s) => s.setActiveSpace);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandSessionId, setExpandSessionId] = useState(null);

  useEffect(() => {
    hydrate();
    loadOpenTabs();
    const interval = setInterval(loadOpenTabs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateSession = useCallback((spaceId, sessionId) => {
    setActiveSpace(spaceId);
    setExpandSessionId(sessionId);
    setSearchQuery('');
  }, []);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-txt-tertiary text-sm">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas-deep">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNavigateSession={handleNavigateSession}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-8">
          <OpenTabs searchQuery={searchQuery} />
          <SessionsGrid
            searchQuery={searchQuery}
            expandSessionId={expandSessionId}
            onExpandHandled={() => setExpandSessionId(null)}
          />
        </main>
      </div>
      <Toast />
    </div>
  );
}
