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

  // Redirect if user is already logged in
  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/main/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
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
        toast.success(response.data.message);
        navigate('/main/dashboard');
      } 
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  // Use the form navigation hook (must be after handleLogin is defined)
  const { inputRefs, handleKeyDown } = useFormNavigation(2, handleLogin);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <form className="space-y-4" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={loginData.email}
          ref={(el) => (inputRefs.current[0] = el)}
          onKeyDown={(e) => handleKeyDown(e, 0)}
          onChange={(e) =>
            setLoginData({ ...loginData, email: e.target.value })
          }
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full border p-2 pr-10 rounded"
            value={loginData.password}
            ref={(el) => (inputRefs.current[1] = el)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-sm">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-blue-600">
          Register
        </Link>
      </p>
    </div>
  );
}
