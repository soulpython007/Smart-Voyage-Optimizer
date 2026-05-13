import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useDemoMode } from '../hooks/useDemoMode';
import { usePorts } from '../hooks/usePorts';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { MaritimeMap } from '../components/map/MaritimeMap';
import { RouteConfigPanel } from '../components/dashboard/RouteConfigPanel';
import { VoyageStatsCards } from '../components/dashboard/VoyageStatsCards';
import { Card } from '../components/ui';
import { BackendUnreachable, MapLoadingOverlay } from '../components/ui/Skeleton';
import { NotificationSystem } from '../components/ui/NotificationSystem';

export function Dashboard() {
  const loading = useStore((s) => s.loading);
  const ports = useStore((s) => s.ports);
  const settings = useStore((s) => s.settings);
  const fetchInitialData = useStore((s) => s.fetchInitialData);
  const optimize = useStore((s) => s.optimize);
  const [initialized, setInitialized] = useState(false);
  const [autoOptimized, setAutoOptimized] = useState(false);
  const [backendError, setBackendError] = useState(false);

  const { data: portsData, isError: portsError, refetch: retryPorts } = usePorts();

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchInitialData().catch(() => setBackendError(true));
    }
  }, [initialized, fetchInitialData]);

  useEffect(() => {
    if (portsData && portsData.features?.length > 0) {
      setBackendError(false);
    }
  }, [portsData]);

  useEffect(() => {
    if (!autoOptimized && !loading && ports.features.length > 0 && settings.departure && settings.destination) {
      setAutoOptimized(true);
      const timer = setTimeout(() => optimize(), 400);
      return () => clearTimeout(timer);
    }
  }, [loading, ports, settings.departure, settings.destination, autoOptimized, optimize]);

  const { connectionState, handleRetry } = useWebSocket();
  useDemoMode();

  if (backendError && portsError) {
    return (
      <BackendUnreachable
        onRetry={() => {
          setBackendError(false);
          retryPorts();
          fetchInitialData().catch(() => setBackendError(true));
        }}
      />
    );
  }

  if (loading && !initialized) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-gray-950 flex items-center justify-center">
        <Card className="text-center p-8 max-w-sm bg-gray-900/80 backdrop-blur-xl border-blue-900/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400/30 rounded-xl flex items-center justify-center shadow-[0_4px_0_0_rgba(30,58,95,0.5)]">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
              <path d="M12 2 L4 20 L12 16 L20 20 Z" />
            </svg>
          </div>
          <h2 className="text-lg font-extrabold mb-2 text-white">Smart Voyage Optimizer</h2>
          <p className="text-xs text-blue-300/60 mb-4">Loading maritime intelligence data...</p>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <NotificationSystem />
      <DashboardLayout
        sidebar={<RouteConfigPanel />}
        map={<MaritimeMap />}
        stats={<VoyageStatsCards />}
        connectionState={connectionState}
        onRetryConnection={handleRetry}
      />
    </>
  );
}
