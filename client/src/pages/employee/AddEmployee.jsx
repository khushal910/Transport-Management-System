import { useState } from 'react';
import authBaseURL from '../../api/authBaseURL';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AddEmployee() {
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'driver',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authBaseURL.post('/add-employee', employeeData);
      if (response.status === 201) {
        toast.success(response.data.message);
        setEmployeeData({
          name: '',
          email: '',
          password: '',
          role: 'driver',
        });
      }
    } catch (error) {
      console.error('Failed to add employee:', error.message);
      toast.error(error.response?.data?.message || 'Failed to add employee');    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add Employee</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={employeeData.name}
            onChange={handleChange}
            placeholder="Employee Name"
            className="w-full border border-gray-300 p-2 rounded mt-1"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={employeeData.email}
            onChange={handleChange}
            placeholder="Employee Email"
            className="w-full border border-gray-300 p-2 rounded mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={employeeData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full border border-gray-300 p-2 pr-10 rounded mt-1"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 mt-1"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            id="role"
            value={employeeData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded mt-1"
          >
            <option value="driver">Driver</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="safety_officer">Safety Officer</option>
            <option value="financial_analyst">Financial Analyst</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Adding...' : 'Add Employee'}
        </button>
      </form>
    </div>
  );
}
