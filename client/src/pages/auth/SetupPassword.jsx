import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import authBaseURL from '../../api/authBaseURL';

export default function SetupPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);

  // Password validation
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(passwordRequirements).every(Boolean);

  const validateForm = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!isPasswordStrong) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid setup link. Please check your email.');
      navigate('/auth/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authBaseURL.post('/setup-password', {
        token,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      });

      if (response.status === 200) {
        toast.success(response.data.message || 'Password set successfully');
        // Clear any existing user data before showing success page
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        setIsSetup(true);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Failed to set password';
      toast.error(errorMessage);

      // If link is invalid or expired, redirect to login
      if (error.response?.status === 400 || error.response?.status === 401) {
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error('Invalid setup link');
      navigate('/auth/login');
    }
  }, [token, navigate]);

  if (isSetup) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Animated Gradient Blobs Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Success Icon with animation */}
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-linear-to-br from-green-400 to-emerald-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <FaCheckCircle className="text-white text-4xl" />
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200 mx-auto">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span className="text-sm font-medium text-green-700">Account Setup Complete</span>
            </div>

            {/* Main heading */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                <span className="block text-gray-900">Welcome to</span>
                <span className="block bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Transport Management System
                </span>
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Your password has been set successfully!
              </p>
              <p className="text-gray-600 leading-relaxed">
                Your account is now fully active and ready to use. Log in with your credentials to access your dashboard and start managing your fleet.
              </p>
            </div>

            {/* Security Info Card */}
            <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mt-0.5 shrink-0 flex-none">
                    ✓
                  </div>
                  <span className="text-sm text-gray-700 text-left">Email verified and account confirmed</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mt-0.5 shrink-0 flex-none">
                    ✓
                  </div>
                  <span className="text-sm text-gray-700 text-left">Password secured with strong encryption</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mt-0.5 shrink-0 flex-none">
                    ✓
                  </div>
                  <span className="text-sm text-gray-700 text-left">Two-factor authentication available</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/auth/login')}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 group"
            >
              Proceed to Login
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Additional Trust Signal */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-green-400">★</span>
                ))}
              </div>
              <p className="text-xs text-gray-600">
                Trusted by <span className="font-semibold text-gray-900">1000+ fleet managers</span>
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }

          .animate-blob {
            animation: blob 7s infinite;
          }

          .animation-delay-2000 {
            animation-delay: 2s;
          }

          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h2>
        <p className="text-gray-600">
          Welcome! Please set a strong password to activate your account.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type={showPasswords.password ? 'text' : 'password'}
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('password')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPasswords.password ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <FaTimesCircle className="text-xs" /> {errors.password}
            </p>
          )}

          {/* Password Requirements */}
          {formData.password && (
            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {passwordRequirements.minLength ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-gray-300" />
                  )}
                  <span className={passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {passwordRequirements.hasUpperCase ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-gray-300" />
                  )}
                  <span className={passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {passwordRequirements.hasLowerCase ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-gray-300" />
                  )}
                  <span className={passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {passwordRequirements.hasNumber ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-gray-300" />
                  )}
                  <span className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {passwordRequirements.hasSpecialChar ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-gray-300" />
                  )}
                  <span className={passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>
                    One special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full border pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <FaTimesCircle className="text-xs" /> {errors.confirmPassword}
            </p>
          )}

          {/* Password Match Indicator */}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
              <FaCheckCircle className="text-xs" /> Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !formData.password || !formData.confirmPassword}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          {loading ? 'Setting Password...' : 'Set Password'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600 text-center">
        Need help?{' '}
        <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
