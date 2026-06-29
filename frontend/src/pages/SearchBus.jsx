import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import scheduleService from '../services/scheduleService';
import BookingStepper from '../components/common/BookingStepper';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import {
  Search,
  Compass,
  Calendar,
  Clock,
  Bus,
  MapPin,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  DollarSign
} from 'lucide-react';

const formatTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return String(isoString);
  }
};

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return String(isoString);
  }
};

const getDurationText = (schedule) => {
  try {
    if (schedule.routeId?.estimatedDuration) {
      const minutes = Number(schedule.routeId.estimatedDuration);
      if (!isNaN(minutes)) {
        const hrs = minutes / 60;
        return `${Number(hrs.toFixed(2))}h`;
      }
    }
    if (schedule.departureTime && schedule.arrivalTime) {
      const dep = new Date(schedule.departureTime);
      const arr = new Date(schedule.arrivalTime);
      if (!isNaN(dep.getTime()) && !isNaN(arr.getTime())) {
        const diffMs = arr - dep;
        const diffMins = Math.round(diffMs / 60000);
        const hrs = diffMins / 60;
        return `${Number(hrs.toFixed(2))}h`;
      }
    }
  } catch (e) {
    console.error('Error getting duration text:', e);
  }
  return 'N/A';
};

/**
 * Main Search Bus page with filters, sorting list, available seats count, and detail redirection.
 */
