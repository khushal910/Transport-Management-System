import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, requiredRoles }) {
  const userStr = localStorage.getItem('user');

  // Not logged in
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  let user;

  // Only wrap parsing
  try {
    user = JSON.parse(userStr);
  } catch (error) {
    console.error('Invalid user data:', error);
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
  return <Navigate to="/main/dashboard" replace />;
}
