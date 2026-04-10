import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useNotification } from '../../hooks/useNotification';
import authBaseURL from '../../api/authBaseURL';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();
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
        notifySuccess(response.data.message || 'Password reset link sent to your email');
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset link';
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30">
          <FaEnvelope className="text-2xl" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Email Sent Successfully
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Check Your Email Inbox</h1>
          <p className="mt-2 text-sm text-slate-600">
            We sent a reset link to <strong className="text-slate-900">{email}</strong>. The link expires in 24 hours.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Next steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Check inbox and spam folder</li>
            <li>Open the reset link</li>
            <li>Create a new secure password</li>
          </ol>
        </div>

        <button
          onClick={() => navigate('/auth/login')}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          Back to Login
          <FaArrowRight className="transition-transform group-hover:translate-x-1" />
        </button>
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
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-950">Forgot Password?</h2>
        <p className="text-slate-600">
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
              className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                emailError ? 'border-rose-500 focus:ring-rose-500/35' : 'border-slate-300 focus:ring-blue-500/35 focus:border-blue-500'
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
          className="w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
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
