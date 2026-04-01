import { ReactNode } from 'react';
import { UserRole, rolePermissions, navItems } from '../config/rolePermissions';

interface RoleGuideProps {
  showInSidebar?: boolean;
}

/**
 * RoleGuide Component
 * Displays information about the current user's role and accessible pages
 * Can be used in help sections or sidebars
 */
export const RoleGuide = ({ showInSidebar = true }: RoleGuideProps) => {
  const getUserRole = (): UserRole => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? (JSON.parse(userData).role as UserRole) : 'dispatcher';
    } catch {
      return 'dispatcher';
    }
  };

  const userRole = getUserRole();
  const roleConfig = rolePermissions[userRole];
  const accessibleItems = navItems.filter(item =>
    item.requiredRoles.includes(userRole)
  );

  if (!showInSidebar) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{roleConfig.icon}</span>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{roleConfig.name}</h3>
          <p className="text-xs text-gray-600">Role Permissions</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs text-gray-700 font-semibold mb-2">Your accessible pages:</p>
        <ul className="space-y-1">
          {accessibleItems.map(item => (
            <li key={item.path} className="text-xs text-gray-700 flex items-center gap-2">
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * RoleInformation Component
 * Displays comprehensive role information for admin or help purposes
 */
export const RoleInformation = () => {
  return (
    <div className="space-y-6">
      {/* 👑 Manager */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">👑</span>
          <h3 className="text-lg font-bold text-gray-900">Manager (Full Control)</h3>
        </div>
        <p className="text-sm text-gray-700 mb-3">Complete access to all features</p>
        <div className="flex flex-wrap gap-2">
          {navItems
            .filter(item => item.requiredRoles.includes('manager'))
            .map(item => (
              <span key={item.path} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                {item.icon} {item.label}
              </span>
            ))}
        </div>
      </div>

      {/* 🚚 Dispatcher */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🚚</span>
          <h3 className="text-lg font-bold text-gray-900">Dispatcher (Operations Role)</h3>
        </div>
        <p className="text-sm text-gray-700 mb-3">Focus on trip operations and management</p>
        <div className="flex flex-wrap gap-2">
          {navItems
            .filter(item => item.requiredRoles.includes('dispatcher'))
            .map(item => (
              <span key={item.path} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {item.icon} {item.label}
              </span>
            ))}
        </div>
      </div>

      {/* 🛡️ Safety Officer */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🛡️</span>
          <h3 className="text-lg font-bold text-gray-900">Safety Officer (Compliance Role)</h3>
        </div>
        <p className="text-sm text-gray-700 mb-3">Monitor driver safety and compliance</p>
        <div className="flex flex-wrap gap-2">
          {navItems
            .filter(item => item.requiredRoles.includes('safety_officer'))
            .map(item => (
              <span key={item.path} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                {item.icon} {item.label}
              </span>
            ))}
        </div>
      </div>

      {/* 📊 Financial Analyst */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-bold text-gray-900">Financial Analyst (Finance Role)</h3>
        </div>
        <p className="text-sm text-gray-700 mb-3">Track expenses and financial analytics</p>
        <div className="flex flex-wrap gap-2">
          {navItems
            .filter(item => item.requiredRoles.includes('financial_analyst'))
            .map(item => (
              <span key={item.path} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {item.icon} {item.label}
              </span>
            ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-2">⚠️ Important Decisions</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span>👥</span>
            <span><strong>Team Page:</strong> Only accessible by Manager and Admin roles</span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span><strong>Dashboard Views:</strong> Each role sees role-specific dashboard data</span>
          </li>
          <li className="flex gap-2">
            <span>🔒</span>
            <span><strong>Unauthorized Access:</strong> Attempting to access restricted pages redirects to dashboard</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RoleGuide;