const SearchBus = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary filters
  const [filters, setFilters] = useState({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    travelDate: searchParams.get('travelDate') || ''
  });

  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busType, setBusType] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(100);
  const [timeOfDay, setTimeOfDay] = useState('ALL'); // 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'
  const [sortBy, setSortBy] = useState('TIME_EARLIEST'); // 'PRICE_LOW' | 'PRICE_HIGH' | 'TIME_EARLIEST' | 'TIME_LATEST'

  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchSchedules = async () => {
    if (!filters.origin || !filters.destination) {
      addToast('Please enter both origin and destination cities.', 'warning');
      return;
    }
    setLoading(true);
    setHasSearched(true);

    // Sync query params in browser URL bar
    setSearchParams({
      origin: filters.origin,
      destination: filters.destination,
      travelDate: filters.travelDate
    });

    try {
      const response = await scheduleService.getSchedules({
        origin: filters.origin,
        destination: filters.destination,
        travelDate: filters.travelDate,
        limit: 100 // Fetch all matches to perform rich client-side filters
      });

      if (response.success) {
        setSchedules(response.data.schedules || []);
      } else {
        addToast(response.message || 'Failed to search schedules.', 'error');
      }
    } catch (error) {
      console.error('Fetch schedules error:', error);
      const msg = error.response?.data?.message || error.normalizedMessage || error.message || 'An error occurred while fetching bus departures.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Perform client-side filter sorting
  useEffect(() => {
    let result = [...schedules];

    // Filter by Bus Type
    if (busType !== 'ALL') {
      result = result.filter(
        (s) => s.busId?.busType === busType
      );
    }

    // Filter by Max Price
    result = result.filter(
      (s) => (s.fare || (s.routeId && s.routeId.fare) || 0) <= maxPrice
    );

    // Filter by Time of Day
    if (timeOfDay !== 'ALL') {
      result = result.filter((s) => {
        if (!s.departureTime) return false;
        const hour = parseInt(s.departureTime.split(':')[0], 10);
        if (timeOfDay === 'MORNING') return hour >= 6 && hour < 12;
        if (timeOfDay === 'AFTERNOON') return hour >= 12 && hour < 17;
        if (timeOfDay === 'EVENING') return hour >= 17 && hour < 22;
        if (timeOfDay === 'NIGHT') return hour >= 22 || hour < 6;
        return true;
      });
    }

    // Sort Results
    result.sort((a, b) => {
      const fareA = a.fare || (a.routeId && a.routeId.fare) || 0;
      const fareB = b.fare || (b.routeId && b.routeId.fare) || 0;

      if (sortBy === 'PRICE_LOW') return fareA - fareB;
      if (sortBy === 'PRICE_HIGH') return fareB - fareA;

      const timeA = a.departureTime || '00:00';
      const timeB = b.departureTime || '00:00';
      if (sortBy === 'TIME_EARLIEST') return timeA.localeCompare(timeB);
      if (sortBy === 'TIME_LATEST') return timeB.localeCompare(timeA);

      return 0;
    });

    setFilteredSchedules(result);
  }, [schedules, busType, maxPrice, timeOfDay, sortBy]);

  // Trigger search on mount if URL search queries are provided
  useEffect(() => {
    if (filters.origin && filters.destination) {
      fetchSchedules();
    }
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Stepper progress indicator */}
      <BookingStepper currentStep={1} />

      {/* Main Search Panel */}
      <div className="bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 relative z-10">
          <Compass className="h-5 w-5 text-emerald-400" /> Find Bus Departures
        </h2>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> From
            </label>
            <input
              type="text"
              placeholder="e.g. Colombo"
              value={filters.origin}
              onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 text-sm text-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> To
            </label>
            <input
              type="text"
              placeholder="e.g. Kandy"
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 text-sm text-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Travel Date
            </label>
            <input
              type="date"
              value={filters.travelDate}
              onChange={(e) => setFilters({ ...filters, travelDate: e.target.value })}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 text-sm text-slate-200"
            />
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-850/80 relative z-10">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>

          <button
            onClick={fetchSchedules}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/10"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Departures'}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mt-6 pt-6 border-t border-slate-850/80 relative z-10 animate-slide-in">
            {/* Bus Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Bus Type</label>
              <select
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-xs text-slate-350"
              >
                <option value="ALL">All Types</option>
                <option value="AC_LUXURY">AC Luxury</option>
                <option value="SUPER_LUXURY">Super Luxury</option>
                <option value="AC_SEMI_LUXURY">AC Semi Luxury</option>
                <option value="NORMAL">Normal</option>
              </select>
            </div>

            {/* Max Price */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">
                Max Fare: ${maxPrice}
              </label>
              <input
                type="range"
                min="5"
                max="200"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            {/* Time range */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Departure Time</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-xs text-slate-355"
              >
                <option value="ALL">Any Time</option>
                <option value="MORNING">Morning (6 AM - 12 PM)</option>
                <option value="AFTERNOON">Afternoon (12 PM - 5 PM)</option>
                <option value="EVENING">Evening (5 PM - 10 PM)</option>
                <option value="NIGHT">Night (10 PM - 6 AM)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-xs text-slate-355"
              >
                <option value="TIME_EARLIEST">Time: Earliest Departure</option>
                <option value="TIME_LATEST">Time: Latest Departure</option>
                <option value="PRICE_LOW">Price: Low to High</option>
                <option value="PRICE_HIGH">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Listings */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : filteredSchedules.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredSchedules.map((schedule) => {
              // Ensure baseFare is a safe numeric representation or fallback
              let baseFareNum = 0;
              const rawFare = schedule.fare || (schedule.routeId && schedule.routeId.baseFare);
              if (rawFare) {
                if (typeof rawFare === 'object' && rawFare.$numberDecimal) {
                  baseFareNum = parseFloat(rawFare.$numberDecimal) || 0;
                } else if (typeof rawFare === 'object' && rawFare.toString) {
                  baseFareNum = parseFloat(rawFare.toString()) || 0;
                } else {
                  baseFareNum = parseFloat(rawFare) || 0;
                }
              }

              const availableSeats = schedule.availableSeats !== undefined ? Number(schedule.availableSeats) : 40;

              return (
                <div
                  key={String(schedule._id)}
                  className="bg-slate-900 border border-slate-850 hover:border-emerald-500/30 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:translate-x-1"
                >
                  <div className="space-y-3.5 flex-grow">
                    {/* Header: Bus Info */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 rounded-md">
                        {schedule.busId?.busName ? String(schedule.busId.busName) : 'SmartGo Express'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">
                        {schedule.busId?.type ? String(schedule.busId.type) : 'Luxury AC'}
                      </span>
                    </div>

                    {/* Main Timing Details */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span>{formatTime(schedule.departureTime)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold">{formatDate(schedule.departureTime)}</p>
                        <p className="text-xs font-bold text-slate-300 mt-1">{schedule.routeId?.origin ? String(schedule.routeId.origin) : ''}</p>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-emerald-500/40" />

                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span>{formatTime(schedule.arrivalTime)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold">{formatDate(schedule.arrivalTime)}</p>
                        <p className="text-xs font-bold text-slate-300 mt-1">{schedule.routeId?.destination ? String(schedule.routeId.destination) : ''}</p>
                      </div>

                      <div className="border-l border-slate-800 pl-4 sm:pl-6 text-xs text-slate-400">
                        <p>Duration: <span className="font-semibold text-slate-300">{getDurationText(schedule)}</span></p>
                        <p className="mt-0.5">Seats Left: <span className="font-bold text-emerald-400 font-mono">{availableSeats}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing / Booking Trigger */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-850 pt-4 md:pt-0 gap-4">
                    <div className="flex items-center text-xl font-mono font-black text-emerald-400">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                      <span>{baseFareNum.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/schedules/${schedule._id}`)}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/10"
                    >
                      View Details <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSearched ? (
          <EmptyState
            title="No Bus Departures Found"
            description="Adjust your search criteria, choose a different travel date, or clear advanced filters to find more routes."
          />
        ) : (
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-10 text-center text-xs text-slate-500 max-w-md mx-auto">
            Specify origin, destination, and travel dates above to display matching bus schedules.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBus;
