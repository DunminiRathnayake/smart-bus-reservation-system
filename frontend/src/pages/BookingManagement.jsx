import React, { useState, useEffect } from 'react';
import bookingService from '../services/bookingService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import {
  FileText,
  Search,
  Trash2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

/**
 * Administrative Bookings override panel.
 */
const BookingManagement = () => {
  const { addToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        limit: 5,
        search: searchTerm
      };
      if (statusFilter !== 'ALL') {
        query.bookingStatus = statusFilter;
      }

      const response = await bookingService.getBookings(query);
      if (response.success && response.data) {
        setBookings(response.data.bookings || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load bookings rosters:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  const handleCancelClick = (id) => {
    setSelectedBookingId(id);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await bookingService.cancelBooking(selectedBookingId);
      if (response.success) {
        addToast('Booking cancelled successfully and seats released.', 'success');
        fetchBookings();
      } else {
        addToast(response.message || 'Failed to cancel booking.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Error cancelling booking.', 'error');
    }
  };

  const handleViewDetails = (booking) => {
    setActiveDetail(booking);
    setDetailModalOpen(true);
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
            <FileText className="h-6 w-6 text-emerald-400" /> Booking Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">Review passenger bookings, check seat codes allocations, and override cancellations.</p>
        </div>
      </div>

      {/* Search & filters panel */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search name, phone, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-505">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-350"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <button type="submit" className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs font-semibold rounded-xl text-slate-300">
          Search Bookings
        </button>
      </form>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="list" count={3} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-slate-300 text-sm">Failed to retrieve bookings list.</p>
            <button onClick={fetchBookings} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl">
              Retry
            </button>
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Booking Ref</th>
                  <th className="p-4 sm:p-5">Passenger</th>
                  <th className="p-4 sm:p-5">Route & Timing</th>
                  <th className="p-4 sm:p-5">Seats Codes</th>
                  <th className="p-4 sm:p-5">Fare Value</th>
                  <th className="p-4 sm:p-5">Status</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80">
                {bookings.map((booking) => {
                  const isCancelable = booking.bookingStatus === 'PENDING' || booking.bookingStatus === 'CONFIRMED';
                  const trDate = booking.scheduleId?.travelDate ? new Date(booking.scheduleId.travelDate).toLocaleDateString() : 'N/A';

                  return (
                    <tr key={booking._id} className="hover:bg-slate-850/20 text-slate-300 transition-colors">
                      <td className="p-4 sm:p-5 font-mono text-emerald-400 font-bold">{booking.bookingCode}</td>
                      <td className="p-4 sm:p-5">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-200">{booking.passengerName}</p>
                          <p className="text-[10px] text-slate-500">{booking.passengerEmail}</p>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 font-semibold">
                        <div className="space-y-0.5">
                          <p>{booking.scheduleId?.routeId?.origin} ➔ {booking.scheduleId?.routeId?.destination}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{trDate} at {booking.scheduleId?.departureTime}</p>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 font-mono font-bold text-slate-300">{booking.seats?.join(', ')}</td>
                      <td className="p-4 sm:p-5 font-mono text-slate-400 font-semibold">${booking.totalAmount?.toFixed(2)}</td>
                      <td className="p-4 sm:p-5">{getStatusBadge(booking.bookingStatus)}</td>
                      <td className="p-4 sm:p-5 text-right space-x-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {isCancelable && (
                          <button
                            onClick={() => handleCancelClick(booking._id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Cancel Reservation"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Bookings Recorded"
            description="Clear search queries or filters to review system-wide passenger bookings."
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

      {/* Details Modal */}
      {detailModalOpen && activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl shadow-xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 relative z-10">
              <h3 className="text-base font-bold text-slate-200">Reservation Details</h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-250 font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 relative z-10 text-xs text-slate-300 leading-relaxed">
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
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Passenger Phone</span>
                  <p className="font-bold text-slate-200 mt-0.5">{activeDetail.passengerPhone}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-1.5 mt-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Seating Codes</span>
                <p className="font-mono font-bold text-emerald-400">{activeDetail.seats?.join(', ')}</p>
              </div>

              <div className="border-t border-slate-850 pt-4 flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-450">Total Fare paid</span>
                <span className="font-mono text-emerald-400 font-black">${activeDetail.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirm dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Override Cancel Booking?"
        description="Are you sure you want to cancel this booking? This releases the reserved seats and creates database audit logs."
        confirmText="Confirm Override Cancel"
        type="danger"
      />
    </div>
  );
};

export default BookingManagement;
