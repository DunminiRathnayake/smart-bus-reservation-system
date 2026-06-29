import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import driverService from '../services/driverService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  UserCheck
} from 'lucide-react';

const driverSchema = z.object({
  employeeId: z.string().min(2, 'Employee ID is required'),
  fullName: z.string().min(2, 'Full name is required (min 2 characters)'),
  email: z.string().email('Please provide a valid email address'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  nic: z.string().min(5, 'NIC is required'),
  address: z.string().min(5, 'Address is required'),
  gender: z.string().min(1, 'Gender is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  experienceYears: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Experience years must be 0 or more')
  ),
  licenseNumber: z.string().min(4, 'License number is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  status: z.string().optional()
});

/**
 * Driver / Conductor management panel.
 */
const DriverManagement = () => {
  const { addToast } = useToast();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      employeeId: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      nic: '',
      address: '',
      gender: 'MALE',
      dateOfBirth: '',
      joiningDate: '',
      experienceYears: 1,
      licenseNumber: '',
      licenseExpiry: '',
      status: 'ACTIVE'
    }
  });

  const fetchDrivers = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 5,
        search: searchTerm
      };
      if (statusFilter !== 'ALL') query.status = statusFilter;

      const response = await driverService.getDrivers(query);
      if (response.success && response.data) {
        setDrivers(response.data.drivers || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load fleet drivers:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDrivers();
  };

  const formatDateString = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().split('T')[0];
  };

  const handleOpenAdd = () => {
    setEditingDriver(null);
    reset({
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      email: '',
      phoneNumber: '',
      nic: '',
      address: '',
      gender: 'MALE',
      dateOfBirth: '1990-01-01',
      joiningDate: new Date().toISOString().split('T')[0],
      experienceYears: 1,
      licenseNumber: '',
      licenseExpiry: '2030-01-01',
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setValue('employeeId', driver.employeeId);
    setValue('fullName', driver.fullName);
    setValue('email', driver.email);
    setValue('phoneNumber', driver.phoneNumber);
    setValue('nic', driver.nic);
    setValue('address', driver.address);
    setValue('gender', driver.gender);
    setValue('dateOfBirth', formatDateString(driver.dateOfBirth));
    setValue('joiningDate', formatDateString(driver.joiningDate));
    setValue('experienceYears', driver.experienceYears);
    setValue('licenseNumber', driver.licenseNumber);
    setValue('licenseExpiry', formatDateString(driver.licenseExpiry));
    setValue('status', driver.status);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Format dates to ISO String format for backend
    const payload = {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      joiningDate: new Date(data.joiningDate).toISOString(),
      licenseExpiry: new Date(data.licenseExpiry).toISOString()
    };

    try {
      if (editingDriver) {
        const response = await driverService.updateDriver(editingDriver._id, payload);
        if (response.success) {
          addToast('Driver credentials updated.', 'success');
          setModalOpen(false);
          fetchDrivers();
        } else {
          addToast(response.message || 'Update failed.', 'error');
        }
      } else {
        const response = await driverService.createDriver(payload);
        if (response.success) {
          addToast('New driver registered.', 'success');
          setModalOpen(false);
          fetchDrivers();
        } else {
          addToast(response.message || 'Registration failed.', 'error');
        }
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Server connection error.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await driverService.deleteDriver(selectedDeleteId);
      if (response.success) {
        addToast('Driver status removed.', 'success');
        fetchDrivers();
      } else {
        addToast(response.message || 'Deletion failed.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Error removing driver.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      INACTIVE: 'bg-slate-800 text-slate-400 border border-slate-750',
      SUSPENDED: 'bg-red-500/10 text-red-400 border border-red-500/20'
    };
    return (
      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${styles[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-emerald-400" /> Driver Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">Register operators, update license details, and verify active shift schedules.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" /> Register Driver
        </button>
      </div>

      {/* Search & filters panel */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search driver name, employee ID, or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-505">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-350"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active (On Duty)</option>
            <option value="INACTIVE">Inactive (Off Duty)</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <button type="submit" className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs font-semibold rounded-xl text-slate-300">
          Apply Filter
        </button>
      </form>

      {/* Drivers Table */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="list" count={3} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-slate-300 text-sm">Failed to retrieve drivers roster.</p>
            <button onClick={fetchDrivers} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl">
              Retry
            </button>
          </div>
        ) : drivers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Emp ID</th>
                  <th className="p-4 sm:p-5">Driver Name</th>
                  <th className="p-4 sm:p-5">Contact Details</th>
                  <th className="p-4 sm:p-5">License Number</th>
                  <th className="p-4 sm:p-5">Status</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80">
                {drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-slate-850/20 text-slate-300 transition-colors">
                    <td className="p-4 sm:p-5 font-mono text-emerald-450 font-bold">{driver.employeeId}</td>
                    <td className="p-4 sm:p-5 font-semibold text-slate-200">{driver.fullName}</td>
                    <td className="p-4 sm:p-5 text-slate-400">
                      <div>{driver.phoneNumber}</div>
                      <div className="text-[10px] text-slate-500">{driver.email}</div>
                    </td>
                    <td className="p-4 sm:p-5 font-mono text-slate-400">
                      <div>{driver.licenseNumber}</div>
                      <div className="text-[9px] text-slate-500">Exp: {formatDateString(driver.licenseExpiry)}</div>
                    </td>
                    <td className="p-4 sm:p-5">{getStatusBadge(driver.status)}</td>
                    <td className="p-4 sm:p-5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(driver)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Edit Driver"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(driver._id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove Driver"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Drivers Registered"
            description="Clear search queries or click Register Driver to add vehicle operators."
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs pt-4 max-w-7xl mx-auto">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-300 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-300 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-850 rounded-3xl shadow-xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 relative z-10">
              <h3 className="text-base font-bold text-slate-200">
                {editingDriver ? 'Edit Driver Details' : 'Register Operator'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-250 font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-101"
                    {...registerField('employeeId')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
                  />
                  {errors.employeeId && <p className="text-red-400 text-[10px] mt-0.5">{errors.employeeId.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    {...registerField('fullName')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.fullName && <p className="text-red-400 text-[10px] mt-0.5">{errors.fullName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. john@smartgo.com"
                    {...registerField('email')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.email && <p className="text-red-400 text-[10px] mt-0.5">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 0777934012"
                    {...registerField('phoneNumber')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.phoneNumber && <p className="text-red-400 text-[10px] mt-0.5">{errors.phoneNumber.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">NIC Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 199012345678"
                    {...registerField('nic')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
                  />
                  {errors.nic && <p className="text-red-400 text-[10px] mt-0.5">{errors.nic.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Gender</label>
                  <select
                    {...registerField('gender')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-400 text-[10px] mt-0.5">{errors.gender.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider">Address</label>
                <input
                  type="text"
                  placeholder="e.g. 123 Main Street, Colombo"
                  {...registerField('address')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                />
                {errors.address && <p className="text-red-400 text-[10px] mt-0.5">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    {...registerField('dateOfBirth')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.dateOfBirth && <p className="text-red-400 text-[10px] mt-0.5">{errors.dateOfBirth.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Joining Date</label>
                  <input
                    type="date"
                    {...registerField('joiningDate')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.joiningDate && <p className="text-red-400 text-[10px] mt-0.5">{errors.joiningDate.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. B1234567"
                    {...registerField('licenseNumber')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
                  />
                  {errors.licenseNumber && <p className="text-red-400 text-[10px] mt-0.5">{errors.licenseNumber.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">License Expiry</label>
                  <input
                    type="date"
                    {...registerField('licenseExpiry')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.licenseExpiry && <p className="text-red-400 text-[10px] mt-0.5">{errors.licenseExpiry.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Experience (Years)</label>
                  <input
                    type="number"
                    placeholder="5"
                    {...registerField('experienceYears')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.experienceYears && <p className="text-red-400 text-[10px] mt-0.5">{errors.experienceYears.message}</p>}
                </div>

                {editingDriver && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-455 uppercase tracking-wider">Duty Status</label>
                    <select
                      {...registerField('status')}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-350"
                    >
                      <option value="ACTIVE">Active (On Duty)</option>
                      <option value="INACTIVE">Inactive (Off Duty)</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingDriver ? 'Update Driver' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Driver from duty?"
        description="Are you sure you want to deactivate this operator? Associated shift schedules will have driver-allocation warnings."
        confirmText="Confirm Remove"
        type="danger"
      />
    </div>
  );
};

export default DriverManagement;
