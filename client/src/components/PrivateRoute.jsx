import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function PrivateRoute({ children, requiredRoles }) {
  const userStr = localStorage.getItem('user');

  // Not logged in
  if (!userStr) {
    toast.error('Session expired. Please login again.', {
      position: 'top-right',
      autoClose: 3000,
    });
    return <Navigate to="/login" replace />;
  }

  let user;

  // Only wrap parsing
  try {
    user = JSON.parse(userStr);
  } catch (error) {
    console.error('Invalid user data:', error);
    toast.error('Invalid session data. Please login again.', {
      position: 'top-right',
      autoClose: 3000,
    });
    return <Navigate to="/login" replace />;
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
