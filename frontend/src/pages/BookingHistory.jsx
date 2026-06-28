import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import ticketService from '../services/ticketService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import {
  History,
  QrCode,
  CreditCard,
  XCircle,
  Eye,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

/**
 * Passenger booking records page with cancellation controls, pagination, and status filters.
 */
const BookingHistory = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'

  // Cancellation modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Detail Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 5
      };
      if (statusFilter !== 'ALL') {
        query.bookingStatus = statusFilter;
      }

      const response = await bookingService.getMyBookings(query);
      if (response.success && response.data) {
        setBookings(response.data.bookings || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load bookings history:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  const handleCancelClick = (id) => {
    setSelectedBookingId(id);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await bookingService.cancelBooking(selectedBookingId);
      if (response.success) {
        addToast('Booking cancelled successfully.', 'success');
        fetchBookings();
      } else {
        addToast(response.message || 'Failed to cancel booking.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Server error cancelling booking.', 'error');
    }
  };

  const handleViewDetails = (booking) => {
    setActiveDetail(booking);
    setDetailModalOpen(true);
  };

  const handleViewTicket = async (bookingId) => {
    try {
      addToast('Locating digital ticket pass...', 'info');
      const ticketsRes = await ticketService.getMyTickets({ bookingId });
      if (ticketsRes.success && ticketsRes.data?.tickets?.length > 0) {
        const ticket = ticketsRes.data.tickets[0];
        navigate(`/tickets/${ticket._id}`);
      } else {
        addToast('No ticket found for this booking.', 'warning');
      }
    } catch (err) {
      addToast('Error fetching ticket boarding details.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
      REFUNDED: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      COMPLETED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    };
    return (
      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${styles[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <History className="h-6 w-6 text-emerald-400" /> My Booking History
      </h2>

      {/* Tabs Toggles */}
      <div className="flex border-b border-slate-850 gap-6 text-sm font-semibold">
        {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatusFilter(tab);
              setCurrentPage(1);
            }}
            className={`pb-3 capitalize transition-all border-b-2 ${
              statusFilter === tab
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" count={3} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900 border border-slate-850 rounded-2xl">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-slate-300 text-sm">Failed to retrieve booking list.</p>
            <button onClick={fetchBookings} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors">
              Retry
            </button>
          </div>
        ) : bookings.length > 0 ? (
          <>
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isPending = booking.bookingStatus === 'PENDING';
                const isConfirmed = booking.bookingStatus === 'CONFIRMED';
                const travelDate = booking.scheduleId?.travelDate
                  ? new Date(booking.scheduleId.travelDate).toLocaleDateString()
                  : 'N/A';

                return (
                  <div
                    key={booking._id}
                    className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col transition-all"
                  >
                    {/* Header */}
                    <div className="bg-slate-950/40 p-4 border-b border-slate-850/80 flex justify-between items-center flex-wrap gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        REF: {booking.bookingCode}
                      </span>
                      {getStatusBadge(booking.bookingStatus)}
                    </div>

                    {/* Body */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                      <div className="space-y-3 flex-grow">
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-200">
                          <span>{booking.scheduleId?.routeId?.origin || 'Origin'}</span>
                          <ArrowRight className="h-4 w-4 text-emerald-500" />
                          <span>{booking.scheduleId?.routeId?.destination || 'Destination'}</span>
                        </div>

                        <div className="flex gap-4 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" /> {travelDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-500" /> {booking.scheduleId?.departureTime || 'N/A'}
                          </span>
                          <span>Seats: <strong className="text-slate-300 font-mono">{booking.seats?.join(', ')}</strong></span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>

                        {isPending && (
                          <button
                            onClick={() => navigate(`/schedules/${booking.scheduleId?._id}/pay/${booking._id}`)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/10"
                          >
                            <CreditCard className="h-4 w-4" /> Pay Now
                          </button>
                        )}

                        {isConfirmed && (
                          <button
                            onClick={() => handleViewTicket(booking._id)}
                            className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                          >
                            <QrCode className="h-4 w-4 text-emerald-400" /> Boarding Pass
                          </button>
                        )}

                        {(isConfirmed || isPending) && (
                          <button
                            onClick={() => handleCancelClick(booking._id)}
                            className="p-2 bg-red-500/5 border border-red-500/10 hover:border-red-500/30 text-red-400 rounded-xl transition-colors"
                            title="Cancel Booking"
                          >
                            <XCircle className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-850/80">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No Bookings Recorded"
            description="You don't have any bookings matching this status filter. Choose a different category or search departures."
          />
        )}
      </div>

      {/* Confirmation Cancel dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel This Booking?"
        description="Are you sure you want to cancel your bus seat reservation? Confirming will trigger automatic refund queries if paid."
        confirmText="Yes, Cancel Booking"
        type="danger"
      />

      {/* Details Dialog Modal */}
      {detailModalOpen && activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-850 rounded-3xl shadow-xl overflow-hidden p-6 animate-zoom-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-200">Reservation Details</h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-250 font-bold"
              >
                Close
              </button>
            </div>

            {/* Content list */}
            <div className="space-y-4 text-xs text-slate-350 leading-relaxed">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Booking Reference</span>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">{activeDetail.bookingCode}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Booking Status</span>
                  <p className="font-bold text-slate-200 uppercase mt-0.5">{activeDetail.bookingStatus}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Passenger Name</span>
                  <p className="font-bold text-slate-200 mt-0.5">{activeDetail.passengerName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Phone Number</span>
                  <p className="font-bold text-slate-200 mt-0.5">{activeDetail.passengerPhone}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-1.5 mt-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Seating Codes</span>
                <p className="font-mono font-bold text-emerald-400">{activeDetail.seats?.join(', ')}</p>
              </div>

              <div className="border-t border-slate-850 pt-4 flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-400">Total Fare paid</span>
                <span className="font-mono text-emerald-400 font-black">${activeDetail.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
