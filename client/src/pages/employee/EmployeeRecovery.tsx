import { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import PaginationContainer from '../../components/PaginationContainer';
import { PageContainer, PageHeader } from '../../components/ui/PageLayout';
import authBaseURL from '../../api/authBaseURL';
import { DEFAULT_PAGE_SIZE } from '../../config/paginationConfig';

export default function EmployeeRecovery() {
  const { notifyError, notifySuccess } = useNotification();
  const navigate = useNavigate();

  const [deletedEmployees, setDeletedEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('deleted');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recoveringEmployeeId, setRecoveringEmployeeId] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [totalPages, setTotalPages] = useState(1);

  const fetchDeletedEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await authBaseURL.get(
        `/employees/deleted?page=${currentPage}&limit=${DEFAULT_PAGE_SIZE}&search=${encodeURIComponent(searchTerm)}`
      );

      if (response.status === 200 && response.data.success) {
        const data = response.data.data || {};
        setDeletedEmployees(data.deletedEmployees || []);
        const totalItems = data.total || 0;
        setTotalPages(Math.max(1, Math.ceil(totalItems / DEFAULT_PAGE_SIZE)));
      } else {
        throw new Error(response.data?.message || 'Failed to load deleted employees');
      }
    } catch (error: any) {
      console.error('Fetch deleted employees error:', error);
      notifyError(error.response?.data?.message || error.message || 'Failed to load deleted employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedEmployees();
  }, [currentPage, searchTerm]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const openConfirmModal = (employee: any) => {
    setSelectedEmployee(employee);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setSelectedEmployee(null);
    setConfirmModalOpen(false);
  };

  const handleRecover = async () => {
    if (!selectedEmployee) return;

    setRecoveringEmployeeId(selectedEmployee._id);
    try {
      const response = await authBaseURL.post(`/employee/recover/${selectedEmployee._id}`);
      if (response.status === 200 && response.data.success) {
        notifySuccess('Employee recovered successfully');
        closeConfirmModal();
        fetchDeletedEmployees();
      } else {
        throw new Error(response.data?.message || 'Failed to recover employee');
      }
    } catch (error: any) {
      console.error('Employee recovery error:', error);
      notifyError(error.response?.data?.message || error.message || 'Failed to recover employee');
    } finally {
      setRecoveringEmployeeId(null);
    }
  };

  const formattedDate = (dateValue: string | Date) => {
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleDateString();
  };

  const canShowPagination = totalPages > 1;

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Employee Recovery"
        description="Manage deleted employees and restore accounts for your team."
        action={
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/main/team')}
              className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 hover:bg-gray-300"
            >
              Back to Team
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-3 border-b border-gray-200 pb-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === 'active'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Active Employees
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === 'deleted'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Deleted Employees
              {deletedEmployees.length > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                  {deletedEmployees.length}
                </span>
              )}
            </button>
          </div>

          <input
            type="text"
            placeholder="Search deleted employees..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-600">Loading deleted employees...</div>
        ) : deletedEmployees.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No deleted employees found. Use the team page to manage active employees.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b text-left text-sm text-gray-700">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Deleted On</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedEmployees.map((employee, index) => (
                  <tr key={employee._id || index} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-sm text-gray-900">{employee.name || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{employee.email || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{employee.role?.replace('_', ' ')?.toUpperCase() || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{formattedDate(employee.updatedAt)}</td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => openConfirmModal(employee)}
                        className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Recover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {canShowPagination && (
          <PaginationContainer className="mt-6 justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({deletedEmployees.length} total)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </PaginationContainer>
        )}
      </div>

      {confirmModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/25 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Recover employee account</h3>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to restore <strong>{selectedEmployee.name}</strong> back into the active employee list?
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={closeConfirmModal}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRecover}
                disabled={recoveringEmployeeId === selectedEmployee._id}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {recoveringEmployeeId === selectedEmployee._id ? 'Recovering...' : 'Recover Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
