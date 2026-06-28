import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import {
  Bus,
  LayoutDashboard,
  Search,
  History,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Ticket,
  ChevronDown
} from 'lucide-react';

/**
 * Passenger Layout featuring sidebar navigation, top bar search placeholders,
 * notification bells, role badges, and profile action dropdowns.
 */
const PassengerLayout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    addToast('Signed out successfully.', 'info');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Search Bus', path: '/search-bus', icon: <Search className="h-5 w-5" /> },
    { label: 'My Bookings', path: '/bookings', icon: <History className="h-5 w-5" /> },
    { label: 'My Tickets', path: '/tickets', icon: <Ticket className="h-5 w-5" /> },
    { label: 'Notifications', path: '/notifications', icon: <Bell className="h-5 w-5" /> },
    { label: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 bg-slate-900 border-r border-slate-850 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
        } overflow-hidden`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-850 flex-shrink-0">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Bus className="h-6 w-6" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent truncate">
              SmartGo
            </span>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-grow py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                title={item.label}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card / Log out button at bottom */}
        <div className="p-4 border-t border-slate-850 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl font-medium text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar Header */}
        <header className="h-16 bg-slate-900/40 backdrop-blur-md border-b border-slate-850 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Header Search Placeholder */}
            <div className="hidden md:flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-1.5 w-64 text-slate-500">
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs">Search bookings, routes...</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Notification alert bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setProfileDropdownOpen(false);
                }}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 space-y-3 z-30 animate-slide-in">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200">Notifications</span>
                    <button
                      className="text-[10px] text-emerald-400 hover:underline"
                      onClick={() => setShowNotifications(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="text-center text-xs text-slate-500 py-4">
                    No unread notification updates.
                  </div>
                </div>
              )}
            </div>

            {/* Profile Droplist */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 hover:bg-slate-800/40 p-1.5 rounded-xl border border-transparent hover:border-slate-800 transition-all"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {(user?.fullName || 'P').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-300 hidden sm:block max-w-28 truncate">
                  {user?.fullName || 'Passenger'}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden z-30 animate-slide-in">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/20">
                    <p className="text-xs font-bold text-slate-200 truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 rounded-md">
                      Passenger Account
                    </span>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-grow p-4 sm:p-6 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900/60 py-4 bg-slate-950/40 text-center text-[10px] text-slate-650 tracking-wider">
          © {new Date().getFullYear()} SmartGo Reservation. Fully encrypted passenger session.
        </footer>
      </div>
    </div>
  );
};

export default PassengerLayout;
