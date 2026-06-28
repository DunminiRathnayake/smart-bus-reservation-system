import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinOff, ArrowLeft } from 'lucide-react';

/**
 * Premium 404 Route handler Page.
 */
const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-950 px-4 text-slate-100 font-sans">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-900 p-8 rounded-2xl shadow-xl shadow-emerald-950/5">
        <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full animate-bounce">
          <MapPinOff className="h-12 w-12" />
        </div>
        <h1 className="text-6xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-200">Route Not Found</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-slate-950 transition-all shadow-md shadow-emerald-500/10"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
