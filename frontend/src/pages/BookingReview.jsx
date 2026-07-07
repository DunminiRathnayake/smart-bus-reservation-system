import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import scheduleService from '../services/scheduleService';
import seatService from '../services/seatService';
import BookingStepper from '../components/common/BookingStepper';
import BookingSidebar from '../components/common/BookingSidebar';
import PageLoader from '../components/common/PageLoader';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Loader2, CreditCard, AlertCircle, Info, ChevronRight, CalendarDays, Clock, User } from 'lucide-react';

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
 * Passenger details input, validation, and booking creation triggers page.
 */
const BookingReview = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const seatNames = searchParams.get('seats')?.split(',') || [];
  const seatIds = searchParams.get('seatIds')?.split(',') || [];

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await scheduleService.getSchedule(scheduleId);
      if (response.success) {
        setSchedule(response.data.schedule);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seatIds.length === 0 || !scheduleId) {
      addToast('No seats selected. Returning to seat map.', 'warning');
      navigate(`/schedules/${scheduleId}/seats`);
      return;
    }
    fetchSchedule();
  }, [scheduleId]);

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Revalidate seat availability before completing the booking
      const seatsRes = await seatService.getSeats(scheduleId);
      if (seatsRes.success && seatsRes.data && seatsRes.data.seats) {
        const currentSeats = seatsRes.data.seats;
        const unavailableSelected = currentSeats.filter(
          (s) => seatIds.includes(s._id) && s.status !== 'AVAILABLE'
        );

        if (unavailableSelected.length > 0) {
          const seatNumbersStr = unavailableSelected.map((s) => s.seatNumber).join(', ');
          addToast(`Seats [${seatNumbersStr}] are no longer available. Please select other seats.`, 'error');
          navigate(`/schedules/${scheduleId}/seats`);
          return;
        }
      }

      const payload = {
        scheduleId,
        seatIds,
        passengerName: user?.fullName || 'Passenger',
        passengerEmail: user?.email || 'passenger@smartgo.com',
        passengerPhone: user?.phoneNumber || '+94777934012'
      };

      const response = await bookingService.createBooking(payload);
      if (response.success && response.data) {
        const { ticket } = response.data;
        addToast('Booking confirmed successfully!', 'success');
        navigate(`/tickets/${ticket._id}`);
      } else {
        addToast(response.message || 'Failed to create booking.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Server error creating booking.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoader message="Loading checkout details..." />;

  if (error || !schedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Checkout Unreachable</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Failed to load checkout details. Return to search and try again.
        </p>
        <Link to="/search-bus" className="mt-6 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-slate-950 transition-colors">
          Return to Search
        </Link>
      </div>
    );
  }

  const travelDateStr = schedule.travelDate ? schedule.travelDate.split('T')[0] : '';
  const travelDatePretty = schedule.travelDate
    ? new Date(schedule.travelDate).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  let baseFareNum = 1500;
  const rawFare = schedule.fare || (schedule.routeId && schedule.routeId.baseFare);
  if (rawFare) {
    if (typeof rawFare === 'object' && rawFare.$numberDecimal) {
      baseFareNum = parseFloat(rawFare.$numberDecimal) || 1500;
    } else if (typeof rawFare === 'object' && rawFare.toString) {
      baseFareNum = parseFloat(rawFare.toString()) || 1500;
    } else {
      baseFareNum = parseFloat(rawFare) || 1500;
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-4 text-slate-100 animate-fade-in">
      {/* Top Banner (Breadcrumbs + Route Sub-header) */}
      <div className="space-y-3">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-550">
          <Link to="/" className="hover:text-[#5F73F2] transition-colors">Home</Link>
          <span>&gt;</span>
          <Link to="/search-bus" className="hover:text-[#5F73F2] transition-colors">Journeys</Link>
          <span>&gt;</span>
          <span className="text-slate-400 font-semibold">{schedule.routeId?.origin} - {schedule.routeId?.destination} {formatTime(schedule.departureTime)}</span>
        </div>

        {/* Route Banner Details */}
        <div className="bg-[#18181C] border border-[#26262B] p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {schedule.routeId?.origin} - {schedule.routeId?.destination} <span className="text-indigo-400 font-mono">{formatTime(schedule.departureTime)}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-300">{schedule.busId?.busName || 'NCG Express'}</span>
              <span>-</span>
              <span className="font-semibold text-slate-300">{schedule.busId?.type || 'Super Luxury'}</span>
              <span>|</span>
              <span className="font-mono text-slate-350 font-semibold">{schedule.scheduleCode || 'NI 8224'}</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded ml-1">
                Certified
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addToast('Displaying detailed station stops matrix.', 'info')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 shadow transition-all active:scale-95"
          >
            <Info className="h-4 w-4" /> View More Details
          </button>
        </div>
      </div>

      {/* Streamlined Stepper Progress */}
      <div className="hide-on-print">
        <BookingStepper currentStep={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Checkout steps (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1: Booking Information */}
          <div className="bg-[#18181C] border border-[#26262B] p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5F73F2] text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Booking Information</h3>
                <p className="text-[10px] text-slate-500">Confirm details to book your seat</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Confirm Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confirm Travel Date</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={travelDateStr}
                    readOnly
                    className="flex-grow bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-xs font-mono text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addToast('Travel date confirmed.', 'success')}
                    className="px-5 py-3 bg-[#5F73F2] hover:bg-[#4E61E0] text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    Confirm
                  </button>
                </div>
                {travelDatePretty && (
                  <p className="text-[10px] text-red-500 font-semibold pt-1">
                    Displaying Results for {travelDatePretty}
                  </p>
                )}
              </div>

              {/* Pickup & Dropoff Selects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Choose Pickup Location</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-855 rounded-xl py-3 px-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option>Point 1 - {schedule.routeId?.origin} ({formatTime(schedule.departureTime)})</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Choose Drop-off Location</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-855 rounded-xl py-3 px-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option>Point 36 - {schedule.routeId?.destination} ({formatTime(schedule.arrivalTime)})</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Choose Your Seat */}
          <div className="bg-[#18181C] border border-[#26262B] p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5F73F2] text-white flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Choose Your Seat</h3>
                <p className="text-[10px] text-slate-550">Review chosen seating spaces</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Selected Seats</span>
                <p className="text-sm font-mono font-bold text-emerald-450">{seatNames.join(', ')}</p>
              </div>

              <Link
                to={`/schedules/${scheduleId}/seats`}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 shadow transition-all active:scale-95"
              >
                Select seat <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-[#18181C] border border-[#26262B] p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5F73F2] text-white flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Payment Method</h3>
                <p className="text-[10px] text-slate-500">Select your payment method from below</p>
              </div>
            </div>

            <div className="pt-2">
              <div className="border border-indigo-500/30 bg-[#5F73F2]/5 p-4.5 rounded-2xl flex items-center gap-3.5 shadow-inner">
                <div className="p-2 bg-[#5F73F2]/10 rounded-xl text-[#5F73F2]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#5F73F2]">Pay By IPG</p>
                  <p className="text-[10px] text-slate-450">(For passengers who would like to pay online. Ticket auto-confirms, no actual charge.)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Journey block */}
          <div className="bg-[#18181C] border border-[#26262B] p-6 rounded-3xl shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Share your journey with friends and loved ones.</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Share this journey with friends and loved ones so they can join you. Simply copy the link below and send it to them to book tickets for the same trip.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => addToast('WhatsApp link copied.', 'success')}
                className="py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-bold text-slate-400 hover:text-indigo-400 transition-colors"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => addToast('Facebook link shared.', 'success')}
                className="py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-bold text-slate-400 hover:text-indigo-400 transition-colors"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => addToast('Instagram link shared.', 'success')}
                className="py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-bold text-slate-400 hover:text-indigo-400 transition-colors"
              >
                Instagram
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addToast('Journey link copied to clipboard!', 'success');
                }}
                className="py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-bold text-slate-400 hover:text-indigo-400 transition-colors"
              >
                Copy Link & Share
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & notices (1/3 width) */}
        <div className="space-y-6">
          {/* Step 4: Your Booking Summary */}
          <div className="bg-[#18181C] border border-[#26262B] p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5F73F2] text-white flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Your Booking</h3>
                <p className="text-[10px] text-slate-500">Confirm Booking.</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Selected seats details */}
              <div className="border-b border-slate-850/60 pb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Selected Seats.</span>
                <div className="flex flex-wrap gap-1.5">
                  {seatNames.map((s, sidx) => (
                    <span key={sidx} className="bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded text-xs font-bold text-[#5F73F2] font-mono">
                      Seat {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-850/60">
                <span className="text-xs font-extrabold text-slate-200">Sub Total ({seatNames.length} Seats)</span>
                <span className="text-base font-black text-[#5F73F2] font-mono">
                  LKR {((baseFareNum || 1500) * seatNames.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Disclaimer */}
              <p className="text-[9px] text-slate-550 italic leading-normal">
                🔒 Your information is never shared with third parties.
              </p>

              {/* Action Proceed */}
              <button
                onClick={onSubmit}
                className="w-full py-3.5 bg-[#5F73F2] hover:bg-[#4E61E0] rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                disabled={isSubmitting || seatNames.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" /> Reserving...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-[#18181C] border border-[#26262B] p-6 rounded-3xl shadow-xl space-y-3.5">
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Important Notice</h4>
            <ol className="list-decimal pl-4.5 text-[10px] text-slate-500 space-y-2 leading-relaxed">
              <li>This notice absolves us of responsibility for luggage damage due to inadequate protection or fragile items.</li>
              <li>Refunds won't be given for missing boarding or transport issues.</li>
              <li>No full refunds for transport breakdowns; service fees are non-refundable.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
