import { Navigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';

export default function PrivateRoute({ children, requiredRoles }) {
  const { notifyError } = useNotification();
  const userStr = localStorage.getItem('user');

  // Not logged in - No user data in localStorage
  if (!userStr) {
    // Clear any partially stored data
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    
    notifyError('Session expired. Please login again.');
    return <Navigate to="/" replace />;
  }

  let user;

  // Only wrap parsing
  try {
    user = JSON.parse(userStr);
  } catch (error) {
    console.error('Invalid user data:', error);
    
    // Clear corrupted data
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    
    notifyError('Invalid session data. Please login again.');
    return <Navigate to="/" replace />;
  }

  // Validate user object has required properties
  if (!user.id || !user.role || !user.email) {
    console.error('User missing required properties:', user);
    
    // Clear invalid data
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    
    notifyError('Invalid user data. Please login again.');
    return <Navigate to="/" replace />;
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

  // Unauthorized
  notifyError('You do not have permission to access this page.');
  return <Navigate to="/main/dashboard" replace />;
}
