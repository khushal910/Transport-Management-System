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
    role: 'manager', // Default to manager
    company: {
      name: '',
      registrationNumber: '',
      address: '',
      phone: '',
      email: '',
    },
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
      company: registrationData.company,
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
      <p className="text-sm text-gray-600 mb-4">
        Currently, only managers can register directly. Other roles will be added by their manager.
      </p>

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

        <div>
          <label className="text-sm text-gray-600">Role: Manager</label>
          <p className="text-xs text-gray-500 mt-1">
            Managers can invite other employees after registration
          </p>
        </div>

        {/* Company Details Section */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3">Company Details</h3>
          
          <input
            placeholder="Company Name"
            className="w-full border p-2 rounded mb-3"
            value={registrationData.company.name}
            onChange={(e) =>
              setRegistrationData({
                ...registrationData,
                company: { ...registrationData.company, name: e.target.value },
              })
            }
          />

          <input
            placeholder="Registration Number"
            className="w-full border p-2 rounded mb-3"
            value={registrationData.company.registrationNumber}
            onChange={(e) =>
              setRegistrationData({
                ...registrationData,
                company: { ...registrationData.company, registrationNumber: e.target.value },
              })
            }
          />

          <input
            placeholder="Company Address"
            className="w-full border p-2 rounded mb-3"
            value={registrationData.company.address}
            onChange={(e) =>
              setRegistrationData({
                ...registrationData,
                company: { ...registrationData.company, address: e.target.value },
              })
            }
          />

          <input
            placeholder="Company Phone"
            className="w-full border p-2 rounded mb-3"
            value={registrationData.company.phone}
            onChange={(e) =>
              setRegistrationData({
                ...registrationData,
                company: { ...registrationData.company, phone: e.target.value },
              })
            }
          />

          <input
            placeholder="Company Email"
            type="email"
            className="w-full border p-2 rounded mb-3"
            value={registrationData.company.email}
            onChange={(e) =>
              setRegistrationData({
                ...registrationData,
                company: { ...registrationData.company, email: e.target.value },
              })
            }
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Register as Manager
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
