import React from 'react';

export type StatusType = 'critical' | 'warning' | 'safe' | 'normal';

interface StatusPillProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
  tooltip?: string;
}

const statusConfig: Record<StatusType, { bg: string; text: string; icon: string }> = {
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: '🔴',
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: '🟡',
  },
  safe: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: '🟢',
  },
  normal: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: '⚪',
  },
};

/**
 * Professional status pill component for safety metrics
 */
export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  children,
  className = '',
  tooltip,
}) => {
  const config = statusConfig[status];
  const title = tooltip ? `title="${tooltip}"` : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${className}`}
      {...(tooltip && { title })}
    >
      <span className="text-xs">{config.icon}</span>
      {children}
    </span>
  );
};

export default StatusPill;
