import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  error: 'bg-rose-100 text-rose-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-sky-100 text-sky-700',
};

const dotStyles = {
  default: 'bg-slate-500',
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  showDot = false,
}) => {
  return (
    <span
      className={`status-badge ${variantStyles[variant]} ${className}`}
    >
      {showDot ? <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} /> : null}
      {children}
    </span>
  );
};
