import React from 'react';

/**
 * Reusable admin dashboard statistic card.
 */
const StatsCard = ({ icon, title, value, trend, desc }) => {
  return (
    <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-start justify-between shadow-lg relative overflow-hidden group hover:border-slate-800 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
      <div className="space-y-2 relative z-10">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        <p className="text-2xl font-black text-slate-200 tracking-tight">
          {value}
        </p>
        {(trend || desc) && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-450">
            {trend && (
              <span className="text-emerald-450 font-bold">
                {trend}
              </span>
            )}
            {desc && <span>{desc}</span>}
          </div>
        )}
      </div>
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl relative z-10">
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
