import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, ChevronDown } from 'lucide-react';

/**
 * Reusable admin dashboard header. Renders title breadcrumbs, alert bells, and session avatars.
 */
const AdminHeader = ({ user, sidebarOpen, setSidebarOpen, onLogout }) => {
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium capitalize">
        <span>Admin</span>
        {paths.map((p, idx) => {
          if (p === 'admin') return null;
          return (
            <React.Fragment key={p}>
              <span>/</span>
              <span className={idx === paths.length - 1 ? 'text-emerald-400 font-semibold' : ''}>
                {p}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <header className="h-16 bg-slate-900/40 backdrop-blur-md border-b border-slate-850 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 w-full">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="hidden sm:block">
          {getBreadcrumbs()}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-4">
        {/* Notification bell */}
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
                <span className="text-xs font-bold text-slate-200">Alerts</span>
                <button
                  className="text-[10px] text-emerald-400 hover:underline"
                  onClick={() => setShowNotifications(false)}
                >
                  Close
                </button>
              </div>
              <div className="text-center text-xs text-slate-500 py-4">
                No active notifications.
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Droplist */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 hover:bg-slate-800/40 p-1.5 rounded-xl border border-transparent hover:border-slate-800 transition-all"
          >
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              A
            </div>
            <span className="text-xs font-medium text-slate-300 hidden sm:block max-w-28 truncate">
              {user?.fullName || 'Admin'}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-550 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden z-30 animate-slide-in">
              <div className="p-4 border-b border-slate-800 bg-slate-950/20">
                <p className="text-xs font-bold text-slate-200 truncate">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 rounded-md">
                  System Administrator
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
                  onClick={onLogout}
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
  );
};

export default AdminHeader;
