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
      <div className="min-h-screen bg-off-white dark:bg-gray-900 flex items-center justify-center">
        <Card className="text-center p-8 max-w-sm">
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 border-2 border-black dark:border-gray-600 rounded-xl flex items-center justify-center shadow-neobrutalist">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
              <path d="M12 2 L4 20 L12 16 L20 20 Z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold mb-2 dark:text-white">Smart Voyage Optimizer</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Loading maritime data...</p>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full border border-black dark:border-gray-600 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout
      sidebar={<RouteConfigPanel />}
      map={<MaritimeMap />}
      stats={<VoyageStatsCards />}
      connectionState={connectionState}
      onRetryConnection={handleRetry}
    />
  );
}
