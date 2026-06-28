import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Bus, LogIn, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Public Layout representing the landing pages and booking searches.
 */
const PublicLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-105 transition-all">
              <Bus className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              SmartGo
            </span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link to="/search-bus" className="text-sm font-medium hover:text-emerald-400 transition-colors">
              Search Buses
            </Link>
            
            {user ? (
              <Link
                to={user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-sm text-slate-950 transition-colors shadow-md shadow-emerald-500/10"
              >
                <User className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl font-semibold text-sm transition-colors text-slate-200"
              >
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SmartGo Reservation System. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
