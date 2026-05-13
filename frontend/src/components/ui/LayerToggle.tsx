import { Toggle } from './Toggle';

interface LayerToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  color: string;
}

export function LayerToggle({ label, enabled, onChange, color }: LayerToggleProps) {
  return (
    <div className="flex items-center justify-between min-h-[44px]">
      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full border border-black"
          style={{ backgroundColor: color }}
        />
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {label}
        </label>
      </div>
      <Toggle enabled={enabled} onChange={onChange} label={label} />
    </div>
  );
}
