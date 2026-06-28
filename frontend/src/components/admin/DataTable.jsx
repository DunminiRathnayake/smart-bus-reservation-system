import React from 'react';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable layout for administrative data listing.
 */
const DataTable = ({
  headers = [],
  loading = false,
  error = false,
  data = [],
  renderRow,
  emptyTitle = 'No Records Found',
  emptyDescription = 'Try adjusting search queries or check filters.',
  onRetry
}) => {
  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-lg w-full">
      {loading ? (
        <div className="p-6">
          <LoadingSkeleton type="list" count={4} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-slate-300 text-sm">Failed to retrieve records from the server.</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-md shadow-emerald-500/10"
            >
              Retry
            </button>
          )}
        </div>
      ) : data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                {headers.map((head, index) => (
                  <th
                    key={index}
                    className={`p-4 sm:p-5 ${index === headers.length - 1 ? 'text-right' : ''}`}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/80">
              {data.map((item, index) => renderRow(item, index))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  );
};

export default DataTable;
