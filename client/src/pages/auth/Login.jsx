import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authBaseURL from '../../api/authBaseURL';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useFormNavigation } from '../../hooks/useFormNavigation';
import passwordConfig from '../../config/environment';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      // User data exists, redirect to dashboard
      // If there's no valid session, the dashboard/interceptor will handle logout
      navigate('/main/dashboard');
    }
  }, [navigate]);

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

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

  const handleLogin = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isLoading) return;

    // Validate form
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
      
      // Extract and validate user data
      const userData = response.data.data || response.data.user;
      if (!userData) {
        toast.error('Invalid response from server');
        setIsLoading(false);
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        return;
      }

      // Store user information (token is in httpOnly cookie, sent automatically)
      localStorage.setItem('user', JSON.stringify({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        companyId: userData.companyId,
      }));
      
      // Store company information in localStorage
      if (userData.company) {
        localStorage.setItem('company', JSON.stringify(userData.company));
      }

      toast.success(response.data.message || 'Login successful!');
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/main/dashboard');
      }, 100);
      setIsLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear localStorage on failed login
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      setIsLoading(false);
      
      // Show specific error message
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Use the form navigation hook (must be after handleLogin is defined)
  const { inputRefs, handleKeyDown } = useFormNavigation(2, handleLogin);

  return (
    <div>
      {/* Page Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${passwordConfig.getEnvironmentBadge().color}`}>
            {passwordConfig.getEnvironmentBadge().label}
          </span>
        </div>
        <p className="text-gray-600">Sign in to access your fleet dashboard</p>
      </div>

      <form className="space-y-5" onSubmit={handleLogin}>
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`w-full px-4 py-3 border-2 rounded-lg transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.email 
                ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-red-500' 
                : 'border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
            value={loginData.email}
            ref={(el) => (inputRefs.current[0] = el)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            onChange={(e) => {
              setLoginData({ ...loginData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <span>●</span> {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password {passwordConfig.isDevelopment && <span className="text-xs text-orange-600">(Dev Mode: 3+ chars)</span>}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full px-4 py-3 border-2 rounded-lg transition-colors pr-12 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.password 
                  ? 'border-red-500 bg-red-50 focus:outline-none focus:ring-red-500' 
                  : 'border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
              value={loginData.password}
              ref={(el) => (inputRefs.current[1] = el)}
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
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <span>●</span> {errors.password}
            </p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end pt-2">
          <Link 
            to="/auth/forgot-password" 
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            onClick={(e) => isLoading && e.preventDefault()}
          >
            Forgot password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link 
            to="/auth/register" 
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}
