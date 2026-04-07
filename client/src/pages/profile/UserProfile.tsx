import React, { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { fetchUserProfile, updateUserProfile, UpdateUserProfilePayload, UserProfile } from '../../api/profileBaseURL';
import { Mail, Phone, MapPin, FileText, Award, CheckCircle, AlertCircle, RefreshCw, Edit3, Save, XCircle } from 'lucide-react';

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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserProfile();
      setProfile(data);
      setEditableName(data.personal.name);
      setEditableEmail(data.personal.email);
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

    const updatePayload: UpdateUserProfilePayload = {
      name: trimmedName,
      email: trimmedEmail,
    };

    try {
      setSaving(true);
      setFormError(null);
      const updatedProfile = await updateUserProfile(updatePayload);
      setProfile(updatedProfile);
      setIsEditing(false);
      notifySuccess('Profile updated successfully.');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to update profile';
      setFormError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setSaving(false);
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
                <input
                  type="email"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Email address"
                />
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
          {isEditing ? (
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏢</span>
                Company Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <p className="text-gray-900 font-semibold">{company.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {company.registrationNumber}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {company.address}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {company.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {company.email}
                    </p>
                  </div>
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
