import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

const variants = {
  info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-500',
  success: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-500',
  warning: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-500',
  error: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-500',
};

export function Badge({ variant = 'info', children }: BadgeProps) {
  return (
    <span
      className={`
        text-[10px] font-extrabold px-2 py-0.5 rounded-lg
        border tracking-wider uppercase whitespace-nowrap
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
}
