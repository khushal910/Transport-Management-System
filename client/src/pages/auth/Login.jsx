import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import authBaseURL from '../../api/authBaseURL';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Login() {
  const location = useLocation();

  const [loginData, setLoginData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = {
      email: loginData.email,
      password: loginData.password,
    };

    try {
      const response = await authBaseURL.post('/login', data);
      if (response.status == 200) {
        toast.success(response.data.message);
      } 
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <form className="space-y-4" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={loginData.email}
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600">
          Register
        </Link>
      </p>
    </div>
  );
}
