import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import bookingService from '../services/bookingService';
import scheduleService from '../services/scheduleService';
import BookingStepper from '../components/common/BookingStepper';
import BookingSidebar from '../components/common/BookingSidebar';
import PageLoader from '../components/common/PageLoader';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Loader2, CreditCard, AlertCircle } from 'lucide-react';

const bookingSchema = z.object({
  passengerName: z.string().min(2, 'Passenger name is required'),
  passengerEmail: z.string().email('Please enter a valid email address'),
  passengerPhone: z.string().min(8, 'Phone number must be at least 8 digits')
});

/**
 * Passenger details input, validation, and booking creation triggers page.
 */
const BookingReview = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
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

  const {
    register: registerField,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { passengerName: '', passengerEmail: '', passengerPhone: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        scheduleId,
        seatIds,
        passengerName: data.passengerName,
        passengerEmail: data.passengerEmail,
        passengerPhone: data.passengerPhone
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <Link
          to={`/schedules/${scheduleId}/seats`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Seat Map
        </Link>
      </div>

      <BookingStepper currentStep={3} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Passenger Details Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-4 relative z-10">
            Passenger & Contact Information
          </h3>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
                Passenger Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                {...registerField('passengerName')}
                className={`w-full bg-slate-950 border ${
                  errors.passengerName ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-slate-200`}
                disabled={isSubmitting}
              />
              {errors.passengerName && (
                <p className="text-red-400 text-xs mt-1">{errors.passengerName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
                Passenger Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                {...registerField('passengerEmail')}
                className={`w-full bg-slate-950 border ${
                  errors.passengerEmail ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-slate-200`}
                disabled={isSubmitting}
              />
              {errors.passengerEmail && (
                <p className="text-red-400 text-xs mt-1">{errors.passengerEmail.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
                Passenger Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 555-5555"
                {...registerField('passengerPhone')}
                className={`w-full bg-slate-950 border ${
                  errors.passengerPhone ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-slate-200`}
                disabled={isSubmitting}
              />
              {errors.passengerPhone && (
                <p className="text-red-400 text-xs mt-1">{errors.passengerPhone.message}</p>
              )}
            </div>

            {/* Selected seats review card */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Selected Seat Codes</span>
              <p className="text-sm font-mono font-bold text-emerald-400">{seatNames.join(', ')}</p>
            </div>
          </form>
        </div>

        {/* Right: Booking Summary Sidebar */}
        <div className="space-y-6">
          <BookingSidebar schedule={schedule} selectedSeats={seatNames} />

          <button
            onClick={handleSubmit(onSubmit)}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/10"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" /> Reserving...
              </>
            ) : (
              <>
                Confirm Booking & Pay <CreditCard className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
