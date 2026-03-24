import React from 'react';

const DashboardKPIs = ({ kpis, isLoading, onCardClick }) => {
  const kpiCards = [
    {
      id: 'activeFleet',
      label: 'Active Fleet',
      value: kpis?.activeFleet || 0,
      unit: 'vehicles',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-800',
      icon: '🚚',
    },
    {
      id: 'maintenanceAlerts',
      label: 'Maintenance Alerts',
      value: kpis?.maintenanceAlerts || 0,
      unit: 'vehicles',
      bgGradient: 'from-red-50 to-red-100',
      borderColor: 'border-red-400',
      textColor: 'text-red-800',
      icon: '⚠️',
    },
    {
      id: 'utilizationRate',
      label: 'Utilization Rate',
      value: kpis?.utilizationRate || 0,
      unit: '%',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-400',
      textColor: 'text-green-800',
      icon: '📊',
    },
    {
      id: 'pendingCargo',
      label: 'Pending Cargo',
      value: kpis?.pendingCargo || 0,
      unit: 'deliveries',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-400',
      textColor: 'text-orange-800',
      icon: '📦',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card) => (
          <div
            key={card.id}
            className={`bg-gradient-to-br ${card.bgGradient} border-2 ${card.borderColor} rounded-lg p-6 animate-pulse`}
          >
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpiCards.map((card) => (
        <div
          key={card.id}
          onClick={() => onCardClick && onCardClick(card.id)}
          className={`bg-gradient-to-br ${card.bgGradient} border-2 ${card.borderColor} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform transition-transform`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-700 font-semibold text-sm mb-2">{card.label}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.value.toLocaleString()}
                <span className="text-lg ml-1">{card.unit}</span>
              </p>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardKPIs;
