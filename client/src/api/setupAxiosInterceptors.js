import { toast } from 'react-toastify';
import authBaseURL from './authBaseURL';
import tripBaseURL from './tripBaseURL';
import vehicleBaseURL from './vehicleBaseURL';
import driverBaseURL from './driverBaseURL';
import expenseBaseURL from './expenseBaseURL';
import analyticsBaseURL from './analyticsBaseURL';

// List of all axios instances
const apiInstances = [
  authBaseURL,
  tripBaseURL,
  vehicleBaseURL,
  driverBaseURL,
  expenseBaseURL,
  analyticsBaseURL,
];

// Flag to prevent multiple redirects
let isRedirecting = false;

export const setupAxiosInterceptors = () => {
  apiInstances.forEach((instance) => {
    // Response interceptor for 401 errors (token not found, expired, or invalid)
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized responses (token missing, expired, or invalid)
        if (error.response?.status === 401 && !isRedirecting) {
          isRedirecting = true;

          // Clear stored user data
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('company');

          // Show error message
          toast.error('Session expired or invalid. Please login again.', {
            position: 'top-right',
            autoClose: 3000,
          });

          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
            isRedirecting = false;
          }, 500);
        }

        return Promise.reject(error);
      }
    );
  });
};

