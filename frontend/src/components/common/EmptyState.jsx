import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable component for empty search queries, lists, and notifications dashboard lists.
 */
const EmptyState = ({
  title = 'No data available',
  description = 'Adjust your search parameters or check back later.',
  icon = <Inbox className="h-10 w-10 text-slate-500" />,
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/10 backdrop-blur-sm max-w-md mx-auto my-6">
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-full mb-4 text-emerald-400/80 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
