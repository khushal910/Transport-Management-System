import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authBaseURL from '../../api/authBaseURL';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Register() {
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      role: registrationData.role,
    };

    try {
      const response = await authBaseURL.post('/register', data);

      if (response.status == 201) {
        toast.success(response.data?.message);
        navigate('/login', {
          state: {
            email: registrationData.email,
          },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Register</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          className="w-full border p-2 rounded"
          value={registrationData.name}
          onChange={(e) =>
            setRegistrationData({ ...registrationData, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={registrationData.email}
          onChange={(e) =>
            setRegistrationData({
              ...registrationData,
              email: e.target.value,
            })
          }
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full border p-2 pr-10 rounded"
            value={registrationData.password}
            onChange={(e) =>
              setRegistrationData({
                ...registrationData,
                password: e.target.value,
              })
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

        <select
          className="w-full border p-2 rounded"
          value={registrationData.role}
          onChange={(e) =>
            setRegistrationData({ ...registrationData, role: e.target.value })
          }
        >
          <option value="">Select Role</option>
          <option value="manager">Manager</option>
          <option value="driver">Driver</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="safety_officer">Safety Officer</option>
          <option value="financial_analyst">Financial Analyst</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Register
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </p>
    </div>
  );
}
