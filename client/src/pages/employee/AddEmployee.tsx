import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import PaginationContainer from '../../components/PaginationContainer';
import { DEFAULT_PAGE_SIZE } from '../../config/paginationConfig';
import { FaEdit, FaTrash } from 'react-icons/fa';
import authBaseURL from '../../api/authBaseURL';
import { updateDriverStatusAPI } from '../../api/driverStatusBaseURL';
import { useFormNavigation } from '../../hooks/useFormNavigation';

export default function EmployeeManagement() {
  const { notifyError, notifySuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user role to determine read-only mode for dispatcher
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canChangeDriverStatus = ['manager', 'dispatcher'].includes(user?.role);
  const isReadOnly = user?.role === 'dispatcher';
  const isManager = user?.role === 'manager';
  
  // Employee list from backend
  const [employeeList, setEmployeeList] = useState([]);
  const [deletedEmployeeList, setDeletedEmployeeList] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);
  const [recoveringEmployeeId, setRecoveringEmployeeId] = useState(null);
  const [deletedSearchTerm, setDeletedSearchTerm] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Filter state
  const [filterRole, setFilterRole] = useState('');
  const [filterPasswordStatus, setFilterPasswordStatus] = useState('');
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
  const [itemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState<'error' | 'success' | ''>('');

  // Send email modal state
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [selectedEmployeeForEmail, setSelectedEmployeeForEmail] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailFormError, setEmailFormError] = useState('');
  const [emailFormSuccess, setEmailFormSuccess] = useState('');

  // Driver status change modal state
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [driverToChangeStatus, setDriverToChangeStatus] = useState(null);
  const [newDriverStatus, setNewDriverStatus] = useState('');
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState('');
  const [statusChangeSuccess, setStatusChangeSuccess] = useState('');

  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
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
      console.log('[FetchEmployees] Response:', response);
      
      if (response.status === 200 && response.data.success) {
        const employees = response.data.data?.employees || [];
        console.log('[FetchEmployees] Setting employees:', employees);
        setEmployeeList(employees);
      } else {
        console.warn('[FetchEmployees] Unexpected response format:', response.data);
        setEmployeeList([]);
      }
    } catch (error) {
      console.error('[FetchEmployees] Error:', error);
      notifyError(error.response?.data?.message || 'Failed to fetch employees');
      setEmployeeList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch deleted employees (manager only)
  const fetchDeletedEmployees = async () => {
    if (!isManager) return;
    
    try {
      const response = await authBaseURL.get(
        `/employees/deleted?page=1&limit=100&search=${encodeURIComponent(deletedSearchTerm)}`
      );
      if (response.status === 200 && response.data.success) {
        const data = response.data.data || {};
        setDeletedEmployeeList(data.deletedEmployees || []);
      }
    } catch (error) {
      console.error('Fetch deleted employees error:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (activeTab === 'deleted') {
      fetchDeletedEmployees();
    }
  }, [deletedSearchTerm, activeTab]);

  const handleCloseModal = (event) => {
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
      setIsSubmitting(false);
      setFormMessage('');
      setFormMessageType('');
      setFormErrors({});
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

    // Password is set by employee via email, not by manager

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
    if (Object.keys(errors).length > 0) {
      setFormMessage('Please fix the highlighted fields before submitting.');
      setFormMessageType('error');
    }
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (formMessage) {
      setFormMessage('');
      setFormMessageType('');
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

  const handleFilterPasswordStatusChange = (e) => {
    setFilterPasswordStatus(e.target.value);
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
    setFilterPasswordStatus('');
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

    // If viewing driver-registry, show only drivers
    if (location.pathname.includes('driver-registry')) {
      processed = processed.filter((e) => e.role === 'driver');
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      processed = processed.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (filterRole) {
      processed = processed.filter((e) => e.role === filterRole);
    }

    // Apply password status filter
    if (filterPasswordStatus) {
      if (filterPasswordStatus === 'not_ready') {
        processed = processed.filter((e) => !e.isPasswordSet);
      } else if (filterPasswordStatus === 'ready') {
        processed = processed.filter((e) => e.isPasswordSet);
      }
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
      role: 'dispatcher',
      licenseNumber: '',
      licenseExpiry: '',
      licenseCategory: '',
    });
    setFormErrors({});
    setFormMessage('');
    setFormMessageType('');
    setShowPassword(false);
    setIsSubmitting(false);
  };

  const handleCreateOrUpdateEmployee = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const isUpdate = !!editingEmployeeId;
      const payload = {
        name: employeeForm.name.trim(),
        email: employeeForm.email.trim().toLowerCase(),
        role: employeeForm.role,
      };

      // Include driver fields if role is driver
      if (employeeForm.role === 'driver') {
        payload.licenseNumber = employeeForm.licenseNumber.trim().toUpperCase();
        payload.licenseExpiry = employeeForm.licenseExpiry;
        payload.licenseCategory = employeeForm.licenseCategory;
      }

      const response = isUpdate
        ? await authBaseURL.put(`/employee/${editingEmployeeId}`, payload)
        : await authBaseURL.post('/add-employee', payload);

      console.log('[AddEmployee] Response:', response);

      if (!response.data.success) {
        const errorMessage = response.data?.message || (isUpdate ? 'Update failed' : 'Add failed');
        console.error('[AddEmployee] Error response:', response.data);
        setFormMessage(errorMessage);
        setFormMessageType('error');
        setIsSubmitting(false);
        return;
      }

      notifySuccess(response.data?.message || (isUpdate ? 'Employee updated' : 'Employee added'));
      setIsModalOpen(false);
      resetForm();
      setEditingEmployeeId(null);
      fetchEmployees();
    } catch (error: any) {
      const isUpdate = !!editingEmployeeId;
      const errorMessage = error.response?.data?.message || (isUpdate ? 'Update failed' : 'Add failed');
      console.error('[AddEmployee] Exception:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        fullError: error,
      });
      setFormMessage(errorMessage);
      setFormMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the number of input fields based on role
  // Use the form navigation hook (must be after handleCreateOrUpdateEmployee is defined)
  const inputFieldCount = employeeForm.role === 'driver' ? 4 : 2;
  const { inputRefs, handleKeyDown } = useFormNavigation(inputFieldCount, () => {
    handleCreateOrUpdateEmployee({ preventDefault: () => {} });
  }, isModalOpen);

  const handleEdit = (employee) => {
    setEditingEmployeeId(employee._id);
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      role: employee.role,
    });
    setIsModalOpen(true);
  };

  const handleOpenSendEmailModal = (employee) => {
    setSelectedEmployeeForEmail(employee);
    setEmailSubject('');
    setEmailBody('');
    setEmailFormError('');
    setEmailFormSuccess('');
    setIsSendEmailModalOpen(true);
  };

  const handleCloseSendEmailModal = () => {
    setIsSendEmailModalOpen(false);
    setSelectedEmployeeForEmail(null);
    setEmailSubject('');
    setEmailBody('');
    setEmailFormError('');
    setEmailFormSuccess('');
  };

  const handleSendEmail = async () => {
    if (!selectedEmployeeForEmail) {
      setEmailFormError('Please select an employee to email.');
      return;
    }

    const subject = emailSubject.trim();
    const message = emailBody.trim();

    if (!subject) {
      setEmailFormError('Subject is required.');
      return;
    }
    if (!message) {
      setEmailFormError('Message body is required.');
      return;
    }

    setEmailFormError('');
    setEmailFormSuccess('');
    setEmailSending(true);

    try {
      const response = await authBaseURL.post('/send-email', {
        recipientUserId: selectedEmployeeForEmail._id,
        subject,
        message,
      });

      if (response.status === 200) {
        setEmailFormSuccess('Email sent successfully.');
        notifySuccess('Email sent to employee.');
        setEmailSubject('');
        setEmailBody('');
        // Close modal immediately after successful send
        handleCloseSendEmailModal();
      } else {
        throw new Error(response.data?.message || 'Failed to send email');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send email';
      setEmailFormError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setEmailSending(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    // Prevent double submission
    if (deletingEmployeeId) return;

    setDeletingEmployeeId(employeeId);
    try {
      const response = await authBaseURL.delete(`/employee/${employeeId}`);
      if (response.status === 200) {
        notifySuccess('Employee deleted successfully');
        fetchEmployees();
      }
    } catch (error) {
      notifyError(error.response?.data?.message || 'Failed to delete employee');
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  const handleRecover = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to recover this employee?')) return;

    if (recoveringEmployeeId) return;

    setRecoveringEmployeeId(employeeId);
    try {
      const response = await authBaseURL.post(`/employee/recover/${employeeId}`);
      if (response.status === 200 && response.data.success) {
        notifySuccess('Employee recovered successfully');
        fetchDeletedEmployees();
        fetchEmployees();
      } else {
        throw new Error(response.data?.message || 'Recovery failed');
      }
    } catch (error) {
      notifyError((error as any).response?.data?.message || 'Recovery failed');
    } finally {
      setRecoveringEmployeeId(null);
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

  const formattedDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  const getDriverStatusBadgeColor = (status) => {
    const colors: { [key: string]: string } = {
      available: 'bg-green-100 text-green-800',
      off_duty: 'bg-yellow-100 text-yellow-800',
      on_trip: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get pending employees (those who haven't set password)
  const getPendingEmployees = () => {
    return employeeList.filter((emp) => !emp.isPasswordSet);
  };

  /**
   * Get valid status transitions for a driver
   * Rules:
   * - available → off_duty, suspended
   * - off_duty → available, suspended
   * - suspended → available, off_duty
   * - on_trip → no manual changes allowed
   */
  const getValidStatusTransitions = (currentStatus: string): string[] => {
    const transitions: { [key: string]: string[] } = {
      available: ['off_duty', 'suspended'],
      off_duty: ['available', 'suspended'],
      suspended: ['available', 'off_duty'],
      on_trip: [], // Cannot manually change
    };
    return transitions[currentStatus] || [];
  };

  const handleOpenStatusChangeModal = (driver) => {
    setDriverToChangeStatus(driver);
    setNewDriverStatus('');
    setStatusChangeModalOpen(true);
  };

  const handleCloseStatusChangeModal = () => {
    setStatusChangeModalOpen(false);
    setDriverToChangeStatus(null);
    setNewDriverStatus('');
    setStatusChangeError('');
    setStatusChangeSuccess('');
  };

  const handleChangeDriverStatus = async (selectedStatus?: string) => {
    const statusToApply = selectedStatus || newDriverStatus;

    // Clear previous messages
    setStatusChangeError('');
    setStatusChangeSuccess('');

    console.log(`[Status Update] Starting update for driver:`, driverToChangeStatus);
    console.log(`[Status Update] New status: ${statusToApply}`);

    if (!driverToChangeStatus || !statusToApply) {
      setStatusChangeError('Please select a new status');
      return;
    }

    if (statusToApply === driverToChangeStatus.status) {
      setStatusChangeError('Driver already has this status');
      return;
    }

    setStatusChangeLoading(true);
    try {
      // Verify driver ID before sending
      if (!driverToChangeStatus.driverId) {
        setStatusChangeError('Invalid driver ID. Please close and try again.');
        setStatusChangeLoading(false);
        return;
      }

      console.log(`[Status Update] Sending API request for driver ID: ${driverToChangeStatus.driverId}`);
      const response = await updateDriverStatusAPI(driverToChangeStatus.driverId, statusToApply);
      
      console.log(`[Status Update] Response received:`, response);

      if (response.success) {
        const successMsg = `Driver status updated to ${statusToApply.replace('_', ' ').toUpperCase()}`;
        setStatusChangeSuccess(successMsg);
        notifySuccess(successMsg);
        
        // Update the employee in the list with the response data
        // Backend returns: currentStatus, previousStatus, driverId
        const updatedStatus = response.data?.currentStatus || statusToApply;
        console.log(`[Status Update] Updating local list with status: ${updatedStatus}`);
        setEmployeeList((prev) =>
          prev.map((emp) =>
            emp._id === driverToChangeStatus._id
              ? { ...emp, status: updatedStatus }
              : emp
          )
        );
        
        // Refetch employees to ensure frontend and backend are in sync
        setTimeout(() => {
          console.log(`[Status Update] Refetching employees from backend`);
          fetchEmployees();
          handleCloseStatusChangeModal();
        }, 500);
      } else {
        const errorMsg = response.message || 'Failed to update driver status';
        console.error(`[Status Update] API returned error:`, response);
        setStatusChangeError(errorMsg);
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorMessage = error.response?.data?.message;
      
      console.error(`[Status Update] Error occurred:`, {
        status: errorStatus,
        message: errorMessage,
        fullError: error,
      });
      
      let errorDisplay = errorMessage || 'Failed to update driver status';
      if (errorStatus === 404) {
        errorDisplay = `Driver not found. Driver ID: ${driverToChangeStatus._id}`;
      } else if (errorStatus === 403) {
        errorDisplay = 'Unauthorized: Driver does not belong to your company or you do not have permission';
      }
      
      setStatusChangeError(errorDisplay);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const pendingEmployees = getPendingEmployees();

  const processedEmployees = processEmployeeList();
  const totalPages = Math.ceil(processedEmployees.length / itemsPerPage) || 1;
  
  // Auto-adjust current page if it exceeds total pages (e.g., after deletion)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = processedEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Compute header and description based on current page
  const isDriverRegistry = location.pathname.includes('driver-registry');
  const showReadOnlyIndicator = isReadOnly && !isDriverRegistry;
  const pageTitle = isDriverRegistry ? 'Driver Registry' : 'Employee Management';
  const pageDescription = isDriverRegistry
    ? (canChangeDriverStatus ? 'Manage driver duty status for trip assignment' : 'View available drivers for trip assignment')
    : (isReadOnly ? 'View team members' : 'Manage your team and employee information');

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Team Management</h1>
            {showReadOnlyIndicator && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                📖 View Only
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {isReadOnly ? 'View team members' : 'Manage your team and employee information'}
          </p>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 bg-white rounded-t-lg px-6 py-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 font-semibold transition-colors ${ 
              activeTab === 'active'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Active Employees
          </button>
          {isManager && (
            <button
              onClick={() => setActiveTab('deleted')}
              className={`pb-3 font-semibold transition-colors relative ${ 
                activeTab === 'deleted'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Deleted Employees
              {deletedEmployeeList.length > 0 && (
                <span className="absolute -top-2 right-0 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 min-w-max">
                  {deletedEmployeeList.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ACTIVE EMPLOYEES TAB */}
        {activeTab === 'active' && (
          <div className="bg-white rounded-b-lg shadow-md">
            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Controls Row */}
            <div className="px-6 py-4 flex flex-wrap gap-4 items-center border-b border-gray-200">
              <button
                onClick={() => {
                  setEditingEmployeeId(null);
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                style={{ display: isReadOnly ? 'none' : 'block' }}
              >
                + Add Employee
              </button>

              {/* Filter Menu */}
              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Filter {(filterRole || filterPasswordStatus) && '✓'}
                </button>
                {showFilterMenu && (
                  <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-56">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Status</label>
                        <select
                          value={filterPasswordStatus}
                          onChange={handleFilterPasswordStatusChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">All</option>
                          <option value="ready">✓ Ready</option>
                          <option value="not_ready">⚠️ Not Ready</option>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
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

            {/* Employees Table */}
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
                        {isDriverRegistry && <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Driver Status</th>}
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Password Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                        {!isReadOnly && <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEmployees.map((employee) => (
                        <tr key={employee?._id || Math.random()} className={`border-b hover:bg-gray-50 ${!employee?.isPasswordSet ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3 text-sm text-gray-900">{employee?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{employee?.email || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(employee?.role)}`}>
                              {employee?.role ? employee.role.replaceAll('_', ' ').toUpperCase() : 'N/A'}
                            </span>
                          </td>
                          {isDriverRegistry && (
                            <td className="px-4 py-3 text-sm">
                              {employee?.role === 'driver' && employee?.status ? (
                                <button
                                  onClick={() => handleOpenStatusChangeModal(employee)}
                                  disabled={!canChangeDriverStatus || employee.status === 'on_trip'}
                                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                                    !canChangeDriverStatus || employee.status === 'on_trip'
                                      ? `${getDriverStatusBadgeColor(employee.status)} cursor-not-allowed opacity-60`
                                      : `${getDriverStatusBadgeColor(employee.status)} hover:shadow-md hover:brightness-95`
                                  }`}
                                  title={
                                    !canChangeDriverStatus
                                      ? 'You do not have permission to change driver status'
                                      : employee.status === 'on_trip'
                                      ? 'Cannot change status while driver is on trip'
                                      : 'Click to change driver status'
                                  }
                                >
                                  {employee.status.replace('_', ' ').toUpperCase()}
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm">
                            {employee?.isPasswordSet ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Ready
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                ⚠️ Not Ready
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {employee?.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center space-x-2 flex justify-center gap-2" style={{ display: isReadOnly ? 'none' : 'flex' }}>
                            <button
                              onClick={() => handleOpenSendEmailModal(employee)}
                              className="text-white px-3 py-1 rounded flex items-center gap-1 transition-all duration-200 bg-indigo-500 hover:bg-indigo-600"
                            >
                              ✉️ Email
                            </button>
                            <button
                              onClick={() => handleEdit(employee)}
                              disabled={!employee.isPasswordSet}
                              className={`text-white px-3 py-1 rounded flex items-center gap-1 transition-all duration-200 ${
                                !employee.isPasswordSet
                                  ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                  : 'bg-blue-500 hover:bg-blue-600'
                              }`}
                              title={!employee.isPasswordSet ? 'Cannot edit - employee must set password first' : ''}
                            >
                              <FaEdit className="text-sm" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(employee._id)}
                              disabled={deletingEmployeeId === employee._id}
                              className={`text-white px-3 py-1 rounded flex items-center gap-1 transition-all duration-300 ${
                                deletingEmployeeId === employee._id
                                  ? 'bg-red-400 cursor-not-allowed opacity-70'
                                  : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              {deletingEmployeeId === employee._id ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <FaTrash className="text-sm" /> Delete
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && !isModalOpen && (
                  <PaginationContainer className="justify-between">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages} ({processedEmployees.length} total)
                    </div>
                    <div className="space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-400 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-400 transition"
                  >
                    Next
                  </button>
                </div>
              </PaginationContainer>
            )}
              </>
            )}
          </div>
        )}

        {/* DELETED EMPLOYEES TAB */}
        {activeTab === 'deleted' && isManager && (
          <div className="bg-white rounded-b-lg shadow-md">
            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search deleted employees..."
                value={deletedSearchTerm}
                onChange={(e) => setDeletedSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Deleted Employees Table */}
            {deletedEmployeeList.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No deleted employees found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Deleted</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedEmployeeList.map((employee) => (
                      <tr key={employee._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{employee.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{employee.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(employee.role)}`}>
                            {employee.role.replaceAll('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formattedDate(employee.deletedAt || employee.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center flex justify-center gap-2">
                          <button
                            onClick={() => handleRecover(employee._id)}
                            disabled={recoveringEmployeeId === employee._id}
                            className={`text-white px-4 py-2 rounded flex items-center gap-1 transition-all duration-200 ${
                              recoveringEmployeeId === employee._id
                                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {recoveringEmployeeId === employee._id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Recovering...
                              </>
                            ) : (
                              <>✓ Recover</>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send Email Modal */}
      {isSendEmailModalOpen && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          onClick={handleCloseSendEmailModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Send Email to Employee</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedEmployeeForEmail?.name || 'Selected employee'} — {selectedEmployeeForEmail?.email || ''}
                </p>
              </div>
              <button
                onClick={handleCloseSendEmailModal}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Close send email modal"
              >
                ✕
              </button>
            </div>

            {emailFormSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {emailFormSuccess}
              </div>
            )}
            {emailFormError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {emailFormError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Message subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full min-h-40 rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Write your message to the employee"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleCloseSendEmailModal}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={emailSending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {emailSending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
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
              {formMessage && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    formMessageType === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {formMessage}
                </div>
              )}

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
                  disabled={isSubmitting}
                  onChange={handleFormChange}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  ref={(el) => (inputRefs.current[0] = el)}
                  placeholder="Employee Name"
                  className={`w-full border p-2 rounded mt-1 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                  disabled={isSubmitting}
                  onChange={handleFormChange}
                  onKeyDown={(e) => handleKeyDown(e, 1)}
                  ref={(el) => (inputRefs.current[1] = el)}
                  placeholder="Employee Email"
                  className={`w-full border p-2 rounded mt-1 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  value={employeeForm.role}
                  disabled={isSubmitting}
                  onChange={handleFormChange}
                  onKeyDown={(e) => handleKeyDown(e, 2)}
                  ref={(el) => (inputRefs.current[2] = el)}
                  className="w-full border border-gray-300 p-2 rounded mt-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={isSubmitting}
                      onChange={handleFormChange}
                      onKeyDown={(e) => handleKeyDown(e, 3)}
                      ref={(el) => (inputRefs.current[3] = el)}
                      placeholder="e.g., DL1234567"
                      className={`w-full border p-2 rounded mt-1 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                      disabled={isSubmitting}
                      onChange={handleFormChange}
                      onKeyDown={(e) => handleKeyDown(e, 4)}
                      ref={(el) => (inputRefs.current[4] = el)}
                      className={`w-full border p-2 rounded mt-1 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                      disabled={isSubmitting}
                      onChange={handleFormChange}
                      className={`w-full border p-2 rounded mt-1 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-400 text-white p-2 rounded font-medium hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 text-white p-2 rounded font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingEmployeeId ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingEmployeeId ? 'Update' : 'Add'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Status Change Modal */}
      {statusChangeModalOpen && driverToChangeStatus && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          onClick={handleCloseStatusChangeModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Change Driver Status</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Driver:</span> {driverToChangeStatus.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Current Status:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDriverStatusBadgeColor(driverToChangeStatus.status)}`}>
                  {driverToChangeStatus.status.replace('_', ' ').toUpperCase()}
                </span>
              </p>
            </div>

            {/* Error Message - Display in modal, not globally */}
            {statusChangeError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">⚠️ Error:</span> {statusChangeError}
                </p>
              </div>
            )}

            {/* Success Message - Display in modal */}
            {statusChangeSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">✓ Success:</span> {statusChangeSuccess}
                </p>
              </div>
            )}

            {driverToChangeStatus.status === 'on_trip' ? (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ <span className="font-semibold">Cannot change status</span> - Driver is currently on an active trip. Please wait for trip completion.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newDriverStatus}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setNewDriverStatus(selected);
                      if (selected) {
                        handleChangeDriverStatus(selected);
                      }
                    }}
                    disabled={statusChangeLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select New Status --</option>
                    {getValidStatusTransitions(driverToChangeStatus.status).map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {newDriverStatus && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">Transition:</span>{' '}
                      {driverToChangeStatus.status.replace('_', ' ').toUpperCase()} → {newDriverStatus.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                )}

                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    Status updates immediately after selection.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseStatusChangeModal}
                    disabled={statusChangeLoading}
                    className="flex-1 bg-gray-400 text-white p-2 rounded font-medium hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                  >
                    {statusChangeLoading ? 'Updating...' : 'Close'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
