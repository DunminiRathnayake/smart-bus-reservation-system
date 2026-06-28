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
  fullName: z.string().min(2, 'Driver name is required (min 2 characters)'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  licenseNumber: z.string().min(4, 'License number is required'),
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
    defaultValues: { fullName: '', phoneNumber: '', licenseNumber: '', status: 'ACTIVE' }
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

  const handleOpenAdd = () => {
    setEditingDriver(null);
    reset({ fullName: '', phoneNumber: '', licenseNumber: '', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setValue('fullName', driver.fullName);
    setValue('phoneNumber', driver.phoneNumber);
    setValue('licenseNumber', driver.licenseNumber);
    setValue('status', driver.status);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (editingDriver) {
        const response = await driverService.updateDriver(editingDriver._id, data);
        if (response.success) {
          addToast('Driver credentials updated.', 'success');
          setModalOpen(false);
          fetchDrivers();
        } else {
          addToast(response.message || 'Update failed.', 'error');
        }
      } else {
        const response = await driverService.createDriver(data);
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
            placeholder="Search driver name or license..."
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
                  <th className="p-4 sm:p-5">Driver Name</th>
                  <th className="p-4 sm:p-5">Phone Number</th>
                  <th className="p-4 sm:p-5">License Number</th>
                  <th className="p-4 sm:p-5">Status</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80">
                {drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-slate-850/20 text-slate-300 transition-colors">
                    <td className="p-4 sm:p-5 font-semibold text-slate-200">{driver.fullName}</td>
                    <td className="p-4 sm:p-5 text-slate-450">{driver.phoneNumber}</td>
                    <td className="p-4 sm:p-5 font-mono text-slate-400">{driver.licenseNumber}</td>
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
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-300 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl shadow-xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 relative z-10">
              <h3 className="text-base font-bold text-slate-200">
                {editingDriver ? 'Edit Driver' : 'Register Operator'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-250 font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10 text-xs text-slate-300">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. David Conductor"
                  {...registerField('fullName')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                />
                {errors.fullName && <p className="text-red-400 text-[10px] mt-0.5">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 55501920"
                  {...registerField('phoneNumber')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                />
                {errors.phoneNumber && <p className="text-red-400 text-[10px] mt-0.5">{errors.phoneNumber.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider">License Number</label>
                <input
                  type="text"
                  placeholder="e.g. LIC-492049"
                  {...registerField('licenseNumber')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
                />
                {errors.licenseNumber && <p className="text-red-400 text-[10px] mt-0.5">{errors.licenseNumber.message}</p>}
              </div>

              {editingDriver && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Duty Status</label>
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
