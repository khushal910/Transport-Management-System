import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
