import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Eye, EyeOff, CheckCircle, AlertCircle, X, Clock } from 'lucide-react';
import { verifyPasswordResetOTP } from '@/api/auth';

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'otp' | 'password' | 'success'>('otp');
  
  // OTP Step
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Password Step
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { label: 'At least 8 characters', regex: /.{8,}/, met: false },
    { label: 'Contains uppercase letter (A-Z)', regex: /[A-Z]/, met: false },
    { label: 'Contains lowercase letter (a-z)', regex: /[a-z]/, met: false },
    { label: 'Contains number (0-9)', regex: /[0-9]/, met: false },
    { label: 'Contains special character (!@#$%^&*)', regex: /[!@#$%^&*]/, met: false },
  ]);

  // Resend timer effect
  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Update password requirements
  useEffect(() => {
    const updatedRequirements = requirements.map((req) => ({
      ...req,
      met: req.regex.test(password),
    }));
    setRequirements(updatedRequirements);
  }, [password]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpLoading(true);

    try {
      if (!email.trim()) {
        setOtpError('Email is required');
        setOtpLoading(false);
        return;
      }

      if (!otp.trim() || otp.length !== 6) {
        setOtpError('Please enter a 6-digit code');
        setOtpLoading(false);
        return;
      }

      // Validate it's numeric
      if (!/^\d{6}$/.test(otp)) {
        setOtpError('Reset code must be 6 digits');
        setOtpLoading(false);
        return;
      }

      // Move to password step (don't call API yet - we'll do it on final submit)
      setStep('password');
    } catch (err: any) {
      setOtpError(err?.message || 'Invalid reset code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Would call requestPasswordResetOTP if backend supports it
    setResendTimer(60);
    setCanResend(false);
  };

  const allRequirementsMet = requirements.every((req) => req.met);
  const passwordsMatch = password === passwordConfirm && password.length > 0;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordLoading(true);

    try {
      if (!allRequirementsMet) {
        setPasswordError('Password does not meet all requirements');
        setPasswordLoading(false);
        return;
      }

      if (!passwordsMatch) {
        setPasswordError('Passwords do not match');
        setPasswordLoading(false);
        return;
      }

      await verifyPasswordResetOTP({
        email: email.trim(),
        otp: otp.trim(),
        password,
        passwordConfirm,
      });

      setStep('success');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setPasswordLoading(false);
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
            {step === 'otp' && 'Enter the code sent to your email to verify your identity.'}
            {step === 'password' && 'Create a new strong password for your account.'}
            {step === 'success' && 'Your password has been reset successfully.'}
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
            ← Back to login
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
                <h2 className="text-2xl font-bold text-center">Password reset</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <p>Redirecting to login in 3 seconds...</p>
              </div>
            </div>
          ) : step === 'otp' ? (
            <>
              <div>
                <h2 className="text-2xl font-bold">Enter reset code</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We've sent a 6-digit code to your email. Enter it below.
                </p>
              </div>

              {otpError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">Reset code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                    maxLength={6}
                    disabled={otpLoading}
                    required
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code from your email. Code expires in 15 minutes.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={otpLoading || !email || otp.length !== 6}>
                  {otpLoading ? 'Verifying...' : 'Verify code'}
                </Button>
              </form>

              <div className="text-center text-sm">
                {!canResend && resendTimer > 0 ? (
                  <p className="text-muted-foreground flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Resend in {resendTimer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-primary hover:underline font-medium"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold">Create new password</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a strong password that meets all the requirements.
                </p>
              </div>

              {passwordError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={passwordLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
                  <div className="space-y-1">
                    {requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-colors ${
                          req.met
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      >
                        {req.met ? (
                          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="passwordConfirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={passwordLoading}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordConfirm && !passwordsMatch && (
                    <p className="text-xs text-red-600">Passwords do not match</p>
                  )}
                  {passwordConfirm && passwordsMatch && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={passwordLoading || !allRequirementsMet || !passwordsMatch}
                >
                  {passwordLoading ? 'Resetting password...' : 'Reset password'}
                </Button>
              </form>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setOtp('');
                  setPassword('');
                  setPasswordConfirm('');
                  setStep('otp');
                }}
              >
                ← Back to verify code
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
