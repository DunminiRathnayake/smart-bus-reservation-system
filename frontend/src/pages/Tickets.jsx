import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ticketService from '../services/ticketService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import {
  Ticket as TicketIcon,
  QrCode,
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

/**
 * Passenger issued tickets archive lists page.
 */
const Tickets = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await ticketService.getMyTickets({
        page: currentPage,
        limit: 5
      });
      if (response.success && response.data) {
        setTickets(response.data.tickets || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load tickets archive:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <TicketIcon className="h-6 w-6 text-emerald-400" /> My Boarding Passes
      </h2>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" count={3} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900 border border-slate-850 rounded-2xl">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-slate-300 text-sm">Failed to retrieve issued tickets.</p>
            <button onClick={fetchTickets} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors">
              Retry
            </button>
          </div>
        ) : tickets.length > 0 ? (
          <>
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const departureDate = ticket.scheduleId?.travelDate
                  ? new Date(ticket.scheduleId.travelDate).toLocaleDateString()
                  : 'N/A';

                return (
                  <div
                    key={ticket._id}
                    className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col transition-all"
                  >
                    <div className="bg-slate-950/40 p-4 border-b border-slate-850/80 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        TICKET CODE: {ticket.ticketCode}
                      </span>
                      <span className="px-2.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-bold uppercase">
                        {ticket.status || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                      <div className="space-y-3 flex-grow">
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-200">
                          <span>{ticket.scheduleId?.routeId?.origin || 'Origin'}</span>
                          <ArrowRight className="h-4 w-4 text-emerald-500" />
                          <span>{ticket.scheduleId?.routeId?.destination || 'Destination'}</span>
                        </div>

                        <div className="flex gap-4 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" /> {departureDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-500" /> {ticket.scheduleId?.departureTime || 'N/A'}
                          </span>
                          <span>Seats: <strong className="text-slate-350 font-mono">{ticket.seats?.join(', ')}</strong></span>
                        </div>
                      </div>

                      <div className="flex w-full sm:w-auto justify-end">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                        >
                          <QrCode className="h-4 w-4 text-emerald-400" /> View Boarding Pass
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-855">
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
            title="No Tickets Issued"
            description="You don't have any active digital boarding passes yet. Book a bus departure to confirm a ticket."
          />
        )}
      </div>
    </div>
  );
};

export default Tickets;
