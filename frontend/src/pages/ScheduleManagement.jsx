import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import scheduleService from '../services/scheduleService';
import busService from '../services/busService';
import routeService from '../services/routeService';
import driverService from '../services/driverService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import {
  CalendarDays,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Clock,
  Compass,
  Bus,
  UserCheck
} from 'lucide-react';

const scheduleSchema = z.object({
  scheduleCode: z.string().min(2, 'Schedule code is required (min 2 characters)'),
  busId: z.string().min(1, 'Bus selection is required'),
  routeId: z.string().min(1, 'Route selection is required'),
  driverId: z.string().min(1, 'Driver selection is required'),
  travelDateInput: z.string().min(1, 'Travel date is required'),
  departureTimeInput: z.string().min(1, 'Departure time is required'),
  arrivalTimeInput: z.string().min(1, 'Arrival time is required'),
  boardingTimeInput: z.string().min(1, 'Boarding time is required'),
  fare: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'Fare override must be at least $1')
  ),
  status: z.string().optional()
});

/**
 * Schedule configurations panel.
 */
const ScheduleManagement = () => {
  const { addToast } = useToast();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Lists options
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDays, setRecurrenceDays] = useState(30);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      scheduleCode: '',
      busId: '',
      routeId: '',
      driverId: '',
      travelDateInput: '',
      departureTimeInput: '08:00',
      arrivalTimeInput: '12:00',
      boardingTimeInput: '07:45',
      fare: 15,
      status: 'SCHEDULED'
    }
  });

  // Watch routeId to automatically prefill standard route fare
  const watchedRouteId = watch('routeId');
  useEffect(() => {
    if (watchedRouteId && routes.length > 0 && !editingSchedule) {
      const selectedRoute = routes.find((r) => r._id === watchedRouteId);
      if (selectedRoute) {
        setValue('fare', selectedRoute.baseFare || selectedRoute.fare);
      }
    }
  }, [watchedRouteId, routes, editingSchedule, setValue]);

  // Set travelDateInput to today's date when isRecurring is checked
  useEffect(() => {
    if (isRecurring && !editingSchedule) {
      setValue('travelDateInput', new Date().toISOString().split('T')[0]);
    }
  }, [isRecurring, editingSchedule, setValue]);

  const loadResources = async () => {
    try {
      const [busesRes, routesRes, driversRes] = await Promise.all([
        busService.getBuses({ limit: 100, status: 'ACTIVE' }),
        routeService.getRoutes({ limit: 100 }),
        driverService.getDrivers({ limit: 100, status: 'ACTIVE' })
      ]);
      if (busesRes.success) setBuses(busesRes.data.buses || []);
      if (routesRes.success) setRoutes(routesRes.data.routes || []);
      if (driversRes.success) setDrivers(driversRes.data.drivers || []);
    } catch (err) {
      console.error('Failed to load schedule creation dropdown dependencies:', err);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 5,
        search: searchTerm
      };
      if (statusFilter !== 'ALL') query.status = statusFilter;

      const response = await scheduleService.getSchedules(query);
      if (response.success && response.data) {
        setSchedules(response.data.schedules || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load travel schedules:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
    fetchSchedules();
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSchedules();
  };

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setIsRecurring(false);
    setRecurrenceDays(30);
    reset({
      scheduleCode: `SC-${Math.floor(1000 + Math.random() * 9000)}`,
      busId: buses[0]?._id || '',
      routeId: routes[0]?._id || '',
      driverId: drivers[0]?._id || '',
      travelDateInput: new Date().toISOString().split('T')[0],
      departureTimeInput: '08:00',
      arrivalTimeInput: '12:00',
      boardingTimeInput: '07:45',
      fare: routes[0]?.baseFare || 15,
      status: 'SCHEDULED'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    setEditingSchedule(schedule);
    
    // Parse ISO dates back to HTML local strings for form inputs
    const travelDateStr = new Date(schedule.travelDate).toISOString().split('T')[0];
    const depTimeStr = new Date(schedule.departureTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const arrTimeStr = new Date(schedule.arrivalTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const brdTimeStr = new Date(schedule.boardingTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    setValue('scheduleCode', schedule.scheduleCode);
    setValue('busId', schedule.busId?._id);
    setValue('routeId', schedule.routeId?._id);
    setValue('driverId', schedule.driverId?._id);
    setValue('travelDateInput', travelDateStr);
    setValue('departureTimeInput', depTimeStr);
    setValue('arrivalTimeInput', arrTimeStr);
    setValue('boardingTimeInput', brdTimeStr);
    setValue('fare', schedule.fare);
    setValue('status', schedule.status);
    
    setModalOpen(true);
  };

  // Combines date and time inputs into ISO 8601 formats
  const createISODatetime = (dateInput, timeInput) => {
    const [hours, minutes] = timeInput.split(':');
    const dateObj = new Date(dateInput);
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return dateObj.toISOString();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      if (editingSchedule) {
        const travelDate = new Date(data.travelDateInput).toISOString();
        const departureTime = createISODatetime(data.travelDateInput, data.departureTimeInput);
        const arrivalTime = createISODatetime(data.travelDateInput, data.arrivalTimeInput);
        const boardingTime = createISODatetime(data.travelDateInput, data.boardingTimeInput);

        const payload = {
          scheduleCode: data.scheduleCode,
          busId: data.busId,
          routeId: data.routeId,
          driverId: data.driverId,
          travelDate,
          departureTime,
          arrivalTime,
          boardingTime,
          fare: data.fare,
          status: data.status
        };

        const response = await scheduleService.updateSchedule(editingSchedule._id, payload);
        if (response.success) {
          addToast('Trip schedule updated.', 'success');
          setModalOpen(false);
          fetchSchedules();
        } else {
          addToast(response.message || 'Update failed.', 'error');
        }
      } else {
        // Create Mode
        const daysToCreate = isRecurring ? recurrenceDays : 1;
        let createdCount = 0;

        for (let i = 0; i < daysToCreate; i++) {
          const baseDate = new Date(data.travelDateInput);
          baseDate.setDate(baseDate.getDate() + i);
          const dateString = baseDate.toISOString().split('T')[0];

          const travelDate = new Date(dateString).toISOString();
          const departureTime = createISODatetime(dateString, data.departureTimeInput);
          const arrivalTime = createISODatetime(dateString, data.arrivalTimeInput);
          const boardingTime = createISODatetime(dateString, data.boardingTimeInput);

          // Generate code
          const codeSuffix = isRecurring ? `-${i + 1}` : '';
          const scheduleCode = `${data.scheduleCode}${codeSuffix}`;

          const payload = {
            scheduleCode,
            busId: data.busId,
            routeId: data.routeId,
            driverId: data.driverId,
            travelDate,
            departureTime,
            arrivalTime,
            boardingTime,
            fare: data.fare,
            status: data.status
          };

          const response = await scheduleService.createSchedule(payload);
          if (response.success) {
            createdCount++;
          } else {
            throw new Error(`Day ${i + 1} (${dateString}) failed: ${response.message || 'Overlap conflict'}`);
          }
        }

        addToast(
          isRecurring 
            ? `Successfully generated ${createdCount} daily schedules and mapped seats.` 
            : 'New trip schedule registered and seats mapped successfully.', 
          'success'
        );
        setModalOpen(false);
        fetchSchedules();
      }
    } catch (err) {
      addToast(err.message || err.normalizedMessage || 'Overlapping conflicts or details mismatches.', 'error');
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
      const response = await scheduleService.deleteSchedule(selectedDeleteId);
      if (response.success) {
        addToast('Schedule cancelled.', 'success');
        fetchSchedules();
      } else {
        addToast(response.message || 'Deactivation failed.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Error removing schedule.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      SCHEDULED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      BOARDING: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
      DEPARTED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      ARRIVED: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      COMPLETED: 'bg-slate-800 text-slate-400 border border-slate-750',
      CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20'
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
            <CalendarDays className="h-6 w-6 text-emerald-400" /> Schedule Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">Create travel schedules, coordinate drivers assignments, and manage seat configurations.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" /> Add Schedule
        </button>
      </div>

      {/* Search panel */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search schedule codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-555" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-505">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-350"
          >
            <option value="ALL">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="BOARDING">Boarding</option>
            <option value="DEPARTED">Departed</option>
            <option value="ARRIVED">Arrived</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <button type="submit" className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs font-semibold rounded-xl text-slate-300">
          Search
        </button>
      </form>

      {/* Schedules Table */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="list" count={3} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-slate-300 text-sm">Failed to load schedule list.</p>
            <button onClick={fetchSchedules} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl">
              Retry
            </button>
          </div>
        ) : schedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Code</th>
                  <th className="p-4 sm:p-5">Route details</th>
                  <th className="p-4 sm:p-5">Bus & Driver</th>
                  <th className="p-4 sm:p-5">Travel Date / Time</th>
                  <th className="p-4 sm:p-5">Seats Booking</th>
                  <th className="p-4 sm:p-5">Status</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80">
                {schedules.map((item) => {
                  const trDate = item.travelDate ? new Date(item.travelDate).toLocaleDateString() : 'N/A';
                  const depTime = item.departureTime ? new Date(item.departureTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'N/A';

                  return (
                    <tr key={item._id} className="hover:bg-slate-850/20 text-slate-300 transition-colors">
                      <td className="p-4 sm:p-5 font-mono text-emerald-400 font-bold">{item.scheduleCode}</td>
                      <td className="p-4 sm:p-5 font-semibold text-slate-200">
                        {item.routeId?.origin} ➔ {item.routeId?.destination}
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="space-y-0.5">
                          <p>{item.busId?.busName || 'Cruiser'}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{item.driverId?.fullName || 'Conductor'}</p>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="space-y-0.5">
                          <p className="font-semibold">{trDate}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{depTime}</p>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 font-semibold">
                        {item.bookedSeats} / {item.totalSeats} seats
                      </td>
                      <td className="p-4 sm:p-5">{getStatusBadge(item.status)}</td>
                      <td className="p-4 sm:p-5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Edit Schedule"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item._id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                          title="Cancel Schedule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Schedules Registered"
            description="Clear search queries or click Add Schedule to configure travel schedules."
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
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-850 rounded-3xl shadow-xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 relative z-10">
              <h3 className="text-base font-bold text-slate-200">
                {editingSchedule ? 'Edit Trip Schedule' : 'Add Trip Schedule'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-250 font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10 text-xs text-slate-350">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Schedule Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SC-1042"
                    {...registerField('scheduleCode')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
                  />
                  {errors.scheduleCode && <p className="text-red-400 text-[10px] mt-0.5">{errors.scheduleCode.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Base Fare ($)</label>
                  <input
                    type="number"
                    placeholder="15"
                    {...registerField('fare')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.fare && <p className="text-red-400 text-[10px] mt-0.5">{errors.fare.message}</p>}
                </div>
              </div>

              {/* Selections drops */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Bus className="h-3.5 w-3.5" /> Select Bus</span>
                  <select
                    {...registerField('busId')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
                  >
                    <option value="">Choose active vehicle</option>
                    {buses.map((b) => (
                      <option key={b._id} value={b._id}>{b.busName} ({b.capacity} seats)</option>
                    ))}
                  </select>
                  {errors.busId && <p className="text-red-400 text-[10px] mt-0.5">{errors.busId.message}</p>}
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Compass className="h-3.5 w-3.5" /> Select Route</span>
                  <select
                    {...registerField('routeId')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
                  >
                    <option value="">Choose route path</option>
                    {routes.map((r) => (
                      <option key={r._id} value={r._id}>{r.origin} ➔ {r.destination} (${r.baseFare})</option>
                    ))}
                  </select>
                  {errors.routeId && <p className="text-red-400 text-[10px] mt-0.5">{errors.routeId.message}</p>}
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> Select Driver</span>
                  <select
                    {...registerField('driverId')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
                  >
                    <option value="">Choose conductor operator</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>{d.fullName} ({d.licenseNumber})</option>
                    ))}
                  </select>
                  {errors.driverId && <p className="text-red-400 text-[10px] mt-0.5">{errors.driverId.message}</p>}
                </div>
              </div>
              
              {/* Date & times grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {!isRecurring && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Travel Date</label>
                    <input
                      type="date"
                      {...registerField('travelDateInput')}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                    />
                    {errors.travelDateInput && <p className="text-red-400 text-[10px] mt-0.5">{errors.travelDateInput.message}</p>}
                  </div>
                )}
 
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Departure Time</label>
                  <input
                    type="time"
                    {...registerField('departureTimeInput')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.departureTimeInput && <p className="text-red-400 text-[10px] mt-0.5">{errors.departureTimeInput.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Boarding Time</label>
                  <input
                    type="time"
                    {...registerField('boardingTimeInput')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.boardingTimeInput && <p className="text-red-400 text-[10px] mt-0.5">{errors.boardingTimeInput.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Arrival Time</label>
                  <input
                    type="time"
                    {...registerField('arrivalTimeInput')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  {errors.arrivalTimeInput && <p className="text-red-400 text-[10px] mt-0.5">{errors.arrivalTimeInput.message}</p>}
                </div>
              </div>
 
              {!editingSchedule && (
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl space-y-3 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="rounded accent-emerald-500 bg-slate-900 border-slate-800 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                    />
                    <label htmlFor="isRecurring" className="font-bold text-slate-300 cursor-pointer uppercase tracking-wider text-[10px]">
                      Repeat Daily (Auto-Scheduler)
                    </label>
                  </div>
                  
                  {isRecurring && (
                    <div className="space-y-1 animate-slide-in">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Duration</span>
                      <select
                        value={recurrenceDays}
                        onChange={(e) => setRecurrenceDays(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-300 text-xs"
                      >
                        <option value={30}>Repeat daily for 30 days</option>
                        <option value={14}>Repeat daily for 14 days</option>
                        <option value={7}>Repeat daily for 7 days</option>
                      </select>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        This will automatically assign this bus, driver, and route path starting from today's date daily for the selected timeframe.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {editingSchedule && (
                <div className="space-y-1.5 pt-2">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Schedule Status</label>
                  <select
                    {...registerField('status')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-355"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="BOARDING">Boarding</option>
                    <option value="DEPARTED">Departed</option>
                    <option value="ARRIVED">Arrived</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingSchedule ? 'Update Schedule' : 'Create & Map Seats'}
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
        title="Cancel Travel Schedule?"
        description="Are you sure you want to cancel this trip schedule? Confirmed bookings will automatically trigger notifications."
        confirmText="Confirm Cancel"
        type="danger"
      />
    </div>
  );
};

export default ScheduleManagement;
