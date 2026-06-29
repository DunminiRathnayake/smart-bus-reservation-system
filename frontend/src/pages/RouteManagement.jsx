import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import routeService from '../services/routeService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import {
  Compass,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';

const routeSchema = z.object({
  routeCode: z.string().min(2, 'Route code is required (min 2 characters)'),
  routeName: z.string().min(2, 'Route name is required'),
  origin: z.string().min(2, 'Origin city is required'),
  destination: z.string().min(2, 'Destination city is required'),
  type: z.string().min(1, 'Route type is required'),
  distance: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'Distance must be at least 1 km')
  ),
  estimatedDuration: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'Estimated duration must be at least 1 minute')
  ),
  baseFare: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'Base fare must be at least $1')
  ),
  farePerKm: z.preprocess(
    (val) => Number(val),
    z.number().min(0.01, 'Fare per km must be at least $0.01')
  ),
  stopsInput: z.string().optional()
});

/**
 * Administrative Route Placements panel.
 */
const RouteManagement = () => {
  const { addToast } = useToast();

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
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
    resolver: zodResolver(routeSchema),
    defaultValues: {
      routeCode: '',
      routeName: '',
      origin: '',
      destination: '',
      type: 'EXPRESSWAY',
      distance: 100,
      estimatedDuration: 120,
      baseFare: 15,
      farePerKm: 0.15,
      stopsInput: ''
    }
  });

  const fetchRoutes = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 5,
        search: searchTerm
      };

      const response = await routeService.getRoutes(query);
      if (response.success && response.data) {
        setRoutes(response.data.routes || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load fleet routes:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRoutes();
  };

  const handleOpenAdd = () => {
    setEditingRoute(null);
    reset({
      routeCode: `RT-${Math.floor(100 + Math.random() * 900)}`,
      routeName: '',
      origin: '',
      destination: '',
      type: 'EXPRESSWAY',
      distance: 100,
      estimatedDuration: 120,
      baseFare: 15,
      farePerKm: 0.15,
      stopsInput: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setValue('routeCode', route.routeCode);
    setValue('routeName', route.routeName);
    setValue('origin', route.origin);
    setValue('destination', route.destination);
    setValue('type', route.type);
    setValue('distance', route.distance);
    setValue('estimatedDuration', route.estimatedDuration);
    setValue('baseFare', route.baseFare);
    setValue('farePerKm', route.farePerKm || 0.15);
    setValue('stopsInput', route.stops?.map((s) => s.name).join(', ') || '');
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const stopsList = data.stopsInput
      ? data.stopsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    
    const stopsCount = stopsList.length;
    const stops = stopsList.map((stopName, idx) => {
      const order = idx + 1;
      const fraction = order / (stopsCount + 1);
      return {
        name: stopName,
        order,
        distanceFromOrigin: Number((data.distance * fraction).toFixed(2)),
        estimatedArrivalOffset: Math.round(data.estimatedDuration * fraction)
      };
    });

    const payload = {
      routeCode: data.routeCode,
      routeName: data.routeName,
      origin: data.origin,
      destination: data.destination,
      type: data.type,
      distance: data.distance,
      estimatedDuration: data.estimatedDuration,
      baseFare: data.baseFare,
      farePerKm: data.farePerKm,
      stops
    };

    try {
      if (editingRoute) {
        const response = await routeService.updateRoute(editingRoute._id, payload);
        if (response.success) {
          addToast('Route settings updated.', 'success');
          setModalOpen(false);
          fetchRoutes();
        } else {
          addToast(response.message || 'Update failed.', 'error');
        }
      } else {
        const response = await routeService.createRoute(payload);
        if (response.success) {
          addToast('New route configured successfully.', 'success');
          setModalOpen(false);
          fetchRoutes();
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
      const response = await routeService.deleteRoute(selectedDeleteId);
      if (response.success) {
        addToast('Route removed from active listings.', 'success');
        fetchRoutes();
      } else {
        addToast(response.message || 'Deletion failed.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Error soft-deleting route.', 'error');
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Compass className="h-6 w-6 text-emerald-400" /> Route Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">Setup route terminals, intermediate stops, distances, and base ticket prices.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" /> Add Route Path
        </button>
      </div>

      {/* Search panel */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search terminal cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
        </div>

        <button type="submit" className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs font-semibold rounded-xl text-slate-300">
          Search Paths
        </button>
      </form>

      {/* Routes Table */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="list" count={3} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-slate-300 text-sm">Failed to retrieve route listings.</p>
            <button onClick={fetchRoutes} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl">
              Retry
            </button>
          </div>
        ) : routes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Code</th>
                  <th className="p-4 sm:p-5">Route Name</th>
                  <th className="p-4 sm:p-5">Terminals</th>
                  <th className="p-4 sm:p-5">Stops</th>
                  <th className="p-4 sm:p-5">Distance / Duration</th>
                  <th className="p-4 sm:p-5">Base Fare</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80">
                {routes.map((route) => (
                  <tr key={route._id} className="hover:bg-slate-850/20 text-slate-300 transition-colors">
                    <td className="p-4 sm:p-5 font-mono text-emerald-450 font-bold">{route.routeCode}</td>
                    <td className="p-4 sm:p-5 font-semibold text-slate-200">{route.routeName}</td>
                    <td className="p-4 sm:p-5 font-semibold text-slate-300">
                      {route.origin} ➔ {route.destination}
                    </td>
                    <td className="p-4 sm:p-5 text-slate-450 truncate max-w-[150px]">
                      {route.stops?.length > 0 ? route.stops.map((s) => s.name).join(', ') : 'Direct route'}
                    </td>
                    <td className="p-4 sm:p-5">
                      {route.distance} km / <span className="font-semibold text-slate-400">{formatDuration(route.estimatedDuration)}</span>
                    </td>
                    <td className="p-4 sm:p-5 font-mono text-emerald-400 font-bold">${route.baseFare?.toFixed(2)}</td>
                    <td className="p-4 sm:p-5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(route)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Edit Route"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(route._id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Route"
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
            title="No Routes Configured"
            description="Clear search filters or click Add Route Path to register stations."
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
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl shadow-xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 relative z-10">
              <h3 className="text-base font-bold text-slate-200">
                {editingRoute ? 'Edit Route Path' : 'Add Route Path'}
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
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Route Code</label>
                  <input
                    type="text"
                    placeholder="e.g. RT-COL-GAL"
                    {...registerField('routeCode')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
                  />
                  {errors.routeCode && <p className="text-red-400 text-[10px] mt-0.5">{errors.routeCode.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Route Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo - Galle Express"
                    {...registerField('routeName')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.routeName && <p className="text-red-400 text-[10px] mt-0.5">{errors.routeName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Departure Station</label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo"
                    {...registerField('origin')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.origin && <p className="text-red-400 text-[10px] mt-0.5">{errors.origin.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-450 uppercase tracking-wider">Arrival Station</label>
                  <input
                    type="text"
                    placeholder="e.g. Galle"
                    {...registerField('destination')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.destination && <p className="text-red-400 text-[10px] mt-0.5">{errors.destination.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Distance (km)</label>
                  <input
                    type="number"
                    placeholder="120"
                    {...registerField('distance')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.distance && <p className="text-red-400 text-[10px] mt-0.5">{errors.distance.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Duration (mins)</label>
                  <input
                    type="number"
                    placeholder="120"
                    {...registerField('estimatedDuration')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.estimatedDuration && <p className="text-red-400 text-[10px] mt-0.5">{errors.estimatedDuration.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Base Fare ($)</label>
                  <input
                    type="number"
                    placeholder="15"
                    {...registerField('baseFare')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.baseFare && <p className="text-red-400 text-[10px] mt-0.5">{errors.baseFare.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Fare per KM ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.15"
                    {...registerField('farePerKm')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.farePerKm && <p className="text-red-400 text-[10px] mt-0.5">{errors.farePerKm.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-455 uppercase tracking-wider">Route Type</label>
                  <select
                    {...registerField('type')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
                  >
                    <option value="EXPRESSWAY">Expressway</option>
                    <option value="INTERCITY">Intercity</option>
                    <option value="CITY_TO_CITY">City to City</option>
                    <option value="LOCAL">Local</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                  Intermediate Stops <span className="text-[9px] text-slate-550 font-normal normal-case">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kalutara, Hikkaduwa"
                  {...registerField('stopsInput')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingRoute ? 'Update Path' : 'Add Path'}
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
        title="Delete Route Path?"
        description="Are you sure you want to remove this route? Associated schedules will lack route info."
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
};

export default RouteManagement;
