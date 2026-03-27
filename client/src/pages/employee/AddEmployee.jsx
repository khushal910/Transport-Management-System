import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaEdit, FaTrash } from 'react-icons/fa';
import authBaseURL from '../../api/authBaseURL';
import { useFormNavigation } from '../../hooks/useFormNavigation';

export default function EmployeeManagement() {
  // Employee list from backend
  const [employeeList, setEmployeeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Filter state
  const [filterRole, setFilterRole] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Sort state
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Dropdown refs for outside click handling
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'dispatcher',
    // Driver-specific fields
    licenseNumber: '',
    licenseExpiry: '',
    licenseCategory: '',
  });

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await authBaseURL.get('/employees');
      if (response.status === 200) {
        setEmployeeList(response.data.data.employees);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCloseModal = (event) => {
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!employeeForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (employeeForm.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    if (!employeeForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(employeeForm.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!editingEmployeeId && !employeeForm.password) {
      errors.password = 'Password is required';
    } else if (employeeForm.password && employeeForm.password.length < 2) {
      errors.password = 'Password must be at least 2 characters';
    }

    // Validate driver-specific fields
    if (employeeForm.role === 'driver') {
      if (!employeeForm.licenseNumber.trim()) {
        errors.licenseNumber = 'License number is required';
      } else if (!/^[A-Z0-9]+$/i.test(employeeForm.licenseNumber)) {
        errors.licenseNumber = 'License number must contain only alphanumeric characters';
      }

      if (!employeeForm.licenseExpiry) {
        errors.licenseExpiry = 'License expiry date is required';
      } else {
        const expiryDate = new Date(employeeForm.licenseExpiry);
        if (expiryDate <= new Date()) {
          errors.licenseExpiry = 'License expiry date must be in the future';
        }
      }

      if (!employeeForm.licenseCategory) {
        errors.licenseCategory = 'License category is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterRoleChange = (e) => {
    setFilterRole(e.target.value);
    setCurrentPage(1);
  };

  const handleSortFieldChange = (e) => {
    setSortField(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const clearFilters = () => {
    setFilterRole('');
    setShowFilterMenu(false);
  };

  const clearSort = () => {
    setSortField('');
    setSortOrder('asc');
    setShowSortMenu(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const processEmployeeList = () => {
    let processed = [...employeeList];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      processed = processed.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filterRole) {
      processed = processed.filter((e) => e.role === filterRole);
    }

    // Apply sort
    if (sortField) {
      processed.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processed;
  };

  const resetForm = () => {
    setEmployeeForm({
      name: '',
      email: '',
      password: '',
      role: 'dispatcher',
      licenseNumber: '',
      licenseExpiry: '',
      licenseCategory: '',
    });
    setFormErrors({});
    setShowPassword(false);
  };

  const handleCreateOrUpdateEmployee = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const isUpdate = !!editingEmployeeId;
      const payload = {
        name: employeeForm.name.trim(),
        email: employeeForm.email.trim().toLowerCase(),
        role: employeeForm.role,
      };

      if (employeeForm.password) {
        payload.password = employeeForm.password;
      }

      // Include driver fields if role is driver
      if (employeeForm.role === 'driver') {
        payload.licenseNumber = employeeForm.licenseNumber.trim().toUpperCase();
        payload.licenseExpiry = employeeForm.licenseExpiry;
        payload.licenseCategory = employeeForm.licenseCategory;
      }

      const response = isUpdate
        ? await authBaseURL.put(`/employee/${editingEmployeeId}`, payload)
        : await authBaseURL.post('/add-employee', payload);

      if (!response.data.success) {
        toast.error(response.data?.message || (isUpdate ? 'Update failed' : 'Add failed'));
        return;
      }

      toast.success(response.data?.message || (isUpdate ? 'Employee updated' : 'Employee added'));
      setIsModalOpen(false);
      resetForm();
      setEditingEmployeeId(null);
      fetchEmployees();
    } catch (error) {
      const isUpdate = !!editingEmployeeId;
      toast.error(error.response?.data?.message || (isUpdate ? 'Update failed' : 'Add failed'));
    }
  };

  // Calculate the number of input fields based on role
  // Use the form navigation hook (must be after handleCreateOrUpdateEmployee is defined)
  const inputFieldCount = employeeForm.role === 'driver' ? 5 : 3;
  const { inputRefs, handleKeyDown } = useFormNavigation(inputFieldCount, () => {
    handleCreateOrUpdateEmployee({ preventDefault: () => {} });
  }, isModalOpen);

  const handleEdit = (employee) => {
    setEditingEmployeeId(employee._id);
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      password: '',
      role: employee.role,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await authBaseURL.delete(`/employee/${employeeId}`);
      if (response.status === 200) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      driver: 'bg-blue-100 text-blue-800',
      dispatcher: 'bg-green-100 text-green-800',
      safety_officer: 'bg-yellow-100 text-yellow-800',
      financial_analyst: 'bg-purple-100 text-purple-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const processedEmployees = processEmployeeList();
  const totalPages = Math.ceil(processedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = processedEmployees.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Employee Management</h1>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Add Employee Button */}
          <button
            onClick={() => {
              setEditingEmployeeId(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Employee
          </button>

          {/* Filter Menu */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
            >
              Filter {filterRole && '✓'}
            </button>
            {showFilterMenu && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={filterRole}
                      onChange={handleFilterRoleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Roles</option>
                      <option value="driver">Driver</option>
                      <option value="dispatcher">Dispatcher</option>
                      <option value="safety_officer">Safety Officer</option>
                      <option value="financial_analyst">Financial Analyst</option>
                    </select>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sort Menu */}
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
            >
              Sort {sortField && '✓'}
            </button>
            {showSortMenu && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortField}
                      onChange={handleSortFieldChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">None</option>
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="role">Role</option>
                      <option value="createdAt">Joined Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={handleSortOrderChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={!sortField}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                  <button
                    onClick={clearSort}
                    className="w-full bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Clear Sort
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-gray-600">Loading employees...</div>
        ) : paginatedEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            {employeeList.length === 0 ? 'No employees found. Add one to get started!' : 'No employees match your filters.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((employee) => (
                    <tr key={employee._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{employee.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{employee.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(employee.role)}`}>
                          {employee.role.replaceAll('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-center space-x-2 flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                        >
                          <FaEdit className="text-sm" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                        >
                          <FaTrash className="text-sm" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({processedEmployees.length} total)
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Employee Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingEmployeeId ? 'Edit Employee' : 'Add Employee'}
            </h2>

            <form onSubmit={handleCreateOrUpdateEmployee} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={employeeForm.name}
                  autoComplete="off"
                  onChange={handleFormChange}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  ref={(el) => (inputRefs.current[0] = el)}
                  placeholder="Employee Name"
                  className={`w-full border p-2 rounded mt-1 ${
                    formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={employeeForm.email}
                  autoComplete="off"
                  onChange={handleFormChange}
                  onKeyDown={(e) => handleKeyDown(e, 1)}
                  ref={(el) => (inputRefs.current[1] = el)}
                  placeholder="Employee Email"
                  className={`w-full border p-2 rounded mt-1 ${
                    formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {editingEmployeeId ? 'Password (Leave empty to keep current)' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={employeeForm.password}
                    autoComplete="off"
                    onChange={handleFormChange}
                    onKeyDown={(e) => handleKeyDown(e, 2)}
                    ref={(el) => (inputRefs.current[2] = el)}
                    placeholder={editingEmployeeId ? 'New Password (optional)' : 'Password'}
                    className={`w-full border p-2 pr-10 rounded mt-1 ${
                      formErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required={!editingEmployeeId}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 mt-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  value={employeeForm.role}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 p-2 rounded mt-1"
                >
                  <option value="driver">Driver</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="safety_officer">Safety Officer</option>
                  <option value="financial_analyst">Financial Analyst</option>
                </select>
              </div>

              {/* Driver-specific fields - shown only when role is 'driver' */}
              {employeeForm.role === 'driver' && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Driver Information</p>
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      id="licenseNumber"
                      value={employeeForm.licenseNumber}
                      autoComplete="off"
                      onChange={handleFormChange}
                      onKeyDown={(e) => handleKeyDown(e, 3)}
                      ref={(el) => (inputRefs.current[3] = el)}
                      placeholder="e.g., DL1234567"
                      className={`w-full border p-2 rounded mt-1 ${
                        formErrors.licenseNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required={employeeForm.role === 'driver'}
                    />
                    {formErrors.licenseNumber && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.licenseNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700">
                      License Expiry Date
                    </label>
                    <input
                      type="date"
                      name="licenseExpiry"
                      id="licenseExpiry"
                      value={employeeForm.licenseExpiry}
                      onChange={handleFormChange}
                      onKeyDown={(e) => handleKeyDown(e, 4)}
                      ref={(el) => (inputRefs.current[4] = el)}
                      className={`w-full border p-2 rounded mt-1 ${
                        formErrors.licenseExpiry ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required={employeeForm.role === 'driver'}
                    />
                    {formErrors.licenseExpiry && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.licenseExpiry}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="licenseCategory" className="block text-sm font-medium text-gray-700">
                      License Category
                    </label>
                    <select
                      name="licenseCategory"
                      id="licenseCategory"
                      value={employeeForm.licenseCategory}
                      onChange={handleFormChange}
                      className={`w-full border p-2 rounded mt-1 ${
                        formErrors.licenseCategory ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required={employeeForm.role === 'driver'}
                    >
                      <option value="">Select Category</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="bike">Bike</option>
                    </select>
                    {formErrors.licenseCategory && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.licenseCategory}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEmployeeId(null);
                  }}
                  className="flex-1 bg-gray-400 text-white p-2 rounded font-medium hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700"
                >
                  {editingEmployeeId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
