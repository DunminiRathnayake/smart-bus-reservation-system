import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * A beautiful full-page loader displaying loading status with emerald highlights.
 */
const PageLoader = ({ message = 'Loading system assets...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 py-12">
      <LoadingSpinner size="lg" />
      <p className="text-slate-400 text-sm animate-pulse font-medium tracking-wide">
        {message}
      </p>
    </div>
  );
};

export default PageLoader;
