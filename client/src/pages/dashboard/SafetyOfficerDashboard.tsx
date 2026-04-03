import React, { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import dashboardBaseURL from '../../api/dashboardBaseURL';
import { PageContainer, PageHeader } from '../../components/ui';
import SafetyAlertBanner, { AlertItem } from '../../components/SafetyAlertBanner';
import { StatusPill } from '../../components/StatusPill';
import { AlertTriangle, Users, TrendingDown, FileCheck } from 'lucide-react';

interface SafetyKPI {
  expiredLicenses: number;
  lowSafetyScoreDrivers: number;
  recentAccidents: number;
  highRiskDrivers: number;
}

interface SafetyMetric {
  label: string;
  value: number;
  target: number;
  status: 'critical' | 'warning' | 'safe';
  icon: React.ReactNode;
}

/**
 * Safety Officer Dashboard - Production Grade
 * Displays critical safety metrics and compliance data
 */
export const SafetyOfficerDashboard = () => {
  const { notifyError } = useNotification();
  const [kpis, setKpis] = useState<SafetyKPI | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSafetyData = async () => {
      try {
        // Fetch safety-specific KPIs (backend route to be created)
        const response = await dashboardBaseURL.get('/safety-metrics');
        if (response.data?.success) {
          const data = response.data.data;
          setKpis(data);

          // Generate alerts based on data
          const generatedAlerts: AlertItem[] = [];

          if (data.expiredLicenses > 0) {
            generatedAlerts.push({
              id: 'expired-licenses',
              type: 'critical',
              title: 'Expired Licenses Detected',
              message: `${data.expiredLicenses} driver(s) have expired licenses and cannot be assigned to trips.`,
            });
          }

          if (data.lowSafetyScoreDrivers > 0) {
            generatedAlerts.push({
              id: 'low-safety-score',
              type: 'warning',
              title: 'Low Safety Scores',
              message: `${data.lowSafetyScoreDrivers} driver(s) have safety scores below 60. Consider additional training.`,
            });
          }

          if (data.recentAccidents > 0) {
            generatedAlerts.push({
              id: 'recent-accidents',
              type: 'critical',
              title: 'Recent Accidents',
              message: `${data.recentAccidents} accident(s) in the last 30 days. Review incident reports.`,
            });
          }

          if (data.highRiskDrivers > 0) {
            generatedAlerts.push({
              id: 'high-risk',
              type: 'warning',
              title: 'High-Risk Drivers',
              message: `${data.highRiskDrivers} driver(s) flagged as high-risk. Requires immediate attention.`,
            });
          }

          setAlerts(generatedAlerts);
        }
      } catch (error) {
        notifyError('Failed to fetch safety metrics');
        // Set mock data for demo
        setKpis({
          expiredLicenses: 2,
          lowSafetyScoreDrivers: 5,
          recentAccidents: 1,
          highRiskDrivers: 3,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafetyData();
  }, [notifyError]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading safety metrics...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const metrics: SafetyMetric[] = kpis
    ? [
        {
          label: 'Expired Licenses',
          value: kpis.expiredLicenses,
          target: 0,
          status: kpis.expiredLicenses > 0 ? 'critical' : 'safe',
          icon: <AlertTriangle className="h-6 w-6" />,
        },
        {
          label: 'Low Safety Score Drivers',
          value: kpis.lowSafetyScoreDrivers,
          target: 0,
          status: kpis.lowSafetyScoreDrivers > 2 ? 'warning' : 'safe',
          icon: <TrendingDown className="h-6 w-6" />,
        },
        {
          label: 'Recent Accidents (30 days)',
          value: kpis.recentAccidents,
          target: 0,
          status: kpis.recentAccidents > 0 ? 'critical' : 'safe',
          icon: <AlertTriangle className="h-6 w-6" />,
        },
        {
          label: 'High-Risk Drivers',
          value: kpis.highRiskDrivers,
          target: 0,
          status: kpis.highRiskDrivers > 2 ? 'warning' : 'safe',
          icon: <Users className="h-6 w-6" />,
        },
      ]
    : [];

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🛡️</span>
          <div>
            <PageHeader
              title="Safety Officer Dashboard"
              description="Monitor driver compliance, safety metrics, and compliance status"
            />
          </div>
        </div>

        {/* Safety Alerts */}
        <SafetyAlertBanner
          alerts={alerts}
          title="Safety Violations & Alerts"
          summary={{
            critical: alerts.filter((a) => a.type === 'critical').length,
            warning: alerts.filter((a) => a.type === 'warning').length,
          }}
        />

        {/* Safety KPI Cards */}
        <div>
          <h2 className="text-xl font-bold mb-4">Critical Safety Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border-2 transition-all ${
                  metric.status === 'critical'
                    ? 'bg-red-50 border-red-300'
                    : metric.status === 'warning'
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'bg-green-50 border-green-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      metric.status === 'critical'
                        ? 'bg-red-100 text-red-600'
                        : metric.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {metric.icon}
                  </div>
                  <StatusPill status={metric.status}>
                    {metric.value}/{metric.target}
                  </StatusPill>
                </div>
                <h3 className="font-semibold text-gray-900">{metric.label}</h3>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    metric.status === 'critical'
                      ? 'text-red-700'
                      : metric.status === 'warning'
                        ? 'text-yellow-700'
                        : 'text-green-700'
                  }`}
                >
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-white border border-blue-300 rounded-lg hover:shadow-md transition-shadow text-left">
              <p className="font-semibold text-gray-900">👥 View Driver Profiles</p>
              <p className="text-sm text-gray-600 mt-1">Check safety scores and license status</p>
            </button>
            <button className="p-4 bg-white border border-blue-300 rounded-lg hover:shadow-md transition-shadow text-left">
              <p className="font-semibold text-gray-900">📊 Safety Analytics</p>
              <p className="text-sm text-gray-600 mt-1">Detailed trends and compliance rates</p>
            </button>
            <button className="p-4 bg-white border border-blue-300 rounded-lg hover:shadow-md transition-shadow text-left">
              <p className="font-semibold text-gray-900">📋 Compliance Reports</p>
              <p className="text-sm text-gray-600 mt-1">Export safety and compliance data</p>
            </button>
          </div>
        </div>

        {/* Safety Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Safety Information</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Critical Issues:</strong> Expired licenses and recent accidents require immediate action</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span><strong>Warnings:</strong> Low safety scores and high-risk drivers need monitoring</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span><strong>Safe:</strong> All drivers are compliant and within safe parameters</span>
            </li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
};

export default SafetyOfficerDashboard;
