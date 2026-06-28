import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import {
  Bus,
  LayoutDashboard,
  Users,
  Compass,
  CalendarDays,
  FileText,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  Settings,
  User,
  Ticket,
  ChevronDown
} from 'lucide-react';

/**
 * Admin Layout featuring sidebar controls, dashboard headers, breadcrumbs,
 * notification bell widgets, user menus, and role badges.
 */
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    addToast('Admin signed out successfully.', 'info');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Users', path: '/profile', icon: <Users className="h-5 w-5" /> }, // Fallback profile / users path
    { label: 'Buses', path: '/admin/buses', icon: <Bus className="h-5 w-5" /> },
    { label: 'Drivers', path: '/admin/drivers', icon: <Users className="h-5 w-5" /> },
    { label: 'Routes', path: '/admin/routes', icon: <Compass className="h-5 w-5" /> },
    { label: 'Schedules', path: '/admin/schedules', icon: <CalendarDays className="h-5 w-5" /> },
    { label: 'Bookings', path: '/admin/bookings', icon: <FileText className="h-5 w-5" /> },
    { label: 'Payments', path: '/admin/payments', icon: <CreditCard className="h-5 w-5" /> },
    { label: 'Tickets', path: '/admin/payments', icon: <Ticket className="h-5 w-5" /> }, // Maps to payment / tickets admin checks
    { label: 'Notifications', path: '/admin', icon: <Bell className="h-5 w-5" /> },
    { label: 'Reports', path: '/admin/reports', icon: <BarChart3 className="h-5 w-5" /> }
  ];

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-x-hidden">
      {/* Mobile Drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 bg-slate-900 border-r border-slate-850 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
        } overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-850 flex-shrink-0">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent truncate">
              SmartGo Admin
            </span>
          )}
        </div>

        {/* Navigation list */}
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

        {/* Logout button at bottom */}
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

      {/* Admin Content Area */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* Top Header navbar */}
        <header className="h-16 bg-slate-900/40 backdrop-blur-md border-b border-slate-850 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          {/* Left panel info */}
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
            {/* Notification trigger bell */}
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
                  A
                </div>
                <span className="text-xs font-medium text-slate-300 hidden sm:block max-w-28 truncate">
                  {user?.fullName || 'Admin'}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500 hidden sm:block" />
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
          © {new Date().getFullYear()} SmartGo. Administrator session.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
