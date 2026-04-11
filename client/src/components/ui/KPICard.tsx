import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const colorMap = {
  blue: 'bg-sky-100 text-sky-700',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-rose-100 text-rose-700',
  yellow: 'bg-amber-100 text-amber-700',
  purple: 'bg-violet-100 text-violet-700',
};

const trendColorMap = {
  up: 'text-green-600',
  down: 'text-red-600',
};

/**
 * KPI Card for dashboard metrics
 */
export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'blue',
}) => {
  return (
    <div className="kpi-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-2 text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-semibold text-slate-900">{value}</p>
          {trend ? (
            <p className={`mt-2 text-sm font-medium ${trendColorMap[trend.direction]}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% vs last month
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className={`${colorMap[color]} flex h-12 w-12 items-center justify-center rounded-lg`}>
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
};

interface StatListProps {
  items: {
    label: string;
    value: string | number;
  }[];
}

/**
 * Simple stat list
 */
export const StatList: React.FC<StatListProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
          <span className="text-sm text-slate-600">{item.label}</span>
          <span className="text-sm font-semibold text-slate-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
};
