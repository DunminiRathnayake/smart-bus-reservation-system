import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Bus, LogOut, User, LayoutDashboard, History } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Bus className="h-6 w-6 text-sky-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
              SmartGo
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/search-bus" className="hover:text-sky-400 transition-colors">Search Buses</Link>
            {user ? (
              <>
                <Link to="/bookings" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <History className="h-4 w-4" /> My Bookings
                </Link>
                {user.role === 'ROLE_ADMIN' && (
                  <Link to="/admin" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                    <LayoutDashboard className="h-4 w-4" /> Admin Panel
                  </Link>
                )}
                {user.role === 'ROLE_PASSENGER' && (
                  <Link to="/dashboard" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                )}
                
                <div className="flex items-center space-x-4 border-l border-slate-800 pl-6">
                  <Link to="/profile" className="flex items-center gap-1.5 hover:text-sky-400 transition-colors">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Hi, {user.fullName || 'User'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-red-400 transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-sky-400 transition-colors">Login</Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-md font-semibold text-sm transition-colors text-slate-950 shadow-md shadow-sky-500/10"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Outlet Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Shared Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} SmartGo System. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
