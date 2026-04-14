import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Eye, EyeOff } from 'lucide-react';
import { login } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/fleet';

const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  manager: '/dashboard',
  dispatcher: '/dashboard',
  driver: '/trips',
  safety_officer: '/dashboard',
  financial_analyst: '/analytics',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refetch } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const requestedNextPath = searchParams.get('next');

  const getPostLoginRoute = (role?: UserRole) => {
    if (
      requestedNextPath &&
      requestedNextPath.startsWith('/') &&
      !requestedNextPath.startsWith('//') &&
      requestedNextPath !== '/login'
    ) {
      return requestedNextPath;
    }

    if (role && ROLE_DEFAULT_ROUTE[role]) {
      return ROLE_DEFAULT_ROUTE[role];
    }

    return '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(form);
      // Refresh auth context with real user data
      await refetch();
      const role = result.data?.role as UserRole | undefined;
      navigate(getPostLoginRoute(role), { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Branding */}
      <div className="hidden flex-1 flex-col justify-between bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-sidebar-accent-foreground">FleetFlow</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-sidebar-accent-foreground">
            Manage your fleet<br />with confidence.
          </h1>
          <p className="mt-4 max-w-md text-sidebar-foreground">
            Track vehicles, manage trips, monitor expenses, and optimize your fleet operations — all in one place.
          </p>
        </div>
        <p className="text-sm text-sidebar-muted">© 2026 FleetFlow. All rights reserved.</p>
      </div>

      {/* Right - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FleetFlow</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Register your company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
