import { type ChangeEvent } from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = '' }: SliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-[10px] font-bold text-gray-500 dark:text-blue-300/70 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-bold text-gray-700 dark:text-blue-300">
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="
            absolute inset-0 w-full h-full opacity-0 cursor-pointer
          "
        />
      </div>
    </div>
  );
}
