import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { requestPasswordResetOTP } from '@/api/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      await requestPasswordResetOTP({ email });
      setStep('success');
      sessionStorage.setItem('password-reset-email', email.trim());

      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password', { state: { email: email.trim() } });
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset code. Please try again.');
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
            Reset your password<br />securely.
          </h1>
          <p className="mt-4 max-w-md text-sidebar-foreground">
            We'll send you a password reset code to your email. Follow the steps to create a new password.
          </p>
        </div>
        <p className="text-sm text-sidebar-muted">© 2026 FleetFlow. All rights reserved.</p>
      </div>

      {/* Right - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FleetFlow</span>
          </div>

          {step === 'success' ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-center">Code sent</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  We've sent a password reset code to <strong>{email}</strong>. Check your inbox to continue.
                </p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <p>The reset code will expire in 15 minutes.</p>
              </div>
              <p className="text-center text-xs text-muted-foreground pt-2">
                Redirecting to reset page in 2 seconds...
              </p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold">Forgot your password?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your email and we'll send you a code to reset your password.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the email address associated with your FleetFlow account.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !email}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset code...
                    </>
                  ) : (
                    'Send reset code'
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in instead
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
