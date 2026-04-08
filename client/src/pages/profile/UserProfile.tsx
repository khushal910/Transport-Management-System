import React, { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { fetchUserProfile, updateUserProfile, UpdateUserProfilePayload, UserProfile, requestEmailVerification, verifyEmailChange, updateCompanyProfile, UpdateCompanyPayload } from '../../api/profileBaseURL';
import { Mail, Phone, MapPin, FileText, Award, CheckCircle, AlertCircle, RefreshCw, Edit3, Save, XCircle, AlertTriangle, Loader } from 'lucide-react';

/**
 * User Profile Page - Production Grade
 * Displays comprehensive personal, company, and driver-specific details
 */
export const UserProfilePage: React.FC = () => {
  const { notifyError, notifySuccess } = useNotification();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableEmail, setEditableEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Email verification OTP states
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState<string | null>(null);
  const [verificationOTP, setVerificationOTP] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResendCode, setCanResendCode] = useState(true);

  // Company editing states (Manager only)
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editableCompanyName, setEditableCompanyName] = useState('');
  const [editableCompanyAddress, setEditableCompanyAddress] = useState('');
  const [editableCompanyPhone, setEditableCompanyPhone] = useState('');
  const [editableCompanyEmail, setEditableCompanyEmail] = useState('');
  const [companySaving, setCompanySaving] = useState(false);
  const [companyFormError, setCompanyFormError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  // Timer effect for resend code button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && !canResendCode) {
      setCanResendCode(true);
    }
  }, [resendTimer, canResendCode]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserProfile();
      setProfile(data);
      setEditableName(data.personal.name);
      setEditableEmail(data.personal.email);
      
      // Initialize company fields if available
      if (data.company) {
        setEditableCompanyName(data.company.name);
        setEditableCompanyAddress(data.company.address);
        setEditableCompanyPhone(data.company.phone);
        setEditableCompanyEmail(data.company.email);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to load profile';
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (profile) {
      setEditableName(profile.personal.name);
      setEditableEmail(profile.personal.email);
      setFormError(null);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditableName(profile.personal.name);
      setEditableEmail(profile.personal.email);
    }
    setFormError(null);
    setIsEditing(false);
    setIsVerifyingEmail(false);
    setPendingNewEmail(null);
    setVerificationOTP('');
    setOtpError(null);
  };

  const handleSave = async () => {
    const trimmedName = editableName.trim();
    const trimmedEmail = editableEmail.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 3) {
      setFormError('Name must be at least 3 characters long.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!profile) {
      setFormError('Unable to save changes at this time.');
      return;
    }

    // Check if email is changing
    const emailChanged = trimmedEmail !== profile.personal.email;

    try {
      setSaving(true);
      setFormError(null);

      if (emailChanged) {
        // If email is changing, request OTP verification instead of direct save
        // This will throw an error if email already exists
        try {
          await requestEmailVerification(trimmedEmail);
          setPendingNewEmail(trimmedEmail);
          setIsVerifyingEmail(true);
          setCanResendCode(false);
          setResendTimer(60); // 1 minute countdown
          notifySuccess('Verification code sent to your new email. Please check your inbox.');
        } catch (emailErr: any) {
          const errorMsg = emailErr.response?.data?.message || emailErr.message || 'Failed to request verification';
          setFormError(errorMsg);
          notifyError(errorMsg);
          setSaving(false);
          return;
        }
      } else {
        // If only name is changing, update directly
        const updatePayload: UpdateUserProfilePayload = {
          name: trimmedName,
        };
        const updatedProfile = await updateUserProfile(updatePayload);
        setProfile(updatedProfile);
        setIsEditing(false);
        notifySuccess('Profile updated successfully.');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to save changes';
      setFormError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!verificationOTP.trim()) {
      setOtpError('Please enter the verification code.');
      return;
    }

    const trimmedName = editableName.trim();

    try {
      setOtpError(null);
      setOtpLoading(true);

      // Verify email change with OTP
      const updatedProfile = await verifyEmailChange(verificationOTP);

      // Update name if it changed as well
      if (updatedProfile && trimmedName !== profile?.personal.name) {
        const nameUpdatePayload: UpdateUserProfilePayload = {
          name: trimmedName,
        };
        const finalProfile = await updateUserProfile(nameUpdatePayload);
        setProfile(finalProfile);
      } else {
        setProfile(updatedProfile);
      }

      setIsEditing(false);
      setIsVerifyingEmail(false);
      setPendingNewEmail(null);
      setVerificationOTP('');
      notifySuccess('Email verified and profile updated successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to verify code';
      setOtpError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCancelEmailVerification = () => {
    setIsVerifyingEmail(false);
    setPendingNewEmail(null);
    setVerificationOTP('');
    setOtpError(null);
    setResendTimer(0);
    setCanResendCode(true);
  };

  const handleStartEditCompany = () => {
    if (profile?.company) {
      setEditableCompanyName(profile.company.name);
      setEditableCompanyAddress(profile.company.address);
      setEditableCompanyPhone(profile.company.phone);
      setEditableCompanyEmail(profile.company.email);
      setCompanyFormError(null);
      setIsEditingCompany(true);
    }
  };

  const handleCancelEditCompany = () => {
    if (profile?.company) {
      setEditableCompanyName(profile.company.name);
      setEditableCompanyAddress(profile.company.address);
      setEditableCompanyPhone(profile.company.phone);
      setEditableCompanyEmail(profile.company.email);
    }
    setCompanyFormError(null);
    setIsEditingCompany(false);
  };

  const handleSaveCompany = async () => {
    const trimmedName = editableCompanyName.trim();
    const trimmedAddress = editableCompanyAddress.trim();
    const trimmedPhone = editableCompanyPhone.trim();
    const trimmedEmail = editableCompanyEmail.trim().toLowerCase();

    // Validation
    if (!trimmedName || trimmedName.length < 3) {
      setCompanyFormError('Company name must be at least 3 characters long.');
      return;
    }

    if (!trimmedAddress || trimmedAddress.length < 5) {
      setCompanyFormError('Address must be at least 5 characters long.');
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 7) {
      setCompanyFormError('Phone number must be at least 7 characters long.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setCompanyFormError('Please enter a valid email address.');
      return;
    }

    if (!profile?.company) {
      setCompanyFormError('Company information not found.');
      return;
    }

    try {
      setCompanySaving(true);
      setCompanyFormError(null);

      // Prepare update payload with only changed fields
      const updatePayload: UpdateCompanyPayload = {};
      
      if (trimmedName !== profile.company.name) {
        updatePayload.name = trimmedName;
      }
      if (trimmedAddress !== profile.company.address) {
        updatePayload.address = trimmedAddress;
      }
      if (trimmedPhone !== profile.company.phone) {
        updatePayload.phone = trimmedPhone;
      }
      if (trimmedEmail !== profile.company.email) {
        updatePayload.email = trimmedEmail;
      }

      // Only call API if there are changes
      if (Object.keys(updatePayload).length === 0) {
        setCompanyFormError('No changes made.');
        return;
      }

      const updatedCompany = await updateCompanyProfile(updatePayload);
      
      // Update profile with new company data
      setProfile(prev => prev ? {
        ...prev,
        company: updatedCompany
      } : null);

      setIsEditingCompany(false);
      notifySuccess('Company information updated successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update company';
      setCompanyFormError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setCompanySaving(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingNewEmail) return;
    
    try {
      setOtpError(null);
      setOtpLoading(true);
      await requestEmailVerification(pendingNewEmail);
      setCanResendCode(false);
      setResendTimer(60);
      notifySuccess('Verification code resent to your email.');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resend code';
      setOtpError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRetry = () => {
    loadProfile();
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="h-4 w-72 bg-gray-300 rounded animate-pulse" />
          </div>

          {/* Profile Card Skeleton */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-32 h-32 bg-gray-300 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse mb-3" />
                <div className="h-4 w-64 bg-gray-300 rounded animate-pulse mb-2" />
                <div className="h-4 w-40 bg-gray-300 rounded animate-pulse" />
              </div>
            </div>

            {/* Section Skeleton */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-6">
                <div className="h-5 w-32 bg-gray-300 rounded animate-pulse mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-x-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 mb-8">View your personal, company, and account details</p>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-semibold text-gray-900">Failed to Load Profile</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State (shouldn't happen, but just in case)
  if (!profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No profile data available</p>
            <button
              onClick={handleRetry}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { personal, company, driver } = profile;
  const initials = personal.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();

  const roleConfig = {
    manager: { icon: '👑', label: 'Manager', color: 'bg-purple-100 text-purple-800' },
    driver: { icon: '🚗', label: 'Driver', color: 'bg-blue-100 text-blue-800' },
    dispatcher: { icon: '🚚', label: 'Dispatcher', color: 'bg-orange-100 text-orange-800' },
    safety_officer: { icon: '🛡️', label: 'Safety Officer', color: 'bg-red-100 text-red-800' },
    financial_analyst: { icon: '📊', label: 'Financial Analyst', color: 'bg-green-100 text-green-800' },
  };

  const role = roleConfig[personal.role as keyof typeof roleConfig];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View your personal, company, and account details</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Profile Header with Avatar */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200">
            {/* Avatar */}
            <div className="w-32 h-32 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-5xl font-bold text-white shadow-md">
              {initials}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{personal.name}</h2>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {personal.email}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${role.color}`}>
                  <span>{role.icon}</span>
                  <span>{role.label}</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>Account created on {new Date(personal.createdAt).toLocaleDateString()}</p>
                {personal.isPasswordSet ? (
                  <p className="text-green-600 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-4 h-4" />
                    Password set
                  </p>
                ) : (
                  <p className="text-amber-600">Password not set</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>👤</span>
              Personal Details
            </h3>
            <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span>👤</span>
              Personal Details
            </div>
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : null}
          </div>
          {formError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Full name"
                />
              ) : (
                <p className="text-gray-900">{personal.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Email address"
                  />
                  {editableEmail !== personal.email && !isVerifyingEmail && (
                    <p className="text-xs text-amber-600 mt-1">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      A verification code will be sent to your new email
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{personal.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <p className="text-gray-900">{role.label}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <p className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Active
              </p>
            </div>
          </div>

          {/* Email Verification OTP Section */}
          {isVerifyingEmail && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-1">Verify Your New Email</h4>
                  <p className="text-sm text-amber-800 mb-3">
                    We've sent a verification code to <strong>{pendingNewEmail}</strong>. Please enter it below to confirm the email change.
                  </p>
                </div>
              </div>

              {otpError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {otpError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={verificationOTP}
                  onChange={(e) => setVerificationOTP(e.target.value)}
                  placeholder="Enter 6-character code or full verification token"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500 font-mono text-center"
                />
                <p className="text-xs text-gray-500 mt-1">Check your email for the verification code</p>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  Didn't receive the code?
                </p>
                {!canResendCode ? (
                  <p className="text-xs font-medium text-amber-600">
                    Resend in {resendTimer}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendCode}
                    disabled={otpLoading || !canResendCode}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleVerifyEmailChange}
                  disabled={otpLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-200"
                >
                  {otpLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verify Code
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEmailVerification}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors duration-200"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isEditing && !isVerifyingEmail ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-200"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors duration-200"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          ) : null}
          </div>

          {/* Company Details Section */}
          {company && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>🏢</span>
                  Company Information
                </h3>
                {profile?.personal.role === 'manager' && !isEditingCompany ? (
                  <button
                    onClick={handleStartEditCompany}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                ) : null}
              </div>

              {companyFormError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {companyFormError}
                </div>
              ) : null}

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="text"
                        value={editableCompanyName}
                        onChange={(e) => setEditableCompanyName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Company name"
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold">{company.name}</p>
                    )}
                  </div>

                  {/* Registration Number (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {company.registrationNumber}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    {isEditingCompany ? (
                      <input
                        type="text"
                        value={editableCompanyAddress}
                        onChange={(e) => setEditableCompanyAddress(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Company address"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {company.address}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="tel"
                        value={editableCompanyPhone}
                        onChange={(e) => setEditableCompanyPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Phone number"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {company.phone}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="email"
                        value={editableCompanyEmail}
                        onChange={(e) => setEditableCompanyEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Company email"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {company.email}
                      </p>
                    )}
                  </div>

                  {/* Status (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <p className={`font-semibold ${
                      company.status === 'active'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {company.status === 'active' ? '✓ Active' : '✗ Inactive'}
                    </p>
                  </div>
                </div>

                {/* Save/Cancel buttons for company editing */}
                {isEditingCompany && profile?.personal.role === 'manager' ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={handleSaveCompany}
                      disabled={companySaving}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-200"
                    >
                      <Save className="w-4 h-4" />
                      {companySaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEditCompany}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors duration-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Driver-Specific Details */}
          {driver && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🚗</span>
                Driver Credentials & Performance
              </h3>
              <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* License Information */}
                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <p className="text-gray-900 font-semibold text-lg">{driver.licenseNumber}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Category
                    </label>
                    <p className="text-gray-900 font-semibold text-lg capitalize">
                      {driver.licenseCategory}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Expiry
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {new Date(driver.licenseExpiry).toLocaleDateString()}
                    </p>
                    {new Date(driver.licenseExpiry) < new Date() && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Expired
                      </p>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Safety Score
                    </label>
                    <div className="flex items-end gap-2">
                      <p className="text-gray-900 font-semibold text-2xl">{driver.safetyScore}</p>
                      <p className="text-gray-500 text-sm">/100</p>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          driver.safetyScore >= 80
                            ? 'bg-green-500'
                            : driver.safetyScore >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${driver.safetyScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Rate
                    </label>
                    <div className="flex items-end gap-2">
                      <p className="text-gray-900 font-semibold text-2xl">{driver.completionRate}</p>
                      <p className="text-gray-500 text-sm">%</p>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${driver.completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Award className="w-4 h-4 inline mr-1" />
                      Trip Statistics
                    </label>
                    <p className="text-gray-900 font-semibold text-xs">
                      Completed: <span className="text-green-600">{driver.completedTrips}</span>
                    </p>
                    <p className="text-gray-900 font-semibold text-xs">
                      Assigned: <span className="text-blue-600">{driver.assignedTrips}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
