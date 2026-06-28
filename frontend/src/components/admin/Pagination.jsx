import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable table pagination controls.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-850/80 w-full max-w-7xl mx-auto">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-350 rounded-xl flex items-center gap-1.5 transition-colors font-semibold"
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </button>
      <span className="text-slate-500 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-355 rounded-xl flex items-center gap-1.5 transition-colors font-semibold"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
