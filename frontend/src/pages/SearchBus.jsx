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
  colombo: { x: 75, y: 270, name: 'Colombo' },
  negombo: { x: 70, y: 235, name: 'Negombo' },
  kandy: { x: 120, y: 215, name: 'Kandy' },
  kurunegala: { x: 105, y: 190, name: 'Kurunegala' },
  matara: { x: 115, y: 360, name: 'Matara' },
  galle: { x: 92, y: 345, name: 'Galle' },
  ella: { x: 145, y: 260, name: 'Ella' },
  kataragama: { x: 155, y: 315, name: 'Kataragama' },
  jaffna: { x: 100, y: 45, name: 'Jaffna' },
  trincomalee: { x: 165, y: 130, name: 'Trincomalee' },
  batticaloa: { x: 180, y: 190, name: 'Batticaloa' },
  panadura: { x: 77, y: 290, name: 'Panadura' }
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
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // Dynamic loading of Leaflet assets
  useEffect(() => {
    // CSS
    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    // JS
    if (!document.getElementById('leaflet-js-cdn')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js-cdn';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setIsLeafletLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsLeafletLoaded(true);
    }
  }, []);

  // Map instance management
  useEffect(() => {
    if (!isLeafletLoaded) return;

    const SRI_LANKA_LAT_LNGS = {
      colombo: [6.9271, 79.8612],
      negombo: [7.2089, 79.8353],
      kandy: [7.2906, 80.6337],
      kurunegala: [7.4863, 80.3647],
      matara: [5.9549, 80.5550],
      galle: [6.0535, 80.2210],
      ella: [6.8667, 81.0466],
      kataragama: [6.4132, 81.3326],
      jaffna: [9.6615, 80.0255],
      trincomalee: [8.5873, 81.2152],
      batticaloa: [7.7170, 81.7010],
      panadura: [6.7106, 79.9074]
    };

    const container = document.getElementById('leaflet-map-container');
    if (!container) return;

    if (window.leafletMapInstance) {
      window.leafletMapInstance.remove();
      window.leafletMapInstance = null;
    }

    const map = window.L.map('leaflet-map-container', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([7.8731, 80.7718], 7.5);

    window.leafletMapInstance = map;

    // Satellite view matching Magiya theme
    window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
    }).addTo(map);

    const originKey = filters.origin ? filters.origin.trim().toLowerCase() : '';
    const destKey = filters.destination ? filters.destination.trim().toLowerCase() : '';
    const mapOrigin = SRI_LANKA_LAT_LNGS[originKey];
    const mapDest = SRI_LANKA_LAT_LNGS[destKey];

    if (mapOrigin && mapDest) {
      const originMarker = window.L.marker(mapOrigin).addTo(map);
      originMarker.bindPopup(`<b>Start</b>: ${filters.origin}`).openPopup();

      const destMarker = window.L.marker(mapDest).addTo(map);
      destMarker.bindPopup(`<b>End</b>: ${filters.destination}`);

      const polyline = window.L.polyline([mapOrigin, mapDest], {
        color: '#5F73F2', // Solid periwinkle-blue connector
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [isLeafletLoaded, filters.origin, filters.destination, filteredSchedules]);

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
            <select
              value={filters.origin}
              onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 text-sm text-slate-200"
            >
              <option value="">Select Departure City</option>
              {['Colombo', 'Negombo', 'Kandy', 'Kurunegala', 'Matara', 'Galle', 'Ella', 'Kataragama', 'Jaffna', 'Trincomalee', 'Batticaloa', 'Panadura'].map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> To
            </label>
            <select
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 text-sm text-slate-200"
            >
              <option value="">Select Destination City</option>
              {['Colombo', 'Negombo', 'Kandy', 'Kurunegala', 'Matara', 'Galle', 'Ella', 'Kataragama', 'Jaffna', 'Trincomalee', 'Batticaloa', 'Panadura'].map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
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
        <div className="flex items-center justify-between bg-slate-900/40 border border-slate-850 p-2.5 rounded-2xl max-w-4xl mx-auto shadow-lg mb-6">
          <button
            onClick={() => {
              const prev = new Date(filters.travelDate);
              prev.setDate(prev.getDate() - 1);
              setFilters(f => ({ ...f, travelDate: prev.toISOString().split('T')[0] }));
            }}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
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
                  className={`px-5 py-2 rounded-xl text-center transition-all min-w-[100px] border ${
                    isSelected
                      ? 'bg-[#5F73F2] border-[#5F73F2] text-white font-bold shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <p className="text-[10px] uppercase font-semibold tracking-wider opacity-75">{dayStr}</p>
                  <p className="text-xs font-bold mt-0.5">{dateStr}</p>
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
                    className="bg-[#18181C] border border-[#26262B] rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-xl flex flex-col gap-4.5 relative overflow-hidden"
                  >
                    {/* Header: Magiya Style (Kandy - Colombo NCG Express • Super Luxury) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/40">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-extrabold text-slate-100">
                          {schedule.routeId?.origin ? String(schedule.routeId.origin) : ''} - {schedule.routeId?.destination ? String(schedule.routeId.destination) : ''}
                        </span>
                        <span className="text-slate-500 font-medium font-sans">
                          {schedule.busId?.busName ? String(schedule.busId.busName) : 'NCG Express'} • {schedule.busId?.type ? String(schedule.busId.type) : 'Super Luxury'}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shadow-inner ml-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Certified
                        </div>
                      </div>
                      
                      {/* Rating Label (Magiya style 0.0 star badge) */}
                      <div className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                        <span>0.0</span>
                        <span className="text-[10px] text-yellow-600">★</span>
                      </div>
                    </div>

                    {/* Main Row: Departure / Connection / Arrival / Action */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center py-1">
                      {/* Departure Block */}
                      <div className="space-y-1.5">
                        <p className="text-2xl font-black text-indigo-400 tracking-tight font-mono">{formatTime(schedule.departureTime)}</p>
                        <span className="inline-block text-[8px] font-extrabold text-slate-400 bg-slate-800 px-2 py-0.5 rounded tracking-widest uppercase">DEPARTURE</span>
                        <p className="text-xs font-extrabold text-slate-200 mt-1">{schedule.routeId?.origin ? String(schedule.routeId.origin) : ''}</p>
                        <p className="text-[9px] text-slate-500 font-semibold">{formatDate(schedule.departureTime)}</p>
                      </div>

                      {/* Travel Line Connector */}
                      <div className="flex flex-col items-center justify-center w-full">
                        <div className="relative w-full h-[1.5px] bg-slate-800 flex items-center">
                          <div className="absolute right-0 translate-x-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">→</div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold mt-2 font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" /> {getDurationText(schedule)}
                        </span>
                      </div>

                      {/* Arrival Block */}
                      <div className="space-y-1.5 md:pl-4">
                        <p className="text-2xl font-black text-indigo-400 tracking-tight font-mono">{formatTime(schedule.arrivalTime)}</p>
                        <span className="inline-block text-[8px] font-extrabold text-slate-400 bg-slate-800 px-2 py-0.5 rounded tracking-widest uppercase">ARRIVAL</span>
                        <p className="text-xs font-extrabold text-slate-200 mt-1">{schedule.routeId?.destination ? String(schedule.routeId.destination) : ''}</p>
                        <p className="text-[9px] text-slate-500 font-semibold">{formatDate(schedule.arrivalTime)}</p>
                      </div>

                      {/* Fare and Button */}
                      <div className="flex flex-col items-end md:items-end justify-center space-y-3">
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-100 font-mono tracking-tight">
                            {baseFareNum.toLocaleString()}
                            <span className="text-xs font-bold text-slate-400 ml-1">LKR</span>
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/schedules/${schedule._id}/seats`)}
                          className="w-full px-5 py-2.5 bg-[#5F73F2] hover:bg-[#4E61E0] rounded-xl text-xs font-black text-white flex items-center justify-center gap-1 shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                        >
                          Book Now <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Card Footer: Details & Timetable Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/40 pt-3">
                      {/* Left: View Stops and Seats Counter */}
                      <div className="flex items-center gap-4 text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedScheduleId(expandedScheduleId === schedule._id ? null : schedule._id);
                          }}
                          className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-full shadow-inner"
                        >
                          <Info className="h-3.5 w-3.5" />
                          {expandedScheduleId === schedule._id ? 'Hide Details' : 'Details'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedScheduleId(expandedScheduleId === schedule._id ? null : schedule._id);
                          }}
                          className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-full shadow-inner"
                        >
                          <CalendarDays className="h-3.5 w-3.5" />
                          Timetable
                        </button>
                      </div>
                      
                      {/* Seats available display */}
                      <div className="text-[11px] text-slate-400 font-medium">
                        Only <span className="font-extrabold text-emerald-400 font-mono">{availableSeats}</span> seats available
                      </div>
                    </div>

                    {/* Collapsible Station Accordion Details */}
                    {expandedScheduleId === schedule._id && (
                      <div className="w-full bg-slate-950/60 border border-slate-850 p-5 rounded-2xl animate-slide-in space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stations & Schedule Timeline</h4>
                        <div className="space-y-4 relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-850">
                          {/* Start Origin */}
                          <div className="relative text-xs">
                            <div className="absolute -left-[17px] top-1 h-2.5 w-2.5 bg-indigo-500 border border-slate-950 rounded-full" />
                            <span className="font-bold text-slate-300">{schedule.routeId?.origin}</span>
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
                            <div className="absolute -left-[17px] top-1 h-2.5 w-2.5 bg-indigo-500 border border-slate-950 rounded-full" />
                            <span className="font-bold text-slate-300">{schedule.routeId?.destination}</span>
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

        {/* Right Column: Interactive Leaflet Map Widget (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-[#18181C] border border-[#26262B] p-4.5 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapIcon className="h-4.5 w-4.5 text-indigo-400" /> Route Tracker Map
            </h3>

            {/* Interactive Leaflet container */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-inner">
              <div id="leaflet-map-container" style={{ height: '390px', width: '100%' }} className="bg-slate-950 z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBus;
