import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import ticketService from '../services/ticketService';
import BookingStepper from '../components/common/BookingStepper';
import PageLoader from '../components/common/PageLoader';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, CreditCard, ShieldCheck, Loader2, AlertCircle, Sparkles } from 'lucide-react';

/**
 * Payment processing page collecting payment methods and executing gateway confirmations.
 */
const PaymentPage = () => {
  const { scheduleId, bookingId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await bookingService.getBooking(bookingId);
      if (response.success && response.data?.booking) {
        setBooking(response.data.booking);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load booking details for payment:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bookingId) {
      addToast('No active booking reference found. Returning to search.', 'warning');
      navigate('/search-bus');
      return;
    }
    fetchBookingDetails();
  }, [bookingId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    addToast('Contacting secure gateway authorization...', 'info');
    try {
      const payload = {
        bookingId,
        paymentMethod,
        amount: booking.totalAmount
      };

      const response = await paymentService.createPayment(payload);
      if (response.success) {
        addToast('Payment authorized! Ticket generated successfully.', 'success');

        // Look up the newly generated ticket ID for this booking
        try {
          const ticketsRes = await ticketService.getMyTickets({ bookingId });
          if (ticketsRes.success && ticketsRes.data?.tickets?.length > 0) {
            const ticket = ticketsRes.data.tickets[0];
            navigate(`/tickets/${ticket._id}`);
            return;
          }
        } catch (ticketErr) {
          console.error('Failed to find generated ticket ID, redirecting to tickets index:', ticketErr);
        }

        navigate('/bookings');
      } else {
        addToast(response.message || 'Payment simulation failed.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Gateway connection timeout.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <PageLoader message="Verifying reservation details..." />;

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Reservation Unverifiable</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Failed to load booking specifics. Go back to your dashboard to inspect your booking.
        </p>
        <Link to="/dashboard" className="mt-6 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-slate-950 transition-colors">
          Go Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <Link
          to={`/bookings`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> View My Bookings
        </Link>
      </div>

      <BookingStepper currentStep={4} />

      {/* Main Payment container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Reservation Card Details */}
          <div className="bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-4 relative z-10">
              Confirm Reservation Details
            </h3>

            <div className="space-y-4 relative z-10 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Booking Reference</span>
                  <p className="font-mono font-bold text-emerald-400">{booking.bookingCode}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Booking Status</span>
                  <p className="font-bold text-slate-300 uppercase">{booking.bookingStatus}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Passenger Name</span>
                  <p className="font-bold text-slate-300">{booking.passengerName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Passenger Phone</span>
                  <p className="font-bold text-slate-350">{booking.passengerPhone}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reserved Seat List</span>
                <p className="text-sm font-mono font-bold text-emerald-400">{booking.seats?.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Payment selector */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-4">
              Select Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['CARD', 'WALLET', 'CASH'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 border rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all ${
                    paymentMethod === method
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/5'
                      : 'border-slate-850 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs font-bold">{method}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-5 shadow-lg">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-850 pb-3">
              Payment Summary
            </h4>

            <div className="space-y-3.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal ({booking.seats?.length} seats)</span>
                <span className="text-slate-200 font-mono">${booking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience Fee</span>
                <span className="text-slate-200 font-mono">$0.00</span>
              </div>
              <div className="flex justify-between border-t border-slate-850 pt-3 text-sm">
                <span className="font-semibold text-slate-300">Amount Due</span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  ${booking.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400/80 rounded-xl leading-relaxed flex gap-2">
              <Sparkles className="h-4.5 w-4.5 flex-shrink-0 text-emerald-500" />
              <span>Simulated Payment Gateway. Sandbox mode will immediately authorize transaction.</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/10"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" /> Processing Payment...
              </>
            ) : (
              <>
                Pay & Confirm Tickets <ShieldCheck className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
