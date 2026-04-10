import React from 'react';

const DashboardKPIs = ({ kpis, isLoading, onCardClick }) => {
  const kpiCards = [
    {
      id: 'activeFleet',
      label: 'Active Fleet',
      value: kpis?.activeFleet || 0,
      unit: 'vehicles',
      bgGradient: 'from-blue-50/90 to-indigo-100/90',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-900',
      icon: '🚚',
    },
    {
      id: 'maintenanceAlerts',
      label: 'Maintenance Alerts',
      value: kpis?.maintenanceAlerts || 0,
      unit: 'vehicles',
      bgGradient: 'from-rose-50/90 to-red-100/90',
      borderColor: 'border-rose-300',
      textColor: 'text-rose-900',
      icon: '⚠️',
    },
    {
      id: 'pendingCargo',
      label: 'Pending Cargo',
      value: kpis?.pendingCargo || 0,
      unit: 'deliveries',
      bgGradient: 'from-amber-50/90 to-orange-100/90',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-900',
      icon: '📦',
    },
  ];

  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <div
            key={card.id}
            className={`rounded-2xl border ${card.borderColor} bg-linear-to-br ${card.bgGradient} p-6 shadow-sm animate-pulse`}
          >
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {kpiCards.map((card) => (
        <div
          key={card.id}
          onClick={() => onCardClick && onCardClick(card.id)}
          className={`kpi-card border ${card.borderColor} bg-linear-to-br ${card.bgGradient} cursor-pointer p-6`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">{card.label}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.value.toLocaleString()}
                <span className="ml-1 text-sm font-semibold text-slate-500">{card.unit}</span>
              </p>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/75 p-3 text-2xl shadow-sm">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardKPIs;
