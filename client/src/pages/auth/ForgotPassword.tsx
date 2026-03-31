import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import authBaseURL from '../../api/authBaseURL';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Email validation
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    try {
      const response = await authBaseURL.post('/forgot-password', { email });

      if (response.status === 200) {
        toast.success(response.data.message || 'Password reset link sent to your email');
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset link';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
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
            {/* Email Icon with animation */}
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-blue-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FaEnvelope className="text-white text-4xl" />
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mx-auto">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span className="text-sm font-medium text-blue-700">Email Sent Successfully</span>
            </div>

            {/* Main heading */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                <span className="block text-gray-900">Check Your</span>
                <span className="block bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Email Inbox
                </span>
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                We've sent a password reset link to:
              </p>
              <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <p className="text-base font-semibold text-blue-600 break-all">{email}</p>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The reset link will expire in <span className="font-semibold">24 hours</span>. Please check your email and follow the instructions to reset your password.
              </p>
            </div>

            {/* Info Steps */}
            <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <span className="text-sm text-gray-700">Check your inbox and spam folder</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <span className="text-sm text-gray-700">Click the password reset link</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <span className="text-sm text-gray-700">Set your new password and login</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/auth/login')}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 group"
            >
              Back to Login
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Trust Signal */}
            <div className="pt-4 space-y-2">
              <p className="text-xs text-gray-600">
                <span className="text-green-600 font-semibold">✓ Secure & Encrypted</span> • Link expires after 24 hours
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
      <button
        onClick={() => navigate('/auth/login')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <FaArrowLeft className="text-sm" />
        Back to Login
      </button>

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600 text-center">
        Remember your password?{' '}
        <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}
