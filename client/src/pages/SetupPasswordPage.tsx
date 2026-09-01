import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { setupPassword } from '@/api/auth';

const RESET_TOKEN_REGEX = /^[a-f0-9]{64}$/i;

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  return fallback;
};

export default function SetupPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setupToken = searchParams.get('token')?.trim() ?? '';
  const hasSetupToken = setupToken.length > 0;
  const isSetupTokenValid = hasSetupToken && RESET_TOKEN_REGEX.test(setupToken);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password validation rules
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  const isPasswordValid = password.length >= 6 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = isPasswordValid && passwordsMatch;

  useEffect(() => {
    if (!hasSetupToken) {
      setError('Invalid or missing setup link. Please check your email for the setup link.');
      return;
    }

    if (!isSetupTokenValid) {
      setError('Setup link format is invalid. Please request a new setup email.');
      return;
    }

    setError(null);
  }, [hasSetupToken, isSetupTokenValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSetupTokenValid) {
      setError('Invalid setup link. Please request a new one.');
      return;
    }

    if (!isFormValid) {
      setError('Please ensure your password meets all requirements and passwords match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await setupPassword({
        token: setupToken,
        password,
        passwordConfirm: confirmPassword,
      });

      setSuccess(true);
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'An error occurred while setting your password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-8 shadow-lg">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="mt-4 text-center font-display text-2xl font-bold text-slate-900">Password Set Successfully!</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Your account has been activated. Redirecting to login...</p>
          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="animate-pulse h-full w-full bg-emerald-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="flex justify-center">
          <div className="rounded-full bg-slate-900 p-3">
            <Lock className="h-6 w-6 text-white" />
          </div>
        </div>

        <h1 className="mt-4 text-center font-display text-2xl font-bold text-slate-900">Set Your Password</h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Welcome! Please set a secure password to activate your account.
        </p>

        {!isSetupTokenValid ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Invalid Setup Link</p>
                <p className="mt-1 text-sm text-red-700">
                  The setup link is missing, malformed, or invalid. Please request a new setup email.
                </p>
              </div>
            </div>
            <Link to="/login" className="mt-4 block rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-red-700">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${password.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className={`text-xs ${password.length >= 6 ? 'text-emerald-700' : 'text-slate-600'}`}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${hasUpperCase ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className={`text-xs ${hasUpperCase ? 'text-emerald-700' : 'text-slate-600'}`}>
                    One uppercase letter (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${hasLowerCase ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className={`text-xs ${hasLowerCase ? 'text-emerald-700' : 'text-slate-600'}`}>
                    One lowercase letter (a-z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className={`text-xs ${hasNumber ? 'text-emerald-700' : 'text-slate-600'}`}>
                    One number (0-9)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${hasSpecialChar ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className={`text-xs ${hasSpecialChar ? 'text-emerald-700' : 'text-slate-600'}`}>
                    One special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Confirm Password</label>
              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
              )}
              {confirmPassword && passwordsMatch && (
                <p className="mt-2 text-xs text-emerald-600">✓ Passwords match</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading || !isSetupTokenValid}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up your password...
                </>
              ) : (
                'Set Password & Activate Account'
              )}
            </button>

            {/* Back to Login Link */}
            <p className="text-center text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
