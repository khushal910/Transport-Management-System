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

export default profileBaseURL;
