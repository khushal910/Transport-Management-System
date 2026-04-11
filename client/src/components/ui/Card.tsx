import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'muted' | 'elevated';
  onClick?: () => void;
}

const paddingMap = {
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

const variantMap = {
  default: 'border border-slate-200 bg-white shadow-sm',
  muted: 'border border-slate-200 bg-slate-50',
  elevated: 'border border-slate-200 bg-white shadow-md shadow-slate-900/10',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'lg',
  variant = 'default',
  onClick,
}) => {
  return (
    <div
      className={`${variantMap[variant]} rounded-2xl ${paddingMap[padding]} ${
        onClick ? 'card-hover cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
