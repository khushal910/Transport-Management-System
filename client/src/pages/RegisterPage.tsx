import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { register } from '@/api/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    companyName: '', registrationNumber: '', address: '', phone: '', companyEmail: '',
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'manager',
        company: {
          name: form.companyName,
          registrationNumber: form.registrationNumber,
          address: form.address,
          phone: form.phone,
          email: form.companyEmail,
        },
      });
      setSuccess('Registration successful. Please sign in to continue.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information.');
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
            Start managing<br />your fleet today.
          </h1>
          <p className="mt-4 max-w-md text-sidebar-foreground">
            Register your company and get started with vehicle tracking, trip management, and expense optimization.
          </p>
        </div>
        <p className="text-sm text-sidebar-muted">© 2026 FleetFlow. All rights reserved.</p>
      </div>

      {/* Right - Form */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FleetFlow</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Register your company</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create a manager account along with your company</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Manager Details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Raj Kumar" value={form.name} onChange={update('name')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={update('password')} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Company Details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="Raj Logistics Pvt Ltd" value={form.companyName} onChange={update('companyName')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regNum">Registration Number</Label>
                  <Input id="regNum" placeholder="REG-12345" value={form.registrationNumber} onChange={update('registrationNumber')} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Business Park, Delhi" value={form.address} onChange={update('address')} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+91-9876543210" value={form.phone} onChange={update('phone')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input id="companyEmail" type="email" placeholder="info@company.com" value={form.companyEmail} onChange={update('companyEmail')} required />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Company'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
