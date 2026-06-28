import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
  Settings
} from 'lucide-react';

/**
 * Admin Layout featuring sidebar controls for bus, driver, route, schedule, booking, payment, and analytics management.
 */
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Buses', path: '/admin/buses', icon: <Bus className="h-5 w-5" /> },
    { label: 'Drivers', path: '/admin/drivers', icon: <Users className="h-5 w-5" /> },
    { label: 'Routes', path: '/admin/routes', icon: <Compass className="h-5 w-5" /> },
    { label: 'Schedules', path: '/admin/schedules', icon: <CalendarDays className="h-5 w-5" /> },
    { label: 'Bookings', path: '/admin/bookings', icon: <FileText className="h-5 w-5" /> },
    { label: 'Payments', path: '/admin/payments', icon: <CreditCard className="h-5 w-5" /> },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: <BarChart3 className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Collapsible Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 border-r border-slate-800/80 flex flex-col transition-all duration-300 z-30`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent truncate">
              SmartGo Admin
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-grow py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
                title={item.label}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout bottom */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl font-medium text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-md">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Setting Button */}
            <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors">
              <Settings className="h-5 w-5" />
            </button>

            {/* Profile Avatar info */}
            <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <span className="text-xs text-slate-400 hidden md:block truncate max-w-28">
                {user?.fullName || 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow p-6 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-850 py-4 bg-slate-950/40 text-center text-xs text-slate-650">
          © {new Date().getFullYear()} SmartGo. Administrative console secured under TLS regulations.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
