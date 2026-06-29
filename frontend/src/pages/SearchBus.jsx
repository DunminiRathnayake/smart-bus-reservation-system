import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  DollarSign,
  Sparkles,
  Map as MapIcon,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Info,
  Navigation
} from 'lucide-react';

// Sri Lankan major cities with coordinate mappings for the interactive SVG route map
const SRI_LANKA_COORDS = {
  colombo: { x: 105, y: 270, name: 'Colombo' },
  negombo: { x: 98, y: 235, name: 'Negombo' },
  kandy: { x: 145, y: 215, name: 'Kandy' },
  kurunegala: { x: 125, y: 190, name: 'Kurunegala' },
  matara: { x: 125, y: 355, name: 'Matara' },
  galle: { x: 105, y: 335, name: 'Galle' },
  ella: { x: 165, y: 260, name: 'Ella' },
  kataragama: { x: 175, y: 315, name: 'Kataragama' },
  jaffna: { x: 100, y: 45, name: 'Jaffna' },
  trincomalee: { x: 165, y: 130, name: 'Trincomalee' },
  batticaloa: { x: 195, y: 190, name: 'Batticaloa' },
  panadura: { x: 106, y: 290, name: 'Panadura' }
};

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
  const [timeOfDay, setTimeOfDay] = useState('ALL');
  const [sortBy, setSortBy] = useState('TIME_EARLIEST');

  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState(null);

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
        (s) => s.busId?.type === busType
      );
    }

    // Filter by Max Price
    result = result.filter((s) => {
      let baseFareNum = 0;
      const rawFare = s.fare || (s.routeId && s.routeId.baseFare);
      if (rawFare) {
        if (typeof rawFare === 'object' && rawFare.$numberDecimal) {
          baseFareNum = parseFloat(rawFare.$numberDecimal) || 0;
        } else {
          baseFareNum = parseFloat(rawFare) || 0;
        }
      }
      return baseFareNum <= maxPrice;
    });

    // Filter by Time of Day
    if (timeOfDay !== 'ALL') {
      result = result.filter((s) => {
        if (!s.departureTime) return false;
        const d = new Date(s.departureTime);
        if (isNaN(d.getTime())) return true;
        const hour = d.getHours();
        if (timeOfDay === 'MORNING') return hour >= 6 && hour < 12;
        if (timeOfDay === 'AFTERNOON') return hour >= 12 && hour < 17;
        if (timeOfDay === 'EVENING') return hour >= 17 && hour < 22;
        if (timeOfDay === 'NIGHT') return hour >= 22 || hour < 6;
        return true;
      });
    }

    // Sort Results
    result.sort((a, b) => {
      let fareA = 0;
      const rawFareA = a.fare || (a.routeId && a.routeId.baseFare);
      if (rawFareA) {
        fareA = typeof rawFareA === 'object' && rawFareA.$numberDecimal ? parseFloat(rawFareA.$numberDecimal) : parseFloat(rawFareA);
      }

      let fareB = 0;
      const rawFareB = b.fare || (b.routeId && b.routeId.baseFare);
      if (rawFareB) {
        fareB = typeof rawFareB === 'object' && rawFareB.$numberDecimal ? parseFloat(rawFareB.$numberDecimal) : parseFloat(rawFareB);
      }

      if (sortBy === 'PRICE_LOW') return fareA - fareB;
      if (sortBy === 'PRICE_HIGH') return fareB - fareA;

      const timeA = a.departureTime || '';
      const timeB = b.departureTime || '';
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

  // Automatically trigger search when date carousel is selected
  useEffect(() => {
    if (filters.origin && filters.destination && hasSearched) {
      fetchSchedules();
    }
  }, [filters.travelDate]);

  // Generate 7 consecutive dates around the active travelDate
  const getDateCarouselOptions = () => {
    const baseDate = filters.travelDate ? new Date(filters.travelDate) : new Date();
    if (isNaN(baseDate.getTime())) return [];
    
    const options = [];
    for (let i = -2; i <= 4; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      options.push(d);
    }
    return options;
  };

  const carouselDates = getDateCarouselOptions();

  // Map coordinates resolving for origin and destination
  const originKey = filters.origin ? filters.origin.trim().toLowerCase() : '';
  const destKey = filters.destination ? filters.destination.trim().toLowerCase() : '';
  const mapOrigin = SRI_LANKA_COORDS[originKey] || null;
  const mapDest = SRI_LANKA_COORDS[destKey] || null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Stepper progress indicator */}
      <BookingStepper currentStep={1} />

      {/* Main Search Panel - Magiya style */}
      <div className="bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 relative z-10">
          <Compass className="h-5 w-5 text-emerald-400 animate-spin-slow" /> Find Bus Departures
        </h2>

        {/* Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> From
            </label>
            <input
              type="text"
              placeholder="e.g. Negombo"
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
              placeholder="e.g. Colombo"
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
            className="flex items-center gap-2 text-xs font-semibold text-slate-450 hover:text-emerald-400 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>

          <button
            onClick={fetchSchedules}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
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
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bus Type</label>
              <select
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-xs text-slate-300"
              >
                <option value="ALL">All Types</option>
                <option value="AC">AC</option>
                <option value="NON_AC">Non-AC</option>
                <option value="LUXURY">Luxury</option>
                <option value="SEMI_LUXURY">Semi-Luxury</option>
                <option value="SLEEPER">Sleeper</option>
              </select>
            </div>

            {/* Max Price */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Max Fare: ${maxPrice}
              </label>
              <input
                type="range"
                min="1"
                max="200"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            {/* Time range */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Departure Time</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-xs text-slate-300"
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
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-xs text-slate-300"
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

      {/* Date Carousel Slider - Magiya style */}
      {hasSearched && carouselDates.length > 0 && (
        <div className="flex items-center justify-between bg-slate-900/50 border border-slate-850 p-3 rounded-2xl max-w-4xl mx-auto shadow-sm">
          <button
            onClick={() => {
              const prev = new Date(filters.travelDate);
              prev.setDate(prev.getDate() - 1);
              setFilters(f => ({ ...f, travelDate: prev.toISOString().split('T')[0] }));
            }}
            className="p-2 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>

          <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {carouselDates.map((date, idx) => {
              const formatted = date.toISOString().split('T')[0];
              const isSelected = formatted === filters.travelDate;
              const dayStr = date.toLocaleDateString([], { weekday: 'short' });
              const dateStr = date.toLocaleDateString([], { day: '2-digit', month: 'short' });

              return (
                <button
                  key={idx}
                  onClick={() => handleCarouselDateSelect(date)}
                  className={`px-4.5 py-2.5 rounded-xl border text-center transition-all min-w-[90px] ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold tracking-wider">{dayStr}</p>
                  <p className="text-xs font-semibold mt-0.5">{dateStr}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              const next = new Date(filters.travelDate);
              next.setDate(next.getDate() + 1);
              setFilters(f => ({ ...f, travelDate: next.toISOString().split('T')[0] }));
            }}
            className="p-2 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* Split Listings & Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Results Cards (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : filteredSchedules.length > 0 ? (
            <div className="space-y-4">
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
                const stopsList = schedule.routeId?.stops || [];

                return (
                  <div
                    key={String(schedule._id)}
                    className="bg-slate-900 border border-slate-850 hover:border-emerald-500/30 rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-lg flex flex-col justify-between gap-5 relative overflow-hidden"
                  >
                    {/* Top Badges / Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-850/60 pb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {schedule.routeId?.origin ? String(schedule.routeId.origin) : ''} ➔ {schedule.routeId?.destination ? String(schedule.routeId.destination) : ''}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/10 rounded">
                          {schedule.busId?.busName ? String(schedule.busId.busName) : 'SmartGo Express'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                          {schedule.busId?.type ? String(schedule.busId.type) : 'Luxury AC'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shadow-inner">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Certified Route
                      </div>
                    </div>

                    {/* Middle Core Times Details */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-1">
                      {/* Departure */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block">DEPARTURE</span>
                        <p className="text-xl font-bold font-mono text-slate-100">{formatTime(schedule.departureTime)}</p>
                        <p className="text-xs font-bold text-slate-350">{schedule.routeId?.origin ? String(schedule.routeId.origin) : ''}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{formatDate(schedule.departureTime)}</p>
                      </div>

                      {/* Travel Line */}
                      <div className="flex-grow flex flex-col items-center justify-center min-w-[120px] w-full md:w-auto mt-2 md:mt-0">
                        <div className="text-[10px] font-bold text-slate-450 mb-1 flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5 text-slate-500" /> {getDurationText(schedule)}
                        </div>
                        <div className="relative w-full h-[2px] bg-slate-800 flex items-center">
                          <div className="absolute left-0 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <div className="absolute right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-[9px] text-emerald-400 font-bold flex items-center gap-1 shadow-md">
                            <Bus className="h-3 w-3 animate-pulse" />
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500 font-semibold mt-1">Express Transit</span>
                      </div>

                      {/* Arrival */}
                      <div className="space-y-1 text-left md:text-right">
                        <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block">ARRIVAL</span>
                        <p className="text-xl font-bold font-mono text-slate-100">{formatTime(schedule.arrivalTime)}</p>
                        <p className="text-xs font-bold text-slate-350">{schedule.routeId?.destination ? String(schedule.routeId.destination) : ''}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{formatDate(schedule.arrivalTime)}</p>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-850/60 pt-3.5 mt-1">
                      {/* Left: Stop accordion & Seats counter */}
                      <div className="flex items-center gap-4.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedScheduleId(expandedScheduleId === schedule._id ? null : schedule._id);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-450 hover:text-emerald-400 transition-colors bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-xl shadow-inner"
                        >
                          <Info className="h-3.5 w-3.5" />
                          {expandedScheduleId === schedule._id ? 'Hide Stops' : 'View Stops'}
                        </button>
                        <div className="text-[11px] text-slate-450">
                          Seats Left: <span className="font-bold text-emerald-400 font-mono">{availableSeats}</span>
                        </div>
                      </div>

                      {/* Right: Price & Booking */}
                      <div className="flex items-center gap-5">
                        <div className="flex items-center font-mono font-black text-emerald-400 text-xl">
                          <DollarSign className="h-5 w-5 text-emerald-500" />
                          <span>{baseFareNum.toFixed(2)}</span>
                        </div>

                        <button
                          onClick={() => navigate(`/schedules/${schedule._id}`)}
                          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-black text-slate-950 flex items-center gap-1 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all transform active:scale-95"
                        >
                          Book Seat <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Station Accordion Details */}
                    {expandedScheduleId === schedule._id && (
                      <div className="w-full bg-slate-950/50 border border-slate-850 p-5 rounded-2xl animate-slide-in space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stations & Schedule Timeline</h4>
                        <div className="space-y-4 relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-850">
                          {/* Start Origin */}
                          <div className="relative text-xs">
                            <div className="absolute -left-[17px] top-1 h-2.5 w-2.5 bg-emerald-500 border border-slate-950 rounded-full" />
                            <span className="font-bold text-slate-355">{schedule.routeId?.origin}</span>
                            <span className="text-[10px] text-slate-500 ml-2">Departed at {formatTime(schedule.departureTime)}</span>
                          </div>
                          
                          {/* Intermediate stops */}
                          {stopsList.length > 0 ? (
                            stopsList.map((stop, sidx) => {
                              const stopName = typeof stop === 'string' ? stop : (stop?.name || '');
                              return (
                                <div key={sidx} className="relative text-xs">
                                  <div className="absolute -left-[17px] top-1 h-2.5 w-2.5 bg-slate-850 border border-slate-950 rounded-full" />
                                  <span className="text-slate-450">{stopName}</span>
                                  <span className="text-[9px] text-slate-550 ml-2">Intermediate Station</span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-[10px] text-slate-600 pl-2">Direct route with no intermediate stops.</div>
                          )}

                          {/* End Destination */}
                          <div className="relative text-xs">
                            <div className="absolute -left-[17px] top-1 h-2.5 w-2.5 bg-emerald-500 border border-slate-950 rounded-full" />
                            <span className="font-bold text-slate-355">{schedule.routeId?.destination}</span>
                            <span className="text-[10px] text-slate-500 ml-2">Arriving at {formatTime(schedule.arrivalTime)}</span>
                          </div>
                        </div>
                      </div>
                    )}
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
            <div className="bg-slate-900/30 border border-dashed border-slate-850 rounded-3xl p-10 text-center text-xs text-slate-500 max-w-md mx-auto my-6 animate-pulse">
              Specify origin, destination, and travel dates above to display matching bus schedules.
            </div>
          )}
        </div>

        {/* Right Column: Dynamic SVG Map Widget & Stats Card (1/3 width) */}
        <div className="space-y-6">
          {/* SVG Map Widget */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapIcon className="h-4.5 w-4.5 text-emerald-450" /> Route Map Preview
            </h3>

            <div className="relative bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden p-4 flex items-center justify-center min-h-[360px] shadow-inner">
              <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-bold text-slate-600 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded uppercase tracking-wider">
                <Sparkles className="h-2 w-2 text-emerald-400 animate-pulse" /> Live Tracker
              </div>

              {/* Sri Lankan SVG Interactive Map Grid */}
              <svg width="220" height="380" viewBox="0 0 220 380" className="w-full h-auto text-slate-800">
                {/* Main Sri Lanka Coast Outline */}
                <path
                  d="M 115,35 C 110,32 103,38 101,43 C 99,48 105,53 108,55 C 103,58 97,64 92,72 C 88,80 82,85 85,92 C 87,97 93,92 98,88 C 94,98 90,108 88,118 C 86,128 89,140 92,152 C 95,164 93,178 93,190 C 93,202 95,214 96,226 C 97,238 98,250 100,262 C 102,274 103,286 105,298 C 107,310 107,322 109,334 C 111,346 116,352 122,356 C 128,360 135,360 142,354 C 149,348 156,344 163,338 C 170,332 176,324 179,315 C 182,306 182,296 182,286 C 182,276 185,266 187,256 C 189,246 191,236 191,226 C 191,216 193,206 194,196 C 195,186 194,176 191,166 C 188,156 183,148 178,142 C 173,136 167,136 172,130 C 177,124 182,120 179,114 C 176,108 170,106 166,100 C 162,94 158,84 154,74 C 150,64 146,54 140,46 C 134,38 126,35 115,35 Z"
                  fill="rgba(16, 185, 129, 0.03)"
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />

                {/* Mannar Island */}
                <path
                  d="M 80,85 C 75,87 72,92 78,94 C 84,96 85,90 80,85 Z"
                  fill="rgba(16, 185, 129, 0.03)"
                  stroke="rgba(16, 185, 129, 0.25)"
                  strokeWidth="1"
                />

                {/* Delft Island */}
                <path
                  d="M 90,52 C 87,54 86,58 91,60 C 96,62 95,55 90,52 Z"
                  fill="rgba(16, 185, 129, 0.03)"
                  stroke="rgba(16, 185, 129, 0.25)"
                  strokeWidth="1"
                />

                {/* Cities Dots */}
                {Object.entries(SRI_LANKA_COORDS).map(([key, city]) => {
                  const isOrigin = key === originKey;
                  const isDest = key === destKey;
                  const isNode = isOrigin || isDest;

                  return (
                    <g key={key}>
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r={isNode ? 4.5 : 2}
                        fill={isOrigin ? '#10b981' : isDest ? '#3b82f6' : '#334155'}
                        className={isNode ? 'animate-pulse' : ''}
                      />
                      {isNode && (
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r="10"
                          fill="none"
                          stroke={isOrigin ? '#10b981' : '#3b82f6'}
                          strokeWidth="1"
                          className="animate-ping"
                          style={{ animationDuration: '3s' }}
                        />
                      )}
                      {(isNode || ['colombo', 'kandy', 'galle', 'jaffna'].includes(key)) && (
                        <text
                          x={city.x + 6}
                          y={city.y + 3}
                          fill={isNode ? '#e2e8f0' : '#475569'}
                          fontSize="8"
                          fontWeight={isNode ? 'bold' : 'normal'}
                          className="font-sans"
                        >
                          {city.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Connecting Transit Line */}
                {mapOrigin && mapDest && (
                  <g>
                    {/* Glow outline */}
                    <line
                      x1={mapOrigin.x}
                      y1={mapOrigin.y}
                      x2={mapDest.x}
                      y2={mapDest.y}
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.3"
                      className="blur-[1px]"
                    />
                    {/* Main path */}
                    <line
                      x1={mapOrigin.x}
                      y1={mapOrigin.y}
                      x2={mapDest.x}
                      y2={mapDest.y}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray="5,5"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="50;0"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </line>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Route Stats Card */}
          {mapOrigin && mapDest && (
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="h-4.5 w-4.5 text-emerald-450" /> Route Statistics
              </h4>

              <div className="space-y-3.5 text-xs text-slate-400">
                <div className="flex justify-between border-b border-slate-850/50 pb-2">
                  <span>Connection Path</span>
                  <span className="font-bold text-slate-200">{mapOrigin.name} ➔ {mapDest.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850/50 pb-2">
                  <span>Average Speed</span>
                  <span className="font-bold text-slate-200 font-mono">65 km/h</span>
                </div>
                <div className="flex justify-between border-b border-slate-850/50 pb-2">
                  <span>Transit Type</span>
                  <span className="font-bold text-emerald-400">Highway Express</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                  * Live route highlights reflect expressway connections (E01/E02) or main arterial highways. Actual transit times can vary based on local traffic conditions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBus;
