import { useState, type ReactNode } from 'react';
import { Navbar } from './Navbar';
import type { ConnectionState } from '../ui/ConnectionStatus';

interface DashboardLayoutProps {
  sidebar: ReactNode;
  map: ReactNode;
  stats: ReactNode;
  connectionState?: ConnectionState;
  onRetryConnection?: () => void;
}

export function DashboardLayout({ sidebar, map, stats, connectionState, onRetryConnection }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-off-white dark:bg-gray-900 flex flex-col">
      <Navbar connectionState={connectionState} onRetryConnection={onRetryConnection} />

      <div className="flex flex-1 overflow-hidden relative">

        {/* Desktop sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="
            absolute left-2 top-2 z-30
            lg:hidden w-10 h-10 flex items-center justify-center
            bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-xl shadow-neobrutalist
            text-lg font-bold min-h-[44px] min-w-[44px]
          "
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>

        {/* Desktop sidebar */}
        <aside
          className={`
            w-full sm:w-80 lg:w-96 flex-shrink-0
            bg-white dark:bg-gray-800 border-r-2 border-black dark:border-gray-600
            overflow-y-auto
            transition-all duration-300 z-20
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:relative absolute
            h-full
            hidden lg:block
          `}
        >
          <div className="p-4 pt-14 lg:pt-4">
            {sidebar}
          </div>
        </aside>

        {/* Mobile bottom drawer trigger */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-blue-600 border-2 border-black dark:border-gray-600 rounded-xl shadow-neobrutalist flex items-center justify-center min-h-[44px] min-w-[44px]"
          aria-label={drawerOpen ? 'Close controls' : 'Open controls'}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            {drawerOpen ? (
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            ) : (
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            )}
          </svg>
        </button>

        {/* Mobile bottom drawer */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-40" onClick={() => setDrawerOpen(false)}>
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        <div
          className={`
            lg:hidden fixed bottom-0 left-0 right-0 z-50
            bg-white dark:bg-gray-800 border-t-2 border-black dark:border-gray-600
            rounded-t-2xl shadow-neobrutalist-lg
            transition-transform duration-300
            ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}
            max-h-[70vh] overflow-y-auto
          `}
        >
          <div className="p-4 pt-2">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
            {sidebar}
          </div>
        </div>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative p-3">
            <div className="absolute inset-3">
              {map}
            </div>
          </div>

          <div className="px-3 pb-3">
            {stats}
          </div>
        </main>
      </div>
    </div>
  );
}
