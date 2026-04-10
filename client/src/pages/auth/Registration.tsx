import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authBaseURL from '../../api/authBaseURL';
import { FaEye, FaEyeSlash, FaChevronDown } from 'react-icons/fa';
import { useNotification } from '../../hooks/useNotification';
import { useFormNavigation } from '../../hooks/useFormNavigation';
import passwordConfig from '../../config/environment';

export default function Register() {
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotification();
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
    company: {
      name: '',
      registrationNumber: '',
      address: '',
      phone: '',
      email: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandCompanySection, setExpandCompanySection] = useState(true);

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!registrationData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    // Email validation
    if (!registrationData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!registrationData.password) {
      newErrors.password = 'Password is required';
    } else if (registrationData.password.length < passwordConfig.getMinPasswordLength()) {
      newErrors.password = passwordConfig.getPasswordRuleMessage();
    }

    // Company validation
    if (!registrationData.company.name.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!registrationData.company.registrationNumber.trim()) {
      newErrors.companyRegNum = 'Registration number is required';
    }
    if (!registrationData.company.phone.trim()) {
      newErrors.companyPhone = 'Phone number is required';
    }
    if (!registrationData.company.email.trim()) {
      newErrors.companyEmail = 'Company email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      notifyError('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    const data = {
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      role: registrationData.role,
      company: registrationData.company,
    };

    try {
      const response = await authBaseURL.post('/register', data);

      if (response.status == 201) {
        notifySuccess(response.data?.message);
        setIsLoading(false);
        navigate('/auth/login', {
          state: {
            email: registrationData.email,
          },
        });
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      notifyError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  // Use the form navigation hook (8 input fields total - must be after handleSubmit is defined)
  const { inputRefs, handleKeyDown } = useFormNavigation(8, handleSubmit);
  
  return (
    <div>
      {/* Page Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">Create Account</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${passwordConfig.getEnvironmentBadge().color}`}>
            {passwordConfig.getEnvironmentBadge().label}
          </span>
        </div>
        <p className="text-slate-600">Get started with FleetFlow management system</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <div className="mb-6 rounded-2xl border border-blue-200/70 bg-blue-50/55 p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Personal Information</h3>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              placeholder="John Doe"
              autoComplete="off"
              className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                errors.name 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
              value={registrationData.name}
              ref={(el) => (inputRefs.current[0] = el)}
              onKeyDown={(e) => handleKeyDown(e, 0)}
              onChange={(e) => {
                setRegistrationData({ ...registrationData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>●</span> {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              placeholder="you@example.com"
              type="email"
              autoComplete="off"
              className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                errors.email 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
              value={registrationData.email}
              ref={(el) => (inputRefs.current[1] = el)}
              onKeyDown={(e) => handleKeyDown(e, 1)}
              onChange={(e) => {
                setRegistrationData({ ...registrationData, email: e.target.value });
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {passwordConfig.isDevelopment && <span className="text-xs text-orange-600">(Dev Mode: 3+ chars)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="off"
                className={`w-full px-4 py-3 border-2 rounded-lg transition-colors pr-12 ${
                  errors.password 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
                value={registrationData.password}
                ref={(el) => (inputRefs.current[2] = el)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                onChange={(e) => {
                  setRegistrationData({ ...registrationData, password: e.target.value });
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
        </div>

        {/* Company Information Section */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setExpandCompanySection(!expandCompanySection)}
            className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 transition-colors hover:bg-slate-100"
          >
            <h3 className="text-lg font-semibold text-slate-900">Company Information</h3>
            <FaChevronDown 
              className={`transition-transform ${expandCompanySection ? 'rotate-180' : ''}`}
              size={18}
            />
          </button>

          {expandCompanySection && (
            <div className="p-5 bg-white space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  placeholder="ABC Logistics"
                  autoComplete="off"
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    errors.companyName 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                  value={registrationData.company.name}
                  ref={(el) => (inputRefs.current[3] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 3)}
                  onChange={(e) => {
                    setRegistrationData({
                      ...registrationData,
                      company: { ...registrationData.company, name: e.target.value },
                    });
                    if (errors.companyName) setErrors({ ...errors, companyName: '' });
                  }}
                  disabled={isLoading}
                />
                {errors.companyName && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>●</span> {errors.companyName}
                  </p>
                )}
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  placeholder="REG-123456"
                  autoComplete="off"
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    errors.companyRegNum 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                  value={registrationData.company.registrationNumber}
                  ref={(el) => (inputRefs.current[4] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 4)}
                  onChange={(e) => {
                    setRegistrationData({
                      ...registrationData,
                      company: { ...registrationData.company, registrationNumber: e.target.value },
                    });
                    if (errors.companyRegNum) setErrors({ ...errors, companyRegNum: '' });
                  }}
                  disabled={isLoading}
                />
                {errors.companyRegNum && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>●</span> {errors.companyRegNum}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  placeholder="123 Business St, City"
                  autoComplete="off"
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={registrationData.company.address}
                  ref={(el) => (inputRefs.current[5] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 5)}
                  onChange={(e) =>
                    setRegistrationData({
                      ...registrationData,
                      company: { ...registrationData.company, address: e.target.value },
                    })
                  }
                  disabled={isLoading}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  placeholder="+1 (555) 123-4567"
                  autoComplete="off"
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    errors.companyPhone 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                  value={registrationData.company.phone}
                  ref={(el) => (inputRefs.current[6] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 6)}
                  onChange={(e) => {
                    setRegistrationData({
                      ...registrationData,
                      company: { ...registrationData.company, phone: e.target.value },
                    });
                    if (errors.companyPhone) setErrors({ ...errors, companyPhone: '' });
                  }}
                  disabled={isLoading}
                />
                {errors.companyPhone && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>●</span> {errors.companyPhone}
                  </p>
                )}
              </div>

              {/* Company Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email
                </label>
                <input
                  placeholder="info@company.com"
                  type="email"
                  autoComplete="off"
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    errors.companyEmail 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                  value={registrationData.company.email}
                  ref={(el) => (inputRefs.current[7] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 7)}
                  onChange={(e) => {
                    setRegistrationData({
                      ...registrationData,
                      company: { ...registrationData.company, email: e.target.value },
                    });
                    if (errors.companyEmail) setErrors({ ...errors, companyEmail: '' });
                  }}
                  disabled={isLoading}
                />
                {errors.companyEmail && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>●</span> {errors.companyEmail}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-slate-700">
            <strong className="text-slate-900">Manager Role:</strong> You're registering as a manager. After registration, you can invite other employees to your team.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition-all duration-300 ${
            isLoading
              ? 'cursor-not-allowed bg-slate-400 opacity-70'
              : 'bg-linear-to-r from-blue-600 to-indigo-600 shadow-sm hover:-translate-y-0.5 hover:shadow-md'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 border-t border-slate-200 pt-6 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link 
            to="/auth/login" 
            className="font-semibold text-blue-700 transition-colors hover:text-indigo-700"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
