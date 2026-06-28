import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Bus } from 'lucide-react';

/**
 * AuthLayout wrapping Login and Registration forms.
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link to="/" className="inline-flex items-center gap-2.5 text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent group">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 group-hover:scale-105 transition-all">
            <Bus className="h-8 w-8" />
          </div>
          SmartGo
        </Link>
        <h2 className="text-xl font-semibold text-slate-300">
          Smart Bus Reservation & Fleet System
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/40 backdrop-blur-md py-8 px-6 border border-slate-900 rounded-2xl shadow-xl shadow-emerald-950/5 sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
