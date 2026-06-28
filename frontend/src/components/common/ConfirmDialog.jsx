import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

/**
 * Reusable modal overlay dialog for user action confirmations (cancellations, status updates, deletions).
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This operation is irreversible.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // 'warning' | 'danger' | 'info'
}) => {
  if (!isOpen) return null;

  const colorVariants = {
    danger: {
      iconBg: 'bg-red-500/10 border-red-500/20 text-red-400',
      confirmBtn: 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/10'
    },
    warning: {
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/10'
    },
    info: {
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      confirmBtn: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/10'
    }
  };

  const currentTheme = colorVariants[type] || colorVariants.warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-800/40"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Body */}
        <div className="flex gap-4 items-start">
          <div className={`p-3 border rounded-xl flex-shrink-0 ${currentTheme.iconBg}`}>
            {type === 'info' ? (
              <HelpCircle className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-200">{title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Control actions */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${currentTheme.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
