import React, { useEffect, useState } from 'react';
import useStore from './store/useStore';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import OpenTabs from './components/OpenTabs';
import SessionsGrid from './components/SessionsGrid';

export default function App() {
  const hydrate = useStore((s) => s.hydrate);
  const loadOpenTabs = useStore((s) => s.loadOpenTabs);
  const hydrated = useStore((s) => s.hydrated);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    hydrate();
    loadOpenTabs();
    const interval = setInterval(loadOpenTabs, 4000);
    return () => clearInterval(interval);
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
        <Topbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-8">
          <OpenTabs searchQuery={searchQuery} />
          <SessionsGrid searchQuery={searchQuery} />
        </main>
      </div>
    </div>
  );
}
