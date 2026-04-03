import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '../config/rolePermissions';

interface RoleBasedRouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * Production-grade route guard with role validation
 * Enforces role-based access control at route level
 */
export const RoleBasedRouteGuard: React.FC<RoleBasedRouteGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/main/dashboard',
}) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();
  const userStr = localStorage.getItem('user');

  useEffect(() => {
    if (!userStr) {
      setIsAuthorized(false);
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      const userRole = userData.role as UserRole;

      // Validate user has required role
      const hasAccess = allowedRoles.includes(userRole);
      setIsAuthorized(hasAccess);

      if (!hasAccess) {
        console.warn(`⛔ Access denied: Role '${userRole}' not in allowed roles:`, allowedRoles);
      }
    } catch (error) {
      console.error('Error validating route access:', error);
      setIsAuthorized(false);
    }
  }, [userStr, allowedRoles]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authorized - redirect
  if (!isAuthorized) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Authorized - render component
  return <>{children}</>;
};

export default RoleBasedRouteGuard;
