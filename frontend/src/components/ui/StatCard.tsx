interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  decimals?: number;
  trend?: 'up' | 'down' | 'neutral';
  comparison?: string;
}

const colorMap = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-500',
  green: 'bg-green-100 dark:bg-green-900/30 border-green-500',
  purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-500',
  orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-500',
};

const trendIcons = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

const trendColors = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-500 dark:text-gray-400',
};

export function StatCard({ label, value, unit, icon, color = 'blue', decimals = 1, trend, comparison }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-xl p-5 shadow-neobrutalist">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
        {value.toFixed(decimals)}
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">{unit}</span>
      </div>
      {comparison && trend && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${trendColors[trend]}`}>
          <span>{trendIcons[trend]}</span>
          <span>{comparison}</span>
        </div>
      )}
    </div>
  );
}
