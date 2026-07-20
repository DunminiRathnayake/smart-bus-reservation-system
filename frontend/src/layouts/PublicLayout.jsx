import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Bus, LogIn, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import heroBg from '../assets/hero-bg.png';

/**
 * Public Layout representing the landing pages and booking searches.
 */
const PublicLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans relative">
      {/* Background Image Layer with reduced brightness and opacity */}
      {isHomePage && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%), url(${heroBg})`,
            opacity: 0.58, // Increased opacity to show highlighted bus
            filter: 'brightness(0.7)', // Slightly increased brightness
          }}
        />
      )}

      {/* Top Header */}
      <header className={`sticky top-0 z-50 border-b ${isHomePage ? 'border-white/5 bg-slate-950/30' : 'border-slate-900 bg-slate-950/90'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-extrabold tracking-tighter text-slate-100 font-mono italic">
              SMART<span className="text-emerald-400">GO</span>
            </span>
          </Link>

          <nav className="flex items-center space-x-8">
            <Link to="/search-bus" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors">
              Journeys
            </Link>
            <span className="text-sm font-semibold text-slate-500 cursor-not-allowed">
              Events
            </span>
            <Link to={user ? "/bookings" : "/login"} className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors">
              My Tickets
            </Link>
            <span className="text-sm font-semibold text-slate-500 cursor-not-allowed">
              Contact
            </span>
            
            {user ? (
              <Link
                to={user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-sm text-slate-100 transition-colors shadow-md shadow-emerald-500/10"
              >
                <User className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-sm transition-all text-slate-950 shadow"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Outlet */}
      <main className={isHomePage ? 'flex-grow w-full relative z-10' : 'flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10'}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={`border-t ${isHomePage ? 'border-white/5 bg-black/30' : 'border-slate-900 bg-slate-950/40'} relative z-10`}>
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
