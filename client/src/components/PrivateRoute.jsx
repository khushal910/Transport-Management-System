import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function PrivateRoute({ children, requiredRoles }) {
  const userStr = localStorage.getItem('user');

  // Not logged in - No user data in localStorage
  if (!userStr) {
    // Clear any partially stored data
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    
    toast.error('Session expired. Please login again.', {
      position: 'top-right',
      autoClose: 3000,
    });
    return <Navigate to="/auth/login" replace />;
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
    
    toast.error('Invalid session data. Please login again.', {
      position: 'top-right',
      autoClose: 3000,
    });
    return <Navigate to="/auth/login" replace />;
  }

  // Validate user object has required properties
  if (!user.id || !user.role || !user.email) {
    console.error('User missing required properties:', user);
    
    // Clear invalid data
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    
    toast.error('Invalid user data. Please login again.', {
      position: 'top-right',
      autoClose: 3000,
    });
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

  // Unauthorized
  toast.error('You do not have permission to access this page.', {
    position: 'top-right',
    autoClose: 3000,
  });
  return <Navigate to="/main/dashboard" replace />;
}
