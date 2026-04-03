import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  icon?: React.ReactNode;
}

interface SafetyAlertBannerProps {
  alerts: AlertItem[];
  title?: string;
  summary?: {
    critical: number;
    warning: number;
  };
}

/**
 * Production-grade alert banner for safety-critical information
 * Displays multiple alerts with color-coding and priorities
 */
export const SafetyAlertBanner: React.FC<SafetyAlertBannerProps> = ({
  alerts,
  title = 'Safety Alerts',
  summary,
}) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <div>
            <h3 className="font-semibold text-green-800">All Systems Normal</h3>
            <p className="text-sm text-green-700">No safety violations detected</p>
          </div>
        </div>
      </div>
    );
  }

  const criticalAlerts = alerts.filter((a) => a.type === 'critical');
  const warningAlerts = alerts.filter((a) => a.type === 'warning');

  return (
    <div className="mb-6 space-y-3">
      {/* Summary Section */}
      {summary && (summary.critical > 0 || summary.warning > 0) && (
        <div
          className={`p-4 rounded-lg border-2 ${
            summary.critical > 0
              ? 'bg-red-50 border-red-300'
              : 'bg-yellow-50 border-yellow-300'
          }`}
        >
          <h2 className={`font-bold text-lg ${summary.critical > 0 ? 'text-red-800' : 'text-yellow-800'}`}>
            ⚠️ {title}
          </h2>
          <p
            className={`text-sm mt-1 ${summary.critical > 0 ? 'text-red-700' : 'text-yellow-700'}`}
          >
            {summary.critical} Critical • {summary.warning} Warnings
          </p>
        </div>
      )}

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2">
          {criticalAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">{alert.title}</h3>
                <p className="text-sm text-red-700 mt-1">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="space-y-2">
          {warningAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">{alert.title}</h3>
                <p className="text-sm text-yellow-700 mt-1">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SafetyAlertBanner;
