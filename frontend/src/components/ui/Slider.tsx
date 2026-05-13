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

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="
          w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer
          accent-blue-600
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:bg-blue-600
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-black
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer
          min-h-[44px]
        "
      />
    </div>
  );
}
