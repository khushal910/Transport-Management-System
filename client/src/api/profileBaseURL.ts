import axios from 'axios';

/**
 * Axios instance for User Profile API
 * Handles all profile-related API calls
 */
const profileBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
  withCredentials: true,
});

/**
 * User Profile Data Types
 */
interface PersonalDetails {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'driver' | 'dispatcher' | 'safety_officer' | 'financial_analyst';
  isPasswordSet: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanyDetails {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

interface DriverDetails {
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategory: 'truck' | 'van' | 'bike';
  safetyScore: number;
  status: string;
  assignedTrips: number;
  completedTrips: number;
  completionRate: number;
}

export interface UserProfile {
  personal: PersonalDetails;
  company: CompanyDetails | null;
  driver?: DriverDetails;
}

export interface UpdateUserProfilePayload {
  name?: string;
  email?: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface TeamEmployee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface SendUserEmailPayload {
  recipientUserId?: string;
  subject: string;
  message: string;
}

/**
 * Fetch current user's profile with personal, company, and driver details (if applicable)
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await profileBaseURL.get('/profile');
    return response.data?.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch profile';
    console.error('Error fetching user profile:', errorMessage);
    throw error;
  }
};

export const updateUserProfile = async (
  payload: UpdateUserProfilePayload
): Promise<UserProfile> => {
  try {
    const response = await profileBaseURL.put('/profile', payload);
    return response.data?.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
    console.error('Error updating user profile:', errorMessage);
    throw error;
  }
};

/**
 * Request email verification OTP for changing email
 * Sends a verification code to the new email address
 */
export const requestEmailVerification = async (newEmail: string): Promise<any> => {
  try {
    const response = await profileBaseURL.post('/request-email-verification', { newEmail });
    return response.data?.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to request verification';
    console.error('Error requesting email verification:', errorMessage);
    throw error;
  }
};

/**
 * Verify email change with OTP token
 * Updates the user's email after OTP verification
 */
export const verifyEmailChange = async (verificationToken: string): Promise<UserProfile> => {
  try {
    const response = await profileBaseURL.post('/verify-email-change', { verificationToken });
    return response.data?.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to verify email change';
    console.error('Error verifying email change:', errorMessage);
    throw error;
  }
};

export const fetchCompanyEmployees = async (): Promise<TeamEmployee[]> => {
  try {
    const response = await profileBaseURL.get('/employees');
    const employees = response.data?.data?.employees || [];
    return employees.map((employee: any) => ({
      id: employee._id || employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch employees';
    console.error('Error fetching employees:', errorMessage);
    throw error;
  }
};

export const sendUserEmail = async (
  payload: SendUserEmailPayload
): Promise<void> => {
  try {
    await profileBaseURL.post('/send-email', payload);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to send email';
    console.error('Error sending user email:', errorMessage);
    throw error;
  }
};

/**
 * Update company information (Manager only)
 * Allows managers to edit their company's details
 */
export const updateCompanyProfile = async (
  payload: UpdateCompanyPayload
): Promise<CompanyDetails> => {
  try {
    const response = await profileBaseURL.put('/company', payload);
    return response.data?.data?.company;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update company information';
    console.error('Error updating company profile:', errorMessage);
    throw error;
  }
};

export default profileBaseURL;
