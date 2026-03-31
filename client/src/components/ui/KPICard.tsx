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
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-2">{label}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 font-medium ${trendColorMap[trend.direction]}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% vs last month
            </p>
          )}
        </div>
        {icon && (
          <div className={`${colorMap[color]} w-12 h-12 rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
        )}
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
        <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
          <span className="text-sm text-gray-600">{item.label}</span>
          <span className="text-sm font-semibold text-gray-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
};
