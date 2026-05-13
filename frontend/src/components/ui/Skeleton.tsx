interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-xl p-5 shadow-neobrutalist">
      <Skeleton className="h-3 w-16 mb-3" />
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function RoutePanelSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <div className="pt-2">
        <Skeleton className="h-5 w-32 mb-2" />
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <RoutePanelSkeleton />
    </div>
  );
}

export function MapLoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-[1000] flex items-center justify-center rounded-xl">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Loading map data...</p>
      </div>
    </div>
  );
}

export function BackendUnreachable({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="min-h-screen bg-off-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-xl p-8 shadow-neobrutalist max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-xl flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#ef4444">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold mb-2 dark:text-white">Backend Unreachable</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Unable to connect to the server. The backend may be starting up or experiencing issues.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white font-bold border-2 border-black dark:border-gray-600 rounded-xl shadow-neobrutalist active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 min-h-[44px]"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}
