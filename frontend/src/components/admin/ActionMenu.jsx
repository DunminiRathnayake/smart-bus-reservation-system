import React from 'react';
import { Edit2, Trash2, Eye, RefreshCw } from 'lucide-react';

/**
 * Reusable inline action item control triggers.
 */
const ActionMenu = ({ onView, onEdit, onDelete, onChangeStatus, statusLabel = 'Change Status' }) => {
  return (
    <div className="flex justify-end gap-1.5">
      {onView && (
        <button
          onClick={onView}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-450 hover:text-slate-200 transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-450 hover:text-emerald-400 transition-colors"
          title="Edit Record"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}

      {onChangeStatus && (
        <button
          onClick={onChangeStatus}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-455 hover:text-amber-400 transition-colors"
          title={statusLabel}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-455 hover:text-red-400 transition-colors"
          title="Delete Record"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ActionMenu;
