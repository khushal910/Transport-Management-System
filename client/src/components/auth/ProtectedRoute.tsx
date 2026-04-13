import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/fleet';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const DEFAULT_ROUTE: Record<UserRole, string> = {
  manager: '/dashboard',
  dispatcher: '/dashboard',
  driver: '/trips',
  safety_officer: '/dashboard',
  financial_analyst: '/analytics',
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={DEFAULT_ROUTE[user.role]} replace />;
  }

  return <Outlet />;
}
