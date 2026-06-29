import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import busService from '../services/busService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import {
  Bus,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';

const busSchema = z.object({
  busNumber: z.string().min(2, 'Bus number is required (min 2 characters)'),
  busName: z.string().min(2, 'Bus name is required (min 2 characters)'),
  registrationNumber: z.string().min(2, 'Registration plate is required'),
  capacity: z.preprocess(
    (val) => Number(val),
    z.number().min(5, 'Capacity must be at least 5 seats').max(100, 'Capacity cannot exceed 100')
  ),
  type: z.string().min(1, 'Bus type is required'),
  status: z.string().optional()
});

/**
 * Bus Fleet Management page. Supports CRUD, search, filter, and page counts.
 */
const BusManagement = () => {
  const { addToast } = useToast();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
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
    resolver: zodResolver(busSchema),
    defaultValues: { busNumber: '', busName: '', registrationNumber: '', capacity: 40, type: 'NORMAL', status: 'ACTIVE' }
  });

  const fetchBuses = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 5,
        search: searchTerm
      };
      if (typeFilter !== 'ALL') query.busType = typeFilter;
      if (statusFilter !== 'ALL') query.status = statusFilter;

      const response = await busService.getBuses(query);
      if (response.success && response.data) {
        setBuses(response.data.buses || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load fleet buses:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [currentPage, typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBuses();
  };

  const handleOpenAdd = () => {
    setEditingBus(null);
    reset({ busNumber: `BUS-${Math.floor(100 + Math.random() * 900)}`, busName: '', registrationNumber: '', capacity: 40, type: 'AC', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const handleOpenEdit = (bus) => {
    setEditingBus(bus);
    setValue('busNumber', bus.busNumber);
    setValue('busName', bus.busName);
    setValue('registrationNumber', bus.registrationNumber);
    setValue('capacity', bus.capacity);
    setValue('type', bus.type);
    setValue('status', bus.status);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (editingBus) {
        const response = await busService.updateBus(editingBus._id, data);
        if (response.success) {
          addToast('Bus parameters updated successfully.', 'success');
          setModalOpen(false);
          fetchBuses();
        } else {
          addToast(response.message || 'Update failed.', 'error');
        }
      } else {
        const response = await busService.createBus(data);
        if (response.success) {
          addToast('New bus added to fleet list.', 'success');
          setModalOpen(false);
          fetchBuses();
        } else {
          addToast(response.message || 'Creation failed.', 'error');
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
      const response = await busService.deleteBus(selectedDeleteId);
      if (response.success) {
        addToast('Bus deleted successfully from operational fleet.', 'success');
        fetchBuses();
      } else {
        addToast(response.message || 'Deletion failed.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Error soft-deleting bus.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      INACTIVE: 'bg-slate-800 text-slate-400 border border-slate-750',
      MAINTENANCE: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
            <Bus className="h-6 w-6 text-emerald-400" /> Fleet Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure buses details, seat capacities, and maintenance schedules.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" /> Add New Bus
        </button>
      </div>

      {/* Search & filters panel */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search bus name, number, or plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
          >
            <option value="ALL">All Types</option>
            <option value="AC">AC</option>
            <option value="NON_AC">Non AC</option>
            <option value="SEMI_LUXURY">Semi Luxury</option>
            <option value="LUXURY">Luxury</option>
            <option value="SLEEPER">Sleeper</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        <button type="submit" className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs font-semibold rounded-xl text-slate-300">
          Apply Filter
        </button>
      </form>

      {/* Buses Table */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="list" count={3} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-slate-300 text-sm">Failed to retrieve bus fleet list.</p>
            <button onClick={fetchBuses} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl">
              Retry
            </button>
          </div>
        ) : buses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Bus Number</th>
                  <th className="p-4 sm:p-5">Bus Name</th>
                  <th className="p-4 sm:p-5">Plate Number</th>
                  <th className="p-4 sm:p-5">Capacity</th>
                  <th className="p-4 sm:p-5">Bus Type</th>
                  <th className="p-4 sm:p-5">Status</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80">
                {buses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-slate-850/20 text-slate-300 transition-colors">
                    <td className="p-4 sm:p-5 font-mono text-emerald-450 font-bold">{bus.busNumber}</td>
                    <td className="p-4 sm:p-5 font-semibold text-slate-200">{bus.busName}</td>
                    <td className="p-4 sm:p-5 font-mono text-slate-450">{bus.registrationNumber}</td>
                    <td className="p-4 sm:p-5">{bus.capacity} Seats</td>
                    <td className="p-4 sm:p-5 capitalize">{bus.type?.toLowerCase().replace('_', ' ')}</td>
                    <td className="p-4 sm:p-5">{getStatusBadge(bus.status)}</td>
                    <td className="p-4 sm:p-5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(bus)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Edit Bus"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(bus._id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Bus"
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
            title="No Buses Configured"
            description="Clear search queries or click Add Bus to begin fleet setup."
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
                {editingBus ? 'Edit Bus Configuration' : 'Add New Bus'}
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
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Bus Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BUS-409"
                    {...registerField('busNumber')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
                  />
                  {errors.busNumber && <p className="text-red-400 text-[10px] mt-0.5">{errors.busNumber.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Bus Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Emerald Super Liner"
                    {...registerField('busName')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.busName && <p className="text-red-400 text-[10px] mt-0.5">{errors.busName.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider">Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. WP-ND-4920"
                  {...registerField('registrationNumber')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
                />
                {errors.registrationNumber && <p className="text-red-400 text-[10px] mt-0.5">{errors.registrationNumber.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Capacity (Seats)</label>
                  <input
                    type="number"
                    placeholder="40"
                    {...registerField('capacity')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.capacity && <p className="text-red-400 text-[10px] mt-0.5">{errors.capacity.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Bus Type</label>
                  <select
                    {...registerField('type')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
                  >
                    <option value="AC">AC</option>
                    <option value="NON_AC">Non AC</option>
                    <option value="SEMI_LUXURY">Semi Luxury</option>
                    <option value="LUXURY">Luxury</option>
                    <option value="SLEEPER">Sleeper</option>
                  </select>
                </div>
              </div>

              {editingBus && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Status</label>
                  <select
                    {...registerField('status')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingBus ? 'Update Bus' : 'Add Bus'}
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
        title="Delete Bus from Fleet?"
        description="Are you sure you want to delete this bus? Associated future travel schedules might be affected."
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
};

export default BusManagement;
