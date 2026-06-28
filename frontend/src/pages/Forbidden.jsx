import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Access Denied (403) handler page.
 */
const Forbidden = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-950 px-4 text-slate-100 font-sans">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-900 p-8 rounded-2xl shadow-xl shadow-emerald-950/5">
        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full animate-pulse">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 to-amber-500 bg-clip-text text-transparent">
          403
        </h1>
        <h2 className="text-xl font-bold text-slate-200">Access Denied</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Your account does not possess the administrative privileges required to access this resource.
        </p>
        <Link
          to={user?.role === 'ROLE_ADMIN' ? '/admin' : '/'}
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-slate-950 transition-all shadow-md shadow-emerald-500/10"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
