import React from 'react';

/**
 * A premium dark emerald theme spinner for page and action loads.
 */
const LoadingSpinner = ({ fullPage = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-18 w-18 border-4'
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-t-emerald-500 border-r-emerald-500/30 border-b-emerald-500/10 border-l-emerald-500/30`}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <span className="text-sm font-semibold text-emerald-400 tracking-wider animate-pulse">
            Loading SmartGo...
          </span>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};

export default LoadingSpinner;
