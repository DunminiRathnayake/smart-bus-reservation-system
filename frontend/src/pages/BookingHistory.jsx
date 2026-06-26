import React from 'react';
import { CreditCard, QrCode } from 'lucide-react';

const BookingHistory = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">My Bookings</h2>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-850">
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-sky-400">SG-49204-NYC</span>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold uppercase">Confirmed</span>
            </div>
            <div className="text-lg font-bold">New York → Washington</div>
            <div className="text-xs text-slate-400">Departure: 01 Jul 2026, 08:30 AM | Seat: A2</div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-xs font-semibold rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors">
              <QrCode className="h-4 w-4" /> Boarding Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
