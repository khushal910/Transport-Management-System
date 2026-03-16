import { useState } from 'react';
import authBaseURL from '../../api/authBaseURL';
import { toast } from 'react-toastify';

export default function AddEmployee() {
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'driver',
  });

  const [isLoading, setIsLoading] = useState(false);

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
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
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
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={employeeData.email}
            onChange={handleChange}
            placeholder="Employee Email"
            className="w-full border border-gray-300 p-2 rounded mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={employeeData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border border-gray-300 p-2 rounded mt-1"
            required
            minLength="6"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
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
