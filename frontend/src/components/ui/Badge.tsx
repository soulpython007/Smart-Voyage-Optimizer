import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

const variants = {
  info: 'bg-blue-900/30 text-blue-300 border-blue-500/40',
  success: 'bg-green-900/30 text-green-300 border-green-500/40',
  warning: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/40',
  error: 'bg-red-900/30 text-red-300 border-red-500/40',
};

export function Badge({ variant = 'info', children }: BadgeProps) {
  return (
    <span
      className={`
        text-[10px] font-extrabold px-2 py-0.5 rounded-lg
        border tracking-wider uppercase whitespace-nowrap
        backdrop-blur-sm
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
}
