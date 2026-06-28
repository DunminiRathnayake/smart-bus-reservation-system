import React from 'react';

/**
 * Reusable colored badge helper for database states.
 */
const StatusBadge = ({ status }) => {
  const normalized = status ? status.toUpperCase() : 'PENDING';

  const colorMap = {
    // General
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    INACTIVE: 'bg-slate-800 text-slate-400 border border-slate-750',
    MAINTENANCE: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    SUSPENDED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    
    // Booking / Payment / Ticket
    PENDING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    REFUNDED: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    COMPLETED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    SUCCESS: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    FAILED: 'bg-red-500/10 text-red-400 border border-red-500/20'
  };

  const currentStyles = colorMap[normalized] || 'bg-slate-850 text-slate-400 border border-slate-800';

  return (
    <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${currentStyles}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
