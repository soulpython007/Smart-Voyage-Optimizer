import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { StatCard } from '../ui';

export function VoyageStatsCards() {
  const routes = useStore((s) => s.routes);
  const selectedIndex = useStore((s) => s.selectedRouteIndex);
  const selectedRoute = selectedIndex !== null ? routes[selectedIndex] : null;

  const comparisons = useMemo(() => {
    if (!selectedRoute || routes.length < 2) return undefined;

    const otherRoutes = routes.filter((_, i) => i !== selectedIndex);
    const avgFuel = otherRoutes.reduce((s, r) => s + r.fuelEstimateTonnes, 0) / otherRoutes.length;
    const avgTime = otherRoutes.reduce((s, r) => s + r.etaHours, 0) / otherRoutes.length;
    const avgRisk = otherRoutes.reduce((s, r) => s + r.riskScore, 0) / otherRoutes.length;

    return {
      fuelSaved: avgFuel > 0 ? ((avgFuel - selectedRoute.fuelEstimateTonnes) / avgFuel) * 100 : 0,
      timeDiff: avgTime > 0 ? ((avgTime - selectedRoute.etaHours) / avgTime) * 100 : 0,
      safetyImprovement: avgRisk > 0 ? ((avgRisk - selectedRoute.riskScore) / avgRisk) * 100 : 0,
    };
  }, [selectedRoute, routes, selectedIndex]);

  if (!selectedRoute) {
    return (
      <div className="flex items-center justify-center h-16 text-sm text-gray-400 dark:text-gray-500 font-bold">
        No route selected — run an optimization
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      <div className="min-w-[140px] flex-1">
        <StatCard
          label="Distance"
          value={selectedRoute.distanceNm}
          unit="nm"
          icon="📍"
          color="blue"
          decimals={0}
        />
      </div>
      <div className="min-w-[140px] flex-1">
        <StatCard
          label="Estimated Arrival"
          value={selectedRoute.etaHours}
          unit="hours"
          icon="⏱️"
          color="purple"
          decimals={1}
          trend={comparisons && comparisons.timeDiff > 0 ? 'up' : comparisons && comparisons.timeDiff < 0 ? 'down' : 'neutral'}
          comparison={comparisons ? `${Math.abs(comparisons.timeDiff).toFixed(0)}% vs avg` : undefined}
        />
      </div>
      <div className="min-w-[140px] flex-1">
        <StatCard
          label="Fuel Estimate"
          value={selectedRoute.fuelEstimateTonnes}
          unit="tonnes"
          icon="⛽"
          color="green"
          decimals={0}
          trend={comparisons && comparisons.fuelSaved > 0 ? 'down' : comparisons && comparisons.fuelSaved < 0 ? 'up' : 'neutral'}
          comparison={comparisons ? `${Math.abs(comparisons.fuelSaved).toFixed(0)}% vs avg` : undefined}
        />
      </div>
      <div className="min-w-[140px] flex-1">
        <StatCard
          label="Safety Score"
          value={100 - selectedRoute.riskScore}
          unit="%"
          icon="🛡️"
          color="orange"
          decimals={0}
          trend={comparisons && comparisons.safetyImprovement > 0 ? 'up' : comparisons && comparisons.safetyImprovement < 0 ? 'down' : 'neutral'}
          comparison={comparisons ? `${Math.abs(comparisons.safetyImprovement).toFixed(0)}% vs avg` : undefined}
        />
      </div>
    </div>
  );
}
