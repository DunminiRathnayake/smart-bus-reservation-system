import React from 'react';
import { Calendar, Compass, CreditCard, ShieldCheck } from 'lucide-react';

/**
 * Live Booking summary side panel displaying schedules, seats list, and prices calculations.
 */
const BookingSidebar = ({ schedule, selectedSeats = [] }) => {
  if (!schedule) return null;

  // Retrieve base fare from schedule
  const baseFare = schedule.fare || (schedule.routeId && schedule.routeId.fare) || 0;
  const totalFare = selectedSeats.length * baseFare;

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-5 h-fit shadow-xl">
      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-850 pb-3">
        Booking Summary
      </h3>

      {/* Route Info */}
      <div className="space-y-3.5">
        <div className="flex gap-3 items-start">
          <Compass className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Route Details</span>
            <p className="text-xs font-bold text-slate-350">
              {schedule.routeId?.origin || 'Origin'} ➔ {schedule.routeId?.destination || 'Destination'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <Calendar className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Departure Log</span>
            <p className="text-xs font-bold text-slate-350">
              {schedule.travelDate ? new Date(schedule.travelDate).toLocaleDateString() : 'N/A'} at {schedule.departureTime || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Fleet Assignment</span>
            <p className="text-xs font-bold text-slate-350">
              {schedule.busId?.name || 'SmartGo Express'} ({schedule.busId?.busType || 'AC Standard'})
            </p>
          </div>
        </div>
      </div>

      {/* Selection Details */}
      <div className="border-t border-slate-850 pt-4 space-y-3.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Selected Seats</span>
          <span className="text-slate-200 font-mono font-bold">
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Price Per Seat</span>
          <span className="text-slate-200 font-mono font-bold">
            ${baseFare.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-slate-850 pt-4">
          <span className="text-xs text-slate-400 font-semibold">Total Cost</span>
          <div className="flex items-center gap-1.5 text-lg font-mono font-black text-emerald-400">
            <CreditCard className="h-4 w-4 text-emerald-500" />
            ${totalFare.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSidebar;
