import { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Edit3,
  Mail,
  MapPin,
  Phone,
  FileText,
  Award,
  Loader,
  Save,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from '@/components/ui/sonner';
import {
  getProfile,
  updateProfile,
  updateCompany,
  requestEmailVerification,
  verifyEmailChange,
  type UserProfile,
} from '@/api/auth';

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Personal details edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableEmail, setEditableEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Email verification state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState('');
  const [verificationOTP, setVerificationOTP] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [canResendOTP, setCanResendOTP] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  // Company details edit state
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editableCompanyName, setEditableCompanyName] = useState('');
  const [editableCompanyAddress, setEditableCompanyAddress] = useState('');
  const [editableCompanyPhone, setEditableCompanyPhone] = useState('');
  const [editableCompanyEmail, setEditableCompanyEmail] = useState('');
  const [companySaving, setCompanySaving] = useState(false);
  const [companyFormError, setCompanyFormError] = useState<string | null>(null);

  // Load profile on component mount
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfile();
      setProfile(data);

      if (data.personal) {
        setEditableName(data.personal.name);
        setEditableEmail(data.personal.email);
      }
      if (data.company) {
        setEditableCompanyName(data.company.name);
        setEditableCompanyAddress(data.company.address);
        setEditableCompanyPhone(data.company.phone);
        setEditableCompanyEmail(data.company.email);
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && !canResendOTP) {
      setCanResendOTP(true);
    }
  }, [resendTimer, canResendOTP]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsVerifyingEmail(false);
    setFormError(null);
    setOtpError(null);
    setVerificationOTP('');
    if (profile) {
      setEditableName(profile.personal.name);
      setEditableEmail(profile.personal.email);
    }
  };

  const handleSave = async () => {
    if (!editableName.trim()) {
      setFormError('Name is required');
      return;
    }
    if (editableName.trim().length < 3) {
      setFormError('Name must be at least 3 characters');
      return;
    }
    if (!editableEmail.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!editableEmail.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const emailChanged = editableEmail !== profile?.personal.email;

      // Update profile
      await updateProfile({
        name: editableName.trim(),
        email: editableEmail.trim(),
      });

      // If email changed, request verification
      if (emailChanged) {
        try {
          await requestEmailVerification(editableEmail.trim());
          setPendingNewEmail(editableEmail.trim());
          setIsVerifyingEmail(true);
          setCanResendOTP(false);
          setResendTimer(60);
          toast.success('A verification code has been sent to your new email');
        } catch (err: any) {
          const errorMsg = err.response?.data?.message || 'Failed to send verification code';
          setOtpError(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        setIsEditing(false);
        toast.success('Profile updated successfully');
        loadProfile();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!verificationOTP.trim()) {
      setOtpError('Verification code is required');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError(null);
      await verifyEmailChange(verificationOTP.trim());
      toast.success('Email verified successfully');
      setIsEditing(false);
      setIsVerifyingEmail(false);
      setVerificationOTP('');
      loadProfile();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid verification code';
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResendOTP) return;

    try {
      setCanResendOTP(false);
      setResendTimer(60);
      await requestEmailVerification(pendingNewEmail);
      toast.success('Verification code resent');
    } catch (err: any) {
      setCanResendOTP(true);
      const errorMessage = err.response?.data?.message || 'Failed to resend verification code';
      toast.error(errorMessage);
    }
  };

  const handleCancelEmailVerification = () => {
    setIsVerifyingEmail(false);
    setVerificationOTP('');
    setOtpError(null);
    setPendingNewEmail('');
  };

  const handleStartEditCompany = () => {
    setIsEditingCompany(true);
    setCompanyFormError(null);
  };

  const handleCancelEditCompany = () => {
    setIsEditingCompany(false);
    setCompanyFormError(null);
    if (profile?.company) {
      setEditableCompanyName(profile.company.name);
      setEditableCompanyAddress(profile.company.address);
      setEditableCompanyPhone(profile.company.phone);
      setEditableCompanyEmail(profile.company.email);
    }
  };

  const handleSaveCompany = async () => {
    if (!editableCompanyName.trim()) {
      setCompanyFormError('Company name is required');
      return;
    }
    if (!editableCompanyAddress.trim()) {
      setCompanyFormError('Address is required');
      return;
    }
    if (!editableCompanyPhone.trim()) {
      setCompanyFormError('Phone number is required');
      return;
    }
    if (!editableCompanyEmail.trim()) {
      setCompanyFormError('Company email is required');
      return;
    }

    try {
      setCompanySaving(true);
      setCompanyFormError(null);
      await updateCompany({
        name: editableCompanyName.trim(),
        address: editableCompanyAddress.trim(),
        phone: editableCompanyPhone.trim(),
        email: editableCompanyEmail.trim(),
      });
      toast.success('Company information updated successfully');
      setIsEditingCompany(false);
      loadProfile();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update company';
      setCompanyFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCompanySaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-description">View and manage your personal and company details</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="kpi-card animate-pulse h-40 bg-muted" />
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-description">View and manage your personal and company details</p>
          </div>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Failed to Load Profile</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
            <button
              onClick={loadProfile}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!profile || !profile.personal) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-description">View and manage your personal and company details</p>
          </div>
          <div className="rounded-lg border border-muted-foreground/30 bg-muted p-8 text-center">
            <p className="text-fg mb-4">No profile data available</p>
            <button
              onClick={loadProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-fg rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload
            </button>
          </div>
        </div>
      );
    }

    const { personal, company, driver } = profile;
    const initials = (personal?.name || 'U')
      .split(' ')
      .map((segment) => segment.charAt(0))
      .join('')
      .toUpperCase();

    const roleConfig = {
      manager: { icon: '👑', label: 'Manager', badge: 'bg-purple-100 text-purple-800' },
      driver: { icon: '🚗', label: 'Driver', badge: 'bg-blue-100 text-blue-800' },
      dispatcher: { icon: '🚚', label: 'Dispatcher', badge: 'bg-orange-100 text-orange-800' },
      safety_officer: { icon: '🛡️', label: 'Safety Officer', badge: 'bg-red-100 text-red-800' },
      financial_analyst: { icon: '📊', label: 'Financial Analyst', badge: 'bg-green-100 text-green-800' },
      admin: { icon: '⚙️', label: 'Admin', badge: 'bg-gray-100 text-gray-800' },
    } as const;

    const currentRole = roleConfig[personal.role as keyof typeof roleConfig];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-description">View and manage your personal and company details</p>
        </div>

        {/* Profile Header Card */}
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-start pb-6 border-b border-border">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-4xl font-bold text-primary-fg shadow-md flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{personal.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {personal.email}
                  </p>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm ${currentRole?.badge || 'bg-muted text-fg'}`}>
                  <span>{currentRole?.icon || '👤'}</span>
                  <span>{currentRole?.label || 'User'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Personal Details</h3>
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-fg rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : null}
          </div>

          {formError ? (
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  placeholder="Full name"
                />
              ) : (
                <p className="text-fg font-medium">{personal.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Email Address</label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    placeholder="Email address"
                  />
                  {editableEmail !== personal.email && !isVerifyingEmail ? (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Verification will be required when changing email.
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-fg font-medium">{personal.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Role</label>
              <p className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${currentRole?.badge || 'bg-muted text-fg'}`}>
                <span>{currentRole?.icon || '👤'}</span>
                {currentRole?.label || 'User'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Account Status</label>
              <p className="text-sm font-semibold text-green-600">✓ Active</p>
            </div>
          </div>

          {isEditing && !isVerifyingEmail ? (
            <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-border">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-fg hover:bg-muted transition"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          ) : null}
        </div>

        {/* Company Information Section */}
        {company ? (
          <div className="card">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
              {personal.role === 'manager' && !isEditingCompany ? (
                <button
                  onClick={handleStartEditCompany}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-fg rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : null}
            </div>

            {companyFormError ? (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {companyFormError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Company Name</label>
                {isEditingCompany ? (
                  <input
                    value={editableCompanyName}
                    onChange={(e) => setEditableCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                ) : (
                  <p className="text-fg font-medium">{company.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Registration Number</label>
                {isEditingCompany ? (
                  <input
                    value={editableCompanyName}
                    onChange={(e) => setEditableCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                ) : (
                  <p className="text-fg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {company.registrationNumber}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Address</label>
                {isEditingCompany ? (
                  <input
                    value={editableCompanyAddress}
                    onChange={(e) => setEditableCompanyAddress(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                ) : (
                  <p className="text-fg flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {company.address}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Phone Number</label>
                {isEditingCompany ? (
                  <input
                    value={editableCompanyPhone}
                    onChange={(e) => setEditableCompanyPhone(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                ) : (
                  <p className="text-fg flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {company.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Email Address</label>
                {isEditingCompany ? (
                  <input
                    type="email"
                    value={editableCompanyEmail}
                    onChange={(e) => setEditableCompanyEmail(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                ) : (
                  <p className="text-fg flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {company.email}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                <p className={`inline-flex items-center gap-1 text-sm font-semibold ${company.status === 'active' ? 'text-green-600' : 'text-destructive'}`}>
                  {company.status === 'active' ? '✓ Active' : '✗ Inactive'}
                </p>
              </div>
            </div>

            {isEditingCompany ? (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <button
                  onClick={handleSaveCompany}
                  disabled={companySaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Save className="w-4 h-4" />
                  {companySaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancelEditCompany}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-fg hover:bg-muted transition"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Driver Credentials Section */}
        {driver ? (
          <div className="card">
            <h3 className="text-lg font-semibold text-foreground mb-6">Driver Credentials & Performance</h3>
            
            {/* License Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-border">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs font-medium text-muted-foreground mb-1">License Number</p>
                <p className="text-fg font-semibold">{driver.licenseNumber}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs font-medium text-muted-foreground mb-1">License Category</p>
                <p className="text-fg font-semibold uppercase">{driver.licenseCategory}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs font-medium text-muted-foreground mb-1">License Expiry</p>
                <p className="text-fg font-semibold">{new Date(driver.licenseExpiry).toLocaleDateString()}</p>
                {new Date(driver.licenseExpiry) < new Date() ? (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Expired
                  </p>
                ) : null}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs font-medium text-muted-foreground mb-2">Safety Score</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <p className="text-2xl font-bold text-fg">{driver.safetyScore}</p>
                  <p className="text-sm text-muted-foreground">/100</p>
                </div>
                <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${driver.safetyScore >= 80 ? 'bg-green-500' : driver.safetyScore >= 60 ? 'bg-yellow-500' : 'bg-destructive'}`}
                    style={{ width: `${driver.safetyScore}%` }}
                  />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs font-medium text-muted-foreground mb-2">Completion Rate</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <p className="text-2xl font-bold text-fg">{driver.completionRate}</p>
                  <p className="text-sm text-muted-foreground">%</p>
                </div>
                <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${driver.completionRate}%` }} />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Trip Statistics
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Assigned: <span className="font-semibold text-fg">{driver.assignedTrips}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Completed: <span className="font-semibold text-green-600">{driver.completedTrips}</span>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return <DashboardLayout>{renderContent()}</DashboardLayout>;
}
