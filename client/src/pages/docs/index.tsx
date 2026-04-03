import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function DocsIndex() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const darkMode = localStorage.getItem('dark-mode') === 'true';
    setIsDark(darkMode);
  }, []);

  const docs = [
    {
      title: 'Getting Started',
      icon: '🚀',
      description: 'Learn the basics and set up your first fleet',
      path: '/docs/getting-started',
    },
    {
      title: 'Fleet Management',
      icon: '🚗',
      description: 'Manage vehicles, track status, and maintain inventory',
      path: '/docs/fleet-management',
    },
    {
      title: 'Driver Management',
      icon: '👨‍💼',
      description: 'Manage drivers, licenses, and performance metrics',
      path: '/docs/driver-management',
    },
    {
      title: 'Trip Management',
      icon: '📍',
      description: 'Plan routes, dispatch trips, and track deliveries',
      path: '/docs/trip-management',
    },
    {
      title: 'Maintenance',
      icon: '🔧',
      description: 'Schedule maintenance and track service history',
      path: '/docs/maintenance',
    },
    {
      title: 'Expenses & Costs',
      icon: '💰',
      description: 'Track and manage fleet expenses and budgets',
      path: '/docs/expenses',
    },
    {
      title: 'Role-Based Access',
      icon: '🔐',
      description: 'Understand user roles, permissions, and access control',
      path: '/docs/rbac',
    },
    {
      title: 'Email Notifications',
      icon: '📧',
      description: 'Automated email updates for employee account changes',
      path: '/docs/email-notifications',
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white py-16`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Documentation</h1>
            <p className="text-xl opacity-90">
              Complete guide to Transport Management System
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Core Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((doc, idx) => (
              <Link key={idx} to={doc.path}>
                <div
                  className={`h-full p-6 rounded-lg transition-all hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
                    isDark
                      ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                      : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-lg'
                  }`}
                >
                  <div className="text-4xl mb-4">{doc.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{doc.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {doc.description}
                  </p>
                  <div className={`mt-4 font-semibold text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    Learn more →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-8 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'} text-center`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            For more information, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
