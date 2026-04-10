import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNotification } from '../../hooks/useNotification';
import authBaseURL from '../../api/authBaseURL';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotification();
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
  const [isReset, setIsReset] = useState(false);

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
     }  else if (formData.password.length < 8) {
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
      notifyError('Invalid reset link. Please try again.');
      navigate('/forgot-password');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authBaseURL.post('/reset-password', {
        token,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      });

      if (response.status === 200) {
        notifySuccess(response.data.message || 'Password reset successfully');
        // Clear any existing user data before showing success page
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        setIsReset(true);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      notifyError(errorMessage);

      // If token is invalid or expired, redirect to forgot password
      if (error.response?.status === 400 || error.response?.status === 401) {
        setTimeout(() => {
          navigate('/auth/forgot-password');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      notifyError('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  if (isReset) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
          <FaCheckCircle className="text-2xl" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Password Reset Successful</h2>
        <p className="text-sm text-slate-600">
          Your password has been reset successfully. Log in with your new password.
        </p>
        <button
          onClick={() => navigate('/auth/login')}
          className="w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-950">Reset Your Password</h2>
        <p className="text-slate-600">
          Enter a new password to regain access to your account.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* New Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type={showPasswords.password ? 'text' : 'password'}
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.password ? 'border-rose-500 focus:ring-rose-500/35' : 'border-slate-300 focus:ring-blue-500/35 focus:border-blue-500'
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
            <p className="mt-1 flex items-center gap-1 text-sm text-rose-600">
              <FaTimesCircle className="text-xs" /> {errors.password}
            </p>
          )}

          {/* Password Requirements */}
          {formData.password && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Password Requirements:</p>
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
              className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500/35' : 'border-slate-300 focus:ring-blue-500/35 focus:border-blue-500'
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
            <p className="mt-1 flex items-center gap-1 text-sm text-rose-600">
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
          className="w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Remember your password?{' '}
        <Link to="/auth/login" className="font-semibold text-blue-700 hover:text-indigo-700">
          Login
        </Link>
      </p>
    </div>
  );
}
