import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stats';
  noShadow?: boolean;
}

export function Card({ variant = 'default', noShadow = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white/90 dark:bg-gray-900/80 backdrop-blur-md
        border-2 border-black/10 dark:border-blue-900/30 rounded-xl p-4
        ${noShadow ? '' : 'shadow-neobrutalist dark:shadow-[0_4px_0_0_rgba(30,58,95,0.5)]'}
        ${variant === 'stats' ? 'p-5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
