import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authBaseURL from '../../api/authBaseURL';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useFormNavigation } from '../../hooks/useFormNavigation';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if user is already logged in
  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/main/dashboard');
    }
  }, [navigate]);

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    const data = {
      email: loginData.email,
      password: loginData.password,
    };

    try {
      const response = await authBaseURL.post('/login', data);
      if (response.status == 200) {
        // Extract and validate user data
        const userData = response.data.data;
        if (!userData) {
          toast.error('Invalid response from server');
          setIsLoading(false);
          return;
        }

        // Store user information
        localStorage.setItem('user', JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          companyId: userData.companyId,
        }));
        
        // Store company information in localStorage
        if (userData.company) {
          localStorage.setItem('company', JSON.stringify(userData.company));
        }

        // Store authentication token if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }

        toast.success(response.data.message);
        setIsLoading(false);
        navigate('/main/dashboard');
      } 
    } catch (error) {
      console.error(error);
      // Clear localStorage on failed login
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('company');
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  // Use the form navigation hook (must be after handleLogin is defined)
  const { inputRefs, handleKeyDown } = useFormNavigation(2, handleLogin);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            placeholder="Email"
            className={`w-full border p-2 rounded ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            value={loginData.email}
            ref={(el) => (inputRefs.current[0] = el)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            onChange={(e) => {
              setLoginData({ ...loginData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className={`w-full border p-2 pr-10 rounded ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={loginData.password}
              ref={(el) => (inputRefs.current[1] = el)}
              onKeyDown={(e) => handleKeyDown(e, 1)}
              onChange={(e) => {
                setLoginData({ ...loginData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Link 
            to="/auth/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={(e) => isLoading && e.preventDefault()}
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-2 rounded text-white font-semibold transition-all ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-blue-600 hover:text-blue-700">
          Register
        </Link>
      </p>
    </div>
  );
}
