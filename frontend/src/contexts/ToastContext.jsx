import React, { createContext, useState, useContext } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
  };

  const typeStyles = {
    success: 'bg-emerald-950/80 border-emerald-500/20 text-emerald-100',
    error: 'bg-red-950/80 border-red-500/20 text-red-100',
    warning: 'bg-yellow-950/80 border-yellow-500/20 text-yellow-100',
    info: 'bg-blue-950/80 border-blue-500/20 text-blue-100'
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start justify-between gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-emerald-950/10 ${typeStyles[toast.type]}`}
          >
            <div className="flex items-start gap-2.5">
              {icons[toast.type]}
              <span className="text-sm font-medium leading-relaxed">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-md hover:bg-slate-800/40 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
