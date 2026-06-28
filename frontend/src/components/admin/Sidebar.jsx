import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ShieldCheck,
  Bell,
  Ticket
} from 'lucide-react';

/**
 * Reusable admin collapsible navigation sidebar.
 */
const Sidebar = ({ sidebarOpen, setSidebarOpen, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { label: 'Buses', path: '/admin/buses', icon: <Bus className="h-5 w-5" /> },
    { label: 'Drivers', path: '/admin/drivers', icon: <Users className="h-5 w-5" /> },
    { label: 'Routes', path: '/admin/routes', icon: <Compass className="h-5 w-5" /> },
    { label: 'Schedules', path: '/admin/schedules', icon: <CalendarDays className="h-5 w-5" /> },
    { label: 'Bookings', path: '/admin/bookings', icon: <FileText className="h-5 w-5" /> },
    { label: 'Payments', path: '/admin/payments', icon: <CreditCard className="h-5 w-5" /> },
    { label: 'Tickets', path: '/admin/tickets', icon: <Ticket className="h-5 w-5" /> },
    { label: 'Notifications', path: '/admin/notifications', icon: <Bell className="h-5 w-5" /> }
  ];

  return (
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
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl font-medium text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
