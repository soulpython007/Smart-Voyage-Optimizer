import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import { MapControls } from '../ui/MapControls';
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
    <div className="min-h-screen bg-off-white dark:bg-gray-950 flex flex-col">
      <Navbar connectionState={connectionState} onRetryConnection={onRetryConnection} />

      <div className="flex flex-1 overflow-hidden relative">

        {/* Sidebar toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="
            absolute left-2 top-2 z-30
            lg:hidden w-10 h-10 flex items-center justify-center
            bg-gray-900/70 border-2 border-gray-600/50 rounded-xl backdrop-blur-md
            text-white text-lg font-bold min-h-[44px] min-w-[44px]
          "
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>

        {/* Desktop sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`
                w-80 lg:w-80 flex-shrink-0
                border-r-2 border-black/10 dark:border-blue-900/30
                overflow-y-auto overflow-x-hidden z-20
                bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl
                ${sidebarOpen ? '' : 'hidden'}
                hidden lg:block
                h-full
              `}
            >
              <div className="p-3 pt-4">
                {sidebar}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-40 w-80
                bg-gray-900/90 backdrop-blur-xl border-r-2 border-blue-900/30
                overflow-y-auto"
            >
              <div className="p-3 pt-16">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center
                    bg-gray-800/80 border border-gray-600/50 rounded-xl text-white min-h-[44px] min-w-[44px]"
                >
                  ✕
                </button>
                {sidebar}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile bottom drawer trigger */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400/30 rounded-xl shadow-[0_4px_0_0_rgba(30,58,95,0.5)] flex items-center justify-center min-h-[44px] min-w-[44px]"
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
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40"
                onClick={() => setDrawerOpen(false)}
              >
                <div className="absolute inset-0 bg-black/40" />
              </motion.div>

              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                  bg-gray-900/90 backdrop-blur-xl border-t-2 border-blue-900/30
                  rounded-t-2xl shadow-lg
                  max-h-[70vh] overflow-y-auto"
              >
                <div className="p-4 pt-2">
                  <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
                  {sidebar}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 relative p-2">
            <div className="absolute inset-2">
              {map}
            </div>
            <MapControls />
          </div>

          <div className="px-2 pb-2">
            {stats}
          </div>
        </main>
      </div>
    </div>
  );
}
