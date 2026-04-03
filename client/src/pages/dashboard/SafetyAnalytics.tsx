import React, { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import dashboardBaseURL from '../../api/dashboardBaseURL';
import { PageContainer, PageHeader, Grid } from '../../components/ui';
import { StatusPill } from '../../components/StatusPill';
import { TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface SafetyTrend {
  date: string;
  averageScore: number;
  incidents: number;
}

interface ComplianceMetrics {
  validLicenses: number;
  expiredLicenses: number;
  complianceRate: number;
}

/**
 * Safety Analytics Page - Production Grade
 * Safety trends, compliance rates, and detailed metrics
 */
export const SafetyAnalytics = () => {
  const { notifyError } = useNotification();
  const [trends, setTrends] = useState<SafetyTrend[]>([]);
  const [compliance, setCompliance] = useState<ComplianceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // In production, this would fetch from API
        // const response = await dashboardBaseURL.get('/analytics/safety');

        // Mock data
        setTrends([
          { date: 'Jan 1', averageScore: 65, incidents: 3 },
          { date: 'Jan 8', averageScore: 68, incidents: 2 },
          { date: 'Jan 15', averageScore: 72, incidents: 1 },
          { date: 'Jan 22', averageScore: 75, incidents: 1 },
          { date: 'Jan 29', averageScore: 78, incidents: 0 },
        ]);

        setCompliance({
          validLicenses: 48,
          expiredLicenses: 2,
          complianceRate: 96,
        });
      } catch (error) {
        notifyError('Failed to fetch safety analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [notifyError]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading safety analytics...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">📈</span>
          <div>
            <PageHeader
              title="Safety Analytics"
              description="Detailed safety trends, compliance metrics, and risk analysis"
            />
          </div>
        </div>

        {/* Compliance Section */}
        {compliance && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                License Compliance Rate
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Valid Licenses</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{compliance.validLicenses}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Expired Licenses</p>
                  <p className="text-4xl font-bold text-red-600 mt-2">{compliance.expiredLicenses}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 font-semibold">Compliance Rate</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{compliance.complianceRate}%</p>
                  <div className="mt-3 w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${compliance.complianceRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Safety Score Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Average Safety Score Trend
          </h2>
          <div className="space-y-4">
            {trends.map((trend, idx) => {
              const maxScore = 100;
              const widthPercent = (trend.averageScore / maxScore) * 100;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">{trend.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">{trend.averageScore}</span>
                      <span className="text-xs text-gray-500">({trend.incidents} incidents)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        trend.averageScore >= 70
                          ? 'bg-green-500'
                          : trend.averageScore >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            📊 <strong>Observation:</strong> Safety scores are trending upward. Implement continued monitoring.
          </p>
        </div>

        {/* Risk Levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertTriangle className="h-6 w-6 text-red-600 mb-2" />
            <p className="font-semibold text-gray-900">High Risk Drivers</p>
            <p className="text-3xl font-bold text-red-600 mt-2">3</p>
            <p className="text-xs text-red-700 mt-2">Requires immediate attention</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mb-2" />
            <p className="font-semibold text-gray-900">Medium Risk Drivers</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">5</p>
            <p className="text-xs text-yellow-700 mt-2">Monitor closely</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
            <p className="font-semibold text-gray-900">Low Risk Drivers</p>
            <p className="text-3xl font-bold text-green-600 mt-2">42</p>
            <p className="text-xs text-green-700 mt-2">Compliant and safe</p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">📊 Key Insights</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2 text-gray-700">
              <span className="text-green-600 font-bold">✓</span>
              <span>Overall compliance rate is at 96%, exceeding industry standards</span>
            </li>
            <li className="flex items-start gap-2 text-gray-700">
              <span className="text-yellow-600 font-bold">⚠</span>
              <span>Safety score trend shows positive improvement over the past month</span>
            </li>
            <li className="flex items-start gap-2 text-gray-700">
              <span className="text-red-600 font-bold">!</span>
              <span>2 drivers have expired licenses - recommend license renewal notices</span>
            </li>
            <li className="flex items-start gap-2 text-gray-700">
              <span className="text-blue-600 font-bold">→</span>
              <span>5 drivers showing medium risk - consider additional safety training</span>
            </li>
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">💡 Recommendations</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Schedule driver training sessions for medium and high-risk drivers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Send reminders to drivers with expiring licenses (within 60 days)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Implement weekly safety briefings for the fleet</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Review high-incident routes and driver patterns</span>
            </li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
};

export default SafetyAnalytics;
