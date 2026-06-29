import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import scheduleService from '../services/scheduleService';
import BookingStepper from '../components/common/BookingStepper';
import PageLoader from '../components/common/PageLoader';
import { useToast } from '../contexts/ToastContext';
import {
  Clock,
  Compass,
  Bus,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Coffee,
  Wifi,
  Tv,
  MapPin,
  AlertCircle
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

/**
 * ScheduleDetails page rendering stops log, amenities list, and booking stepper navigation.
 */
const ScheduleDetails = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await scheduleService.getSchedule(scheduleId);
      if (response.success) {
        setSchedule(response.data.schedule);
      } else {
        setError(true);
        addToast(response.message || 'Failed to fetch schedule details.', 'error');
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [scheduleId]);

  if (loading) return <PageLoader message="Loading schedule details..." />;

  if (error || !schedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Schedule Details Unobtainable</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Please check the URL or return to search.
        </p>
        <div className="flex gap-4 mt-6">
          <Link to="/search-bus" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-200">
            Back to Search
          </Link>
          <button onClick={fetchDetails} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-slate-950">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ensure baseFare is safely formatted
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

  const stopsList = schedule.routeId?.stops || [];
  const defaultAmenities = ['Wi-Fi', 'USB Charging Port', 'Water Bottle', 'Reclining Seats', 'Air Conditioning'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <Link
          to={`/search-bus?origin=${schedule.routeId?.origin}&destination=${schedule.routeId?.destination}&travelDate=${schedule.travelDate}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Departures
        </Link>
      </div>

      <BookingStepper currentStep={1} />

      {/* Main Details Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Columns: Bus details, Routes details */}
        <div className="md:col-span-2 space-y-6">
          {/* Details Overview */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
              <Bus className="h-5 w-5 text-emerald-400" /> Bus & Departure Overview
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Bus Name</span>
                <p className="font-bold text-slate-355">{schedule.busId?.name || 'SmartGo Cruiser'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Registration Plate</span>
                <p className="font-bold text-slate-355">{schedule.busId?.registrationNumber || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Bus Type</span>
                <p className="font-bold text-slate-355">{schedule.busId?.busType || 'Luxury AC'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Capacity</span>
                <p className="font-bold text-slate-355">{schedule.busId?.capacity || 40} Seats</p>
              </div>
            </div>
          </div>

          {/* Route stops / Path */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" /> Route & Stations Log
            </h3>

            {/* Stop timeline layout */}
            <div className="space-y-4 relative pl-6 before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-850">
              {/* Origin */}
              <div className="relative">
                <div className="absolute -left-[20px] top-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                <p className="text-xs font-bold text-slate-200">{schedule.routeId?.origin ? String(schedule.routeId.origin) : ''}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{formatDate(schedule.departureTime)} at {formatTime(schedule.departureTime)}</p>
              </div>

              {/* Stops */}
              {stopsList.map((stop, idx) => {
                const stopName = typeof stop === 'string' ? stop : (stop?.name || '');
                return (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[20px] top-1 h-3.5 w-3.5 bg-slate-800 border-2 border-slate-900 rounded-full" />
                    <p className="text-xs font-medium text-slate-400">{stopName}</p>
                    <span className="text-[10px] text-slate-550">Intermediate Station</span>
                  </div>
                );
              })}

              {/* Destination */}
              <div className="relative">
                <div className="absolute -left-[20px] top-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping-slow" />
                <p className="text-xs font-bold text-slate-200">{schedule.routeId?.destination ? String(schedule.routeId.destination) : ''}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{formatDate(schedule.arrivalTime)} at {formatTime(schedule.arrivalTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Amenities */}
        <div className="space-y-6">
          {/* Price & Book now action */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4 shadow-md">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ticket Price</span>
            <div className="text-3xl font-mono font-black text-emerald-400">${baseFareNum.toFixed(2)}</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fares include service tax, seat reservations, and priority onboarding baggage.
            </p>
            <button
              onClick={() => navigate(`/schedules/${scheduleId}/seats`)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 mt-4"
            >
              Choose Seats <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Amenities details */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" /> Amenities Provided
            </h4>
            <div className="flex flex-wrap gap-2 pt-2">
              {defaultAmenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 text-slate-400 text-[10px] font-semibold rounded-lg flex items-center gap-1.5"
                >
                  {amenity.includes('Wi-Fi') && <Wifi className="h-3 w-3 text-emerald-400" />}
                  {amenity.includes('Seats') && <Bus className="h-3 w-3 text-emerald-400" />}
                  {amenity.includes('Charging') && <Tv className="h-3 w-3 text-emerald-400" />}
                  {amenity.includes('Conditioning') && <ShieldCheck className="h-3 w-3 text-emerald-400" />}
                  {!['Wi-Fi', 'Seats', 'Charging', 'Conditioning'].some(k => amenity.includes(k)) && (
                    <Coffee className="h-3 w-3 text-emerald-400" />
                  )}
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetails;
