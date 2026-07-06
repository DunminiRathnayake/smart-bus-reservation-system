import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ticketService from '../services/ticketService';
import BookingStepper from '../components/common/BookingStepper';
import PageLoader from '../components/common/PageLoader';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Printer, ShieldCheck, QrCode, Calendar, Clock, Bus, Compass, AlertCircle } from 'lucide-react';

/**
 * Ticket Details page displaying boarding passes, QR validation code barcodes,
 * and printable configurations.
 */
const TicketDetails = () => {
  const { ticketId } = useParams();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await ticketService.getTicket(ticketId);
      if (response.success && response.data?.ticket) {
        setTicket(response.data.ticket);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load boarding pass ticket details:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <PageLoader message="Generating boarding pass..." />;

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Boarding Pass Not Found</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Failed to load ticket details. Verify reference or return to bookings.
        </p>
        <Link to="/bookings" className="mt-6 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-slate-950 transition-colors">
          View Bookings
        </Link>
      </div>
    );
  }

  const { bookingId, scheduleId } = ticket;
  const departureDate = scheduleId?.travelDate ? new Date(scheduleId.travelDate).toLocaleDateString() : 'N/A';

  return (
    <div className="space-y-6 max-w-4xl mx-auto printable-section">
      <div className="flex justify-between items-center hide-on-print">
        <Link
          to={`/bookings`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Bookings
        </Link>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
        >
          <Printer className="h-4 w-4" /> Print Boarding Pass
        </button>
      </div>

      <div className="hide-on-print">
        <BookingStepper currentStep={5} />
      </div>

      {/* Booking Confirmed Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl flex items-center gap-4 animate-fade-in hide-on-print">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Booking Confirmed!</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Your seat has been reserved successfully. You can now download or print your boarding pass below.</p>
        </div>
      </div>

      {/* Ticket Card container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-emerald-950/5 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Ticket Header */}
        <div className="bg-emerald-500/5 p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> BOARDING PASS
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Ticket Code: {ticket.ticketCode}
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg uppercase">
            {ticket.status || 'ACTIVE'}
          </span>
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Passenger & Routing */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <span className="text-slate-550 font-bold uppercase text-[10px] tracking-wider">Passenger</span>
                <p className="font-bold text-slate-200 text-sm">{bookingId?.passengerName || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-550 font-bold uppercase text-[10px] tracking-wider">Booking Ref</span>
                <p className="font-mono font-bold text-emerald-400 text-sm">{bookingId?.bookingCode || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-550 font-bold uppercase text-[10px] tracking-wider">Email</span>
                <p className="font-bold text-slate-350">{bookingId?.passengerEmail || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-550 font-bold uppercase text-[10px] tracking-wider">Phone</span>
                <p className="font-bold text-slate-350">{bookingId?.passengerPhone || 'N/A'}</p>
              </div>
            </div>

            {/* Travel specifics */}
            <div className="border-t border-slate-850 pt-6 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Compass className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Journey Route</span>
                    <p className="text-sm font-extrabold text-slate-200">
                      {scheduleId?.routeId?.origin} ➔ {scheduleId?.routeId?.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Bus className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Bus Assigned</span>
                    <p className="text-sm font-extrabold text-slate-200">
                      {scheduleId?.busId?.name || 'SmartGo Express'} ({scheduleId?.busId?.busType || 'AC Standard'})
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 border border-slate-850 rounded-2xl text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-550" />
                  <span>Date: <strong className="text-slate-300">{departureDate}</strong></span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Clock className="h-4 w-4 text-slate-550" />
                  <span>Departure: <strong className="text-slate-300">{scheduleId?.departureTime}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code / Boarding Code validation barcode */}
          <div className="flex flex-col items-center justify-center p-6 border border-slate-800 rounded-3xl bg-slate-950/40 text-center gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-emerald-400">
              <QrCode className="h-28 w-28" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-550 font-bold uppercase tracking-widest">Digital Boarding Pass</span>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-[180px] mx-auto">
                Scan barcode upon boarding the bus terminal.
              </p>
            </div>
          </div>
        </div>

        {/* Seating bottom info */}
        <div className="bg-slate-950 p-6 border-t border-slate-800 flex justify-between items-center text-xs relative z-10">
          <span className="text-slate-500 font-semibold uppercase">Assigned Seats</span>
          <span className="font-mono text-base font-black text-emerald-400">{ticket.seats?.join(', ')}</span>
        </div>
      </div>

      {/* Printable styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .printable-section {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .hide-on-print {
            display: none !important;
          }
          .bg-slate-900, .bg-slate-950, .bg-slate-950/40 {
            background-color: white !important;
            border-color: #ddd !important;
            color: black !important;
          }
          .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-350, .text-slate-400, .text-slate-500 {
            color: black !important;
          }
          .text-emerald-400 {
            color: #059669 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketDetails;
