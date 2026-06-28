import React from 'react';

/**
 * Reusable animated loading skeletons for stats, lists, cards, and seat maps.
 */
const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = (idx) => {
    if (type === 'stats') {
      return (
        <div key={idx} className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-3 animate-pulse">
          <div className="h-4 bg-slate-800 rounded-md w-24" />
          <div className="h-8 bg-slate-800 rounded-md w-16" />
        </div>
      );
    }

    if (type === 'list') {
      return (
        <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-900 rounded-2xl animate-pulse">
          <div className="space-y-2 flex-grow max-w-md">
            <div className="h-4 bg-slate-800 rounded-md w-3/4" />
            <div className="h-3 bg-slate-800 rounded-md w-1/2" />
          </div>
          <div className="h-8 bg-slate-800 rounded-xl w-24" />
        </div>
      );
    }

    if (type === 'seatmap') {
      return (
        <div key={idx} className="space-y-4 animate-pulse">
          <div className="h-10 bg-slate-800 rounded-xl w-full max-w-xs mx-auto" />
          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-800 rounded-lg aspect-square" />
            ))}
          </div>
        </div>
      );
    }

    // Default card skeleton
    return (
      <div key={idx} className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-800 rounded-md w-1/3" />
          <div className="h-4 bg-slate-800 rounded-md w-1/6" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-800 rounded-md w-full" />
          <div className="h-4 bg-slate-800 rounded-md w-5/6" />
        </div>
        <div className="h-10 bg-slate-800 rounded-xl w-full mt-4" />
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
    </div>
  );
};

export default LoadingSkeleton;
