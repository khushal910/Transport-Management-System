import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function PrivateRoute({ children, requiredRoles }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const userStr = localStorage.getItem('user');

  // Check if user data exists in localStorage
  useEffect(() => {
    if (!userStr) {
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      setIsAuthenticated(false);
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      
      // Validate user object has required properties
      if (!userData.id || !userData.role || !userData.email) {
        console.error('User missing required properties:', userData);
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        setIsAuthenticated(false);
        return;
      }

      // User data exists and is valid
      setUser(userData);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      setIsAuthenticated(false);
    }
  }, [userStr]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  // Note: If JWT token is invalid, the axios interceptor will handle 401 errors
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // No role required
  if (!requiredRoles) {
    return children;
  }

  const allowedRoles = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  // Role check
  if (allowedRoles.includes(user.role)) {
    return children;
  }

  // Unauthorized - no permission
  return <Navigate to="/main/dashboard" replace />;
}
