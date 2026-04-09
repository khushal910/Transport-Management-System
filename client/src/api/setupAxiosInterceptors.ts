// Notification handling moved to components using useNotification hook
import authBaseURL from './authBaseURL';
import tripBaseURL from './tripBaseURL';
import vehicleBaseURL from './vehicleBaseURL';
import driverBaseURL from './driverBaseURL';
import driverStatusBaseURL from './driverStatusBaseURL';
import expenseBaseURL from './expenseBaseURL';
import analyticsBaseURL from './analyticsBaseURL';
import gpsBaseURL from './gpsBaseURL';
import safetyBaseURL from './safetyBaseURL';
import dashboardBaseURL from './dashboardBaseURL';
import profileBaseURL from './profileBaseURL';

// List of all axios instances
const apiInstances = [
  authBaseURL,
  tripBaseURL,
  vehicleBaseURL,
  driverBaseURL,
  driverStatusBaseURL,
  expenseBaseURL,
  analyticsBaseURL,
  gpsBaseURL,
  safetyBaseURL,
  dashboardBaseURL,
  profileBaseURL,
];

// Flag to prevent multiple redirects
let isRedirecting = false;

export const setupAxiosInterceptors = () => {
  apiInstances.forEach((instance) => {
    // Request interceptor - cookie is sent automatically with withCredentials: true
    instance.interceptors.request.use(
      (config) => {
        // No need to manually add token - httpOnly cookie is sent automatically
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for 401 errors (token not found, expired, or invalid)
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized responses (token missing, expired, invalid, or deleted account)
        if (error.response?.status === 401 && !isRedirecting) {
          isRedirecting = true;

          const message =
            error.response?.data?.message ||
            'Your account no longer exists or your session is invalid. Please return to the landing page.';

          localStorage.setItem('authRedirectMessage', message);
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('company');

          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        }

        return Promise.reject(error);
      }
    );
  });
};

