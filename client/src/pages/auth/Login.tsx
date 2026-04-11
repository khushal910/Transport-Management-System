import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authBaseURL from '../../api/authBaseURL';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaTruck } from 'react-icons/fa';
import { useNotification } from '../../hooks/useNotification';
import { useFormNavigation } from '../../hooks/useFormNavigation';
import passwordConfig from '../../config/environment';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotification();

  const [loginData, setLoginData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState('');

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    } else if (loginData.password.length < passwordConfig.getMinPasswordLength()) {
      newErrors.password = passwordConfig.getPasswordRuleMessage();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const data = {
      email: loginData.email,
      password: loginData.password,
    };

    try {
      const response = await authBaseURL.post('/login', data);

      setLoginError('');

      const userData = response.data.data || response.data.user;
      if (!userData) {
        setIsLoading(false);
        setLoginError('Invalid response from server');
        notifyError('Invalid response from server');
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        return;
      }

      localStorage.setItem('user', JSON.stringify({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        companyId: userData.companyId,
      }));

      if (userData.company) {
        localStorage.setItem('company', JSON.stringify(userData.company));
      }

      notifySuccess(response.data.message || 'Login successful!');

      setTimeout(() => {
        navigate('/main/dashboard');
      }, 100);
      setIsLoading(false);
    } catch (error: unknown) {
      console.error('Login error:', error);

      localStorage.removeItem('user');
      localStorage.removeItem('company');
      setIsLoading(false);

      const typedError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = typedError.response?.data?.message || typedError.message || 'An error occurred. Please try again.';
      setLoginError(errorMessage);
      notifyError(errorMessage);
    }
  };

  const { inputRefs, handleKeyDown } = useFormNavigation(2, handleLogin);

  return (
    <div className="space-y-8">
      <div className="mb-2 flex items-center justify-center gap-2 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500">
          <FaTruck className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">FleetFlow</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue</p>
      </div>

      {loginError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <FaExclamationCircle className="mt-0.5 shrink-0 text-base text-rose-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800">{loginError}</p>
              <p className="mt-1 text-xs text-rose-600">Please check your email and password and try again.</p>
            </div>
            <button
              type="button"
              onClick={() => setLoginError('')}
              className="shrink-0 text-sm text-rose-400 transition-colors hover:text-rose-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleLogin}>
        <div className="space-y-2">
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="you@company.com"
            className={`h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.email ? 'border-rose-500' : 'border-slate-300'
            }`}
            value={loginData.email}
            ref={(el) => {
              inputRefs.current[0] = el;
            }}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            onChange={(e) => {
              setLoginData({ ...loginData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-rose-600">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-800"
              onClick={(e) => isLoading && e.preventDefault()}
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`h-10 w-full rounded-md border bg-white px-3 py-2 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60 ${
                errors.password ? 'border-rose-500' : 'border-slate-300'
              }`}
              value={loginData.password}
              ref={(el) => {
                inputRefs.current[1] = el;
              }}
              onKeyDown={(e) => handleKeyDown(e, 1)}
              onChange={(e) => {
                setLoginData({ ...loginData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-rose-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-medium text-white transition-colors ${
            isLoading
              ? 'cursor-not-allowed bg-slate-400'
              : 'bg-sky-500 hover:bg-sky-600'
          }`}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link
          to="/auth/register"
          className="font-medium text-sky-600 hover:underline"
        >
          Register your company
        </Link>
      </p>
    </div>
  );
}
