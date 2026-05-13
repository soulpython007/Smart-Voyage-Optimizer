import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  decimals?: number;
  trend?: 'up' | 'down' | 'neutral';
  comparison?: string;
  index?: number;
}

export function StatCard({ label, value, unit, icon, color = 'blue', decimals = 1, trend, comparison, index = 0 }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500/30 bg-blue-900/10',
    green: 'border-green-500/30 bg-green-900/10',
    purple: 'border-purple-500/30 bg-purple-900/10',
    orange: 'border-orange-500/30 bg-orange-900/10',
  };

  const trendColors: Record<string, string> = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={`bg-gray-800/60 backdrop-blur-sm border ${colorMap[color]} rounded-xl p-4 shadow-lg`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-sm opacity-80">{icon}</span>}
      </div>
      <motion.div
        key={`${label}-${value}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xl font-extrabold text-white"
      >
        {value.toFixed(decimals)}
        <span className="text-xs font-bold text-gray-400 ml-1">{unit}</span>
      </motion.div>
      {comparison && trend && (
        <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${trendColors[trend]}`}>
          <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
          <span>{comparison}</span>
        </div>
      )}
    </motion.div>
  );
}
