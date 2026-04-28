import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DatePicker from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import {
  addEmployee,
  deleteEmployee,
  getDeletedEmployees,
  getEmployees,
  recoverEmployee,
  sendEmployeeEmail,
  type AddEmployeePayload,
  type EmployeeRecord,
  type EmployeeRole,
} from '@/api/auth';

const roleLabels: Record<string, string> = {
  manager: 'Manager',
  driver: 'Driver',
  dispatcher: 'Dispatcher',
  safety_officer: 'Safety Officer',
  financial_analyst: 'Financial Analyst',
};

const PAGE_SIZE = 10;

interface AddEmployeeFormState {
  name: string;
  email: string;
  role: EmployeeRole | '';
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategory: 'truck' | 'van' | 'bike' | '';
}

interface Feedback {
  type: 'success' | 'error' | 'info';
  message: string;
}

const emptyAddForm: AddEmployeeFormState = {
  name: '',
  email: '',
  role: '',
  licenseNumber: '',
  licenseExpiry: '',
  licenseCategory: '',
};

export default function EmployeesPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
  const [search, setSearch] = useState('');
  const [deletedSearch, setDeletedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | EmployeeRole>('all');
  const [activePage, setActivePage] = useState(1);
  const [deletedPage, setDeletedPage] = useState(1);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);

  const [addForm, setAddForm] = useState<AddEmployeeFormState>(emptyAddForm);
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });

  const [pageFeedback, setPageFeedback] = useState<Feedback | null>(null);
  const [addFeedback, setAddFeedback] = useState<Feedback | null>(null);
  const [emailFeedback, setEmailFeedback] = useState<Feedback | null>(null);

  const {
    data: activeEmployees = [],
    isLoading: isActiveLoading,
    isError: isActiveError,
    error: activeError,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ['employees', 'active'],
    queryFn: async () => {
      const result = await getEmployees();
      return result.data?.employees ?? [];
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  const {
    data: deletedData,
    isLoading: isDeletedLoading,
    isError: isDeletedError,
    error: deletedError,
    refetch: refetchDeleted,
  } = useQuery({
    queryKey: ['employees', 'deleted', deletedPage, deletedSearch],
    queryFn: async () => {
      const result = await getDeletedEmployees({
        page: deletedPage,
        limit: PAGE_SIZE,
        search: deletedSearch.trim() || undefined,
      });
      return result.data;
    },
    enabled: activeTab === 'deleted' || Boolean(deletedSearch.trim()),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const addEmployeeMutation = useMutation({
    mutationFn: addEmployee,
    onSuccess: async (result) => {
      const notifications: string[] = [result.message];

      if (result.data?.isUserRecovered) {
        notifications.push('Deleted employee was automatically recovered.');
      }
      if (result.data?.emailSent) {
        notifications.push('Setup email sent successfully.');
      }
      if (result.data?.defaultPassword) {
        notifications.push(`Temporary password: ${result.data.defaultPassword}`);
      }

      const successMessage = notifications.join(' ');
      setPageFeedback({ type: 'success', message: successMessage });
      setAddFeedback(null);
      setAddDialogOpen(false);
      setAddForm(emptyAddForm);

      await queryClient.invalidateQueries({ queryKey: ['employees', 'active'] });
      await queryClient.invalidateQueries({ queryKey: ['employees', 'deleted'] });
    },
    onError: (error: Error) => {
      setAddFeedback({ type: 'error', message: error.message || 'Failed to add employee.' });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: async (result) => {
      setPageFeedback({ type: 'success', message: result.message });
      await queryClient.invalidateQueries({ queryKey: ['employees', 'active'] });
      await queryClient.invalidateQueries({ queryKey: ['employees', 'deleted'] });
    },
    onError: (error: Error) => {
      setPageFeedback({ type: 'error', message: error.message || 'Failed to delete employee.' });
    },
  });

  const recoverEmployeeMutation = useMutation({
    mutationFn: recoverEmployee,
    onSuccess: async (result) => {
      setPageFeedback({ type: 'success', message: result.message });
      await queryClient.invalidateQueries({ queryKey: ['employees', 'active'] });
      await queryClient.invalidateQueries({ queryKey: ['employees', 'deleted'] });
    },
    onError: (error: Error) => {
      setPageFeedback({ type: 'error', message: error.message || 'Failed to recover employee.' });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: sendEmployeeEmail,
    onSuccess: (result) => {
      setEmailFeedback({ type: 'success', message: result.message });
      setPageFeedback({ type: 'info', message: 'Email sent to employee successfully.' });
      setTimeout(() => {
        setEmailDialogOpen(false);
        setEmailFeedback(null);
        setEmailForm({ subject: '', message: '' });
      }, 700);
    },
    onError: (error: Error) => {
      setEmailFeedback({ type: 'error', message: error.message || 'Failed to send email.' });
    },
  });

  useEffect(() => {
    setActivePage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    setDeletedPage(1);
  }, [deletedSearch]);

  const filteredActiveEmployees = useMemo(() => {
    return activeEmployees.filter((employee) => {
      const matchSearch =
        !search ||
        [employee.name, employee.email].some((value) =>
          value.toLowerCase().includes(search.trim().toLowerCase()),
        );
      const matchRole = roleFilter === 'all' || employee.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [activeEmployees, search, roleFilter]);

  const totalActivePages = Math.max(1, Math.ceil(filteredActiveEmployees.length / PAGE_SIZE));
  const paginatedActiveEmployees = filteredActiveEmployees.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );

  useEffect(() => {
    if (activePage > totalActivePages) {
      setActivePage(totalActivePages);
    }
  }, [activePage, totalActivePages]);

  const deletedEmployees = deletedData?.deletedEmployees ?? [];
  const totalDeletedEmployees = deletedData?.total ?? 0;
  const totalDeletedPages = Math.max(1, Math.ceil(totalDeletedEmployees / PAGE_SIZE));

  const handleAddEmployeeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!addForm.role) {
      setAddFeedback({ type: 'error', message: 'Please select an employee role.' });
      return;
    }

    if (
      addForm.role === 'driver' &&
      (!addForm.licenseNumber || !addForm.licenseExpiry || !addForm.licenseCategory)
    ) {
      setAddFeedback({ type: 'error', message: 'Driver profile requires complete license information.' });
      return;
    }

    setAddFeedback(null);

    const payload: AddEmployeePayload = {
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      role: addForm.role,
    };

    if (addForm.role === 'driver') {
      payload.licenseNumber = addForm.licenseNumber.trim().toUpperCase();
      payload.licenseExpiry = addForm.licenseExpiry;
      payload.licenseCategory = addForm.licenseCategory;
    }

    await addEmployeeMutation.mutateAsync(payload);
  };

  const handleDelete = async (employee: EmployeeRecord) => {
    const confirmed = window.confirm(
      `Delete ${employee.name}? This is a soft delete and can be recovered from the deleted tab.`,
    );
    if (!confirmed) return;

    await deleteEmployeeMutation.mutateAsync(employee._id);
  };

  const handleRecover = async (employee: EmployeeRecord) => {
    const confirmed = window.confirm(`Recover ${employee.name} and activate access again?`);
    if (!confirmed) return;

    await recoverEmployeeMutation.mutateAsync(employee._id);
  };

  const openEmailDialog = (employee: EmployeeRecord) => {
    setSelectedEmployee(employee);
    setEmailForm({
      subject: `Operational update for ${employee.name}`,
      message: '',
    });
    setEmailFeedback(null);
    setEmailDialogOpen(true);
  };

  const handleSendEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEmployee) return;

    setEmailFeedback(null);

    await sendEmailMutation.mutateAsync({
      recipientUserId: selectedEmployee._id,
      subject: emailForm.subject,
      message: emailForm.message,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage employee onboarding, status, and vehicle assignments</p>
          </div>
          <Dialog
            open={addDialogOpen}
            onOpenChange={(open) => {
              setAddDialogOpen(open);
              if (!open) {
                setAddFeedback(null);
                setAddForm(emptyAddForm);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAddEmployeeSubmit} className="mt-4 space-y-4">
                {addFeedback && <FeedbackCard feedback={addFeedback} />}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employee-name">Full Name</Label>
                    <Input
                      id="employee-name"
                      placeholder="Arjun Sharma"
                      value={addForm.name}
                      onChange={(event) => setAddForm((prev) => ({ ...prev, name: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee-email">Email</Label>
                    <Input
                      id="employee-email"
                      type="email"
                      placeholder="arjun@company.com"
                      value={addForm.email}
                      onChange={(event) => setAddForm((prev) => ({ ...prev, email: event.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={addForm.role}
                    onValueChange={(value) =>
                      setAddForm((prev) => ({
                        ...prev,
                        role: value as EmployeeRole,
                        licenseNumber: value === 'driver' ? prev.licenseNumber : '',
                        licenseExpiry: value === 'driver' ? prev.licenseExpiry : '',
                        licenseCategory: value === 'driver' ? prev.licenseCategory : '',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="dispatcher">Dispatcher</SelectItem>
                      <SelectItem value="safety_officer">Safety Officer</SelectItem>
                      <SelectItem value="financial_analyst">Financial Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {addForm.role === 'driver' ? (
                  <div className="space-y-4 rounded-lg border p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Driver License Profile</p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="license-number">License Number</Label>
                        <Input
                          id="license-number"
                          placeholder="DL15PA017"
                          value={addForm.licenseNumber}
                          onChange={(event) =>
                            setAddForm((prev) => ({ ...prev, licenseNumber: event.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license-expiry">Expiry Date</Label>
                        <DatePicker
                          id="license-expiry"
                          value={addForm.licenseExpiry}
                          onChange={(value) => setAddForm((prev) => ({ ...prev, licenseExpiry: value }))}
                          placeholder="dd-mm-yyyy"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={addForm.licenseCategory}
                          onValueChange={(value) =>
                            setAddForm((prev) => ({
                              ...prev,
                              licenseCategory: value as AddEmployeeFormState['licenseCategory'],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="van">Van</SelectItem>
                            <SelectItem value="bike">Bike</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    disabled={addEmployeeMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addEmployeeMutation.isPending}>
                    {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {pageFeedback ? <FeedbackCard feedback={pageFeedback} /> : null}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'deleted')}>
          <TabsList>
            <TabsTrigger value="active">Active Employees ({activeEmployees.length})</TabsTrigger>
            <TabsTrigger value="deleted">Deleted Employees ({totalDeletedEmployees})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {/* Filters Section */}
            <div className="flex flex-col gap-4 rounded-lg border bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-sm font-medium text-muted-foreground">Filter by role:</span>
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="dispatcher">Dispatcher</SelectItem>
                    <SelectItem value="safety_officer">Safety Officer</SelectItem>
                    <SelectItem value="financial_analyst">Financial Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border bg-card overflow-x-auto">
              {isActiveLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading employees...</div>
              ) : isActiveError ? (
                <div className="space-y-3 p-8 text-center">
                  <p className="text-sm text-destructive">
                    {(activeError as Error)?.message || 'Failed to load employees.'}
                  </p>
                  <Button variant="outline" onClick={() => refetchActive()}>
                    Retry
                  </Button>
                </div>
              ) : filteredActiveEmployees.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {search || roleFilter !== 'all'
                    ? 'No employees match your current filters.'
                    : 'No active employees found. Add your first employee to begin.'}
                </div>
              ) : (
                <div className="rounded-lg border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left font-semibold">Name & Email</th>
                          <th className="px-4 py-3 text-left font-semibold">Role</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                          <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedActiveEmployees.map((employee) => (
                          <tr key={employee._id} className="border-b hover:bg-muted/30 transition-colors">
                            {/* Name & Email */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                  {employee.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{employee.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                                </div>
                              </div>
                            </td>
                            {/* Role */}
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground">
                                {roleLabels[employee.role] || employee.role}
                              </span>
                            </td>
                            {/* Lifecycle & Driver Status */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {/* Show driver runtime status when employee is active; otherwise show lifecycle status */}
                                  {employee.role === 'driver' && employee.lifecycleStatus === 'active' && employee.status ? (
                                    <StatusBadge status={employee.status} />
                                  ) : (
                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium max-w-max ${
                                      employee.lifecycleStatus === 'active'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : employee.lifecycleStatus === 'pending_setup'
                                        ? 'bg-amber-100 text-amber-700'
                                        : employee.lifecycleStatus === 'suspended' || employee.lifecycleStatus === 'inactive'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {((employee.lifecycleStatus || 'unknown').replace(/_/g, ' ')).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                            </td>
                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEmailDialog(employee)}
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(employee)}
                                  disabled={deleteEmployeeMutation.isPending}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {filteredActiveEmployees.length > PAGE_SIZE ? (
              <div className="flex items-center justify-between rounded-xl border bg-card p-4 text-sm">
                <p className="text-muted-foreground">
                  Showing {(activePage - 1) * PAGE_SIZE + 1}-
                  {Math.min(activePage * PAGE_SIZE, filteredActiveEmployees.length)} of {filteredActiveEmployees.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
                    disabled={activePage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActivePage((prev) => Math.min(totalActivePages, prev + 1))}
                    disabled={activePage >= totalActivePages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="deleted" className="space-y-4">
            {/* Filters Section */}
            <div className="flex flex-col gap-4 rounded-lg border bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search deleted employees..."
                  className="pl-9"
                  value={deletedSearch}
                  onChange={(event) => setDeletedSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              {isDeletedLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading deleted employees...</div>
              ) : isDeletedError ? (
                <div className="space-y-3 p-8 text-center">
                  <p className="text-sm text-destructive">
                    {(deletedError as Error)?.message || 'Failed to load deleted employees.'}
                  </p>
                  <Button variant="outline" onClick={() => refetchDeleted()}>
                    Retry
                  </Button>
                </div>
              ) : deletedEmployees.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No deleted employees found for the current search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-semibold">Name & Email</th>
                        <th className="px-4 py-3 text-left font-semibold">Role</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedEmployees.map((employee) => (
                        <tr key={employee._id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
                                {employee.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{employee.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground">
                              {roleLabels[employee.role] || employee.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Recover"
                                onClick={() => handleRecover(employee)}
                                disabled={recoverEmployeeMutation.isPending}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {totalDeletedEmployees > PAGE_SIZE ? (
              <div className="flex items-center justify-between rounded-xl border bg-card p-4 text-sm">
                <p className="text-muted-foreground">
                  Showing {(deletedPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(deletedPage * PAGE_SIZE, totalDeletedEmployees)} of {totalDeletedEmployees}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletedPage((prev) => Math.max(1, prev - 1))}
                    disabled={deletedPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletedPage((prev) => Math.min(totalDeletedPages, prev + 1))}
                    disabled={deletedPage >= totalDeletedPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>

        <Dialog
          open={emailDialogOpen}
          onOpenChange={(open) => {
            setEmailDialogOpen(open);
            if (!open) {
              setEmailFeedback(null);
              setSelectedEmployee(null);
              setEmailForm({ subject: '', message: '' });
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Send Email to Employee</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSendEmailSubmit} className="mt-4 space-y-4">
              {emailFeedback ? <FeedbackCard feedback={emailFeedback} /> : null}

              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">Recipient</p>
                <p className="text-muted-foreground">
                  {selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.email})` : 'No employee selected'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailForm.subject}
                  onChange={(event) =>
                    setEmailForm((prev) => ({ ...prev, subject: event.target.value }))
                  }
                  minLength={3}
                  maxLength={120}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message">Message</Label>
                <Textarea
                  id="email-message"
                  value={emailForm.message}
                  onChange={(event) =>
                    setEmailForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                  className="min-h-[140px]"
                  minLength={5}
                  maxLength={2000}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEmailDialogOpen(false)}
                  disabled={sendEmailMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={sendEmailMutation.isPending || !selectedEmployee}>
                  {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const base = 'rounded-xl border px-4 py-3 text-sm';

  if (feedback.type === 'error') {
    return <div className={`${base} border-red-200 bg-red-50 text-red-700`}>{feedback.message}</div>;
  }

  if (feedback.type === 'success') {
    return <div className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}>{feedback.message}</div>;
  }

  return (
    <div className={`${base} border-sky-200 bg-sky-50 text-sky-700`}>{feedback.message}</div>
  );
}
