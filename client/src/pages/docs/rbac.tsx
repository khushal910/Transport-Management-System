import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function RBACDocs() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('dark-mode') === 'true';
    setIsDark(darkMode);
  }, []);

  const roles = [
    {
      name: 'Manager',
      icon: '👑',
      level: 'Full Control',
      permissions: [
        'View all system data',
        'Create/Edit/Delete vehicles',
        'Assign trips and drivers',
        'Manage employee accounts',
        'Schedule maintenance',
        'View all reports & analytics',
        'Send employee notification emails',
      ],
      cannotAccess: [],
      pages: [
        'Dashboard (Full)',
        'Vehicle Registry',
        'Trip Dispatcher',
        'Driver Registry / Team',
        'Maintenance',
        'Trip Expense',
        'Performance Analytics',
        'System Analytics',
      ],
    },
    {
      name: 'Dispatcher',
      icon: '🚚',
      level: 'Operations Focus',
      permissions: [
        'View active trips',
        'Create new trips',
        'Assign vehicles to trips',
        'Assign drivers to trips',
        'Update trip status',
        'View vehicle availability',
        'Track real-time locations',
      ],
      cannotAccess: [
        'Employee management',
        'Maintenance scheduling',
        'Financial data',
        'System settings',
      ],
      pages: [
        'Dashboard (Operations Only)',
        'Vehicle Registry (View Only)',
        'Driver Registry (View Only)',
        'Trip Dispatcher',
      ],
    },
    {
      name: 'Safety Officer',
      icon: '🛡️',
      level: 'Compliance & Safety',
      permissions: [
        'Monitor driver safety scores',
        'View maintenance schedules',
        'Access compliance alerts',
        'Generate safety reports',
        'Track vehicle inspection history',
        'View driver performance ratings',
      ],
      cannotAccess: [
        'Vehicle management',
        'Trip assignment',
        'Employee data',
        'Financial information',
        'System settings',
      ],
      pages: [
        'Dashboard (Safety Metrics)',
        'Performance Analytics (Safety)',
      ],
    },
    {
      name: 'Financial Analyst',
      icon: '📊',
      level: 'Finance & Analytics',
      permissions: [
        'View all expense data',
        'Analyze cost trends',
        'Generate financial reports',
        'Track revenue metrics',
        'View fuel consumption costs',
        'Budget vs. actual analysis',
      ],
      cannotAccess: [
        'Vehicle management',
        'Trip assignment',
        'Driver management',
        'Employee data',
        'System settings',
      ],
      pages: [
        'Dashboard (Financial Metrics)',
        'Trip Expense',
        'System Analytics (Finance)',
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Link to="/docs" className={`text-blue-600 hover:text-blue-700 mb-8 inline-block`}>
          ← Back to Documentation
        </Link>

        <h1 className="text-4xl font-bold mb-4">🔐 Role-Based Access Control</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Understand user roles, permissions, and access levels in the Transport Management System
        </p>

        {/* Overview */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-200'}`}>
          <h2 className="text-2xl font-bold mb-4">System Overview</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            FleetFlow implements strict Role-Based Access Control (RBAC) to ensure data security and operational integrity. Each user role has defined permissions, accessible pages, and data view limitations.
          </p>
          <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            The system supports 4 distinct roles, each designed for specific operational needs:
          </p>
        </div>

        {/* Role Details */}
        <div className="mt-12">
          {roles.map((role, idx) => (
            <div
              key={idx}
              className={`mb-8 p-6 rounded-lg border-2 ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200 shadow-lg'
              }`}
            >
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-4">{role.icon}</span>
                <div>
                  <h3 className="text-3xl font-bold">{role.name}</h3>
                  <p className={`text-sm font-semibold ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {role.level}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Permissions */}
                <div>
                  <h4 className="text-lg font-bold mb-3">✅ Permissions</h4>
                  <ul className={`space-y-2 text-sm`}>
                    {role.permissions.map((perm, pidx) => (
                      <li key={pidx} className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="mr-2 text-green-500">✓</span>
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pages */}
                <div>
                  <h4 className="text-lg font-bold mb-3">📄 Accessible Pages</h4>
                  <ul className={`space-y-2 text-sm`}>
                    {role.pages.map((page, pidx) => (
                      <li key={pidx} className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="mr-2 text-blue-500">●</span>
                        {page}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Restrictions */}
              {role.cannotAccess.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-bold mb-3">❌ Cannot Access</h4>
                  <div className="flex flex-wrap gap-2">
                    {role.cannotAccess.map((item, cidx) => (
                      <span
                        key={cidx}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isDark
                            ? 'bg-red-900 text-red-200'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Security Rules */}
        <div className={`mt-12 p-6 rounded-lg ${isDark ? 'bg-yellow-900 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
          <h2 className="text-2xl font-bold mb-4">🔒 Security Rules</h2>
          <ul className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-yellow-600">1.</span>
              <div>
                <strong>Authentication Required</strong>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  All endpoints require a valid JWT token. Tokens expire after inactivity and require re-login.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-yellow-600">2.</span>
              <div>
                <strong>Authorization Check</strong>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Every request is validated against the user's role. Unauthorized access returns a 403 Forbidden error.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-yellow-600">3.</span>
              <div>
                <strong>Data Isolation</strong>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Users see only data for their company. Multi-tenant isolation is strictly enforced.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold text-yellow-600">4.</span>
              <div>
                <strong>Audit Logging</strong>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  All access attempts and modifications are logged for compliance and security review.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Best Practices */}
        <div className={`mt-12 p-6 rounded-lg ${isDark ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
          <h2 className="text-2xl font-bold mb-4">💡 Best Practices</h2>
          <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start">
              <span className="mr-2 text-green-600 font-bold">•</span>Assign roles based on job responsibilities, not hierarchical positions
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-600 font-bold">•</span>Regularly review user permissions and deactivate unused accounts
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-600 font-bold">•</span>Use strong, unique passwords for each account
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-600 font-bold">•</span>Enable email notifications to track account changes
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-600 font-bold">•</span>Report suspicious activity to your security team immediately
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className={`mt-12 p-8 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'} text-center`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Need help? Contact your system administrator or review the Email Notifications documentation.
          </p>
          <Link to="/docs/email-notifications" className="text-blue-600 hover:text-blue-700 mt-2 inline-block font-semibold">
            View Email Notifications Documentation →
          </Link>
        </div>
      </div>
    </div>
  );
}
