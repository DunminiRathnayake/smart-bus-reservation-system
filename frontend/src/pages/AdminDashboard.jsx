import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reportService from '../services/reportService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';
import {
  Users,
  Bus,
  UserCheck,
  Compass,
  Calendar,
  CreditCard,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

/**
 * Admin Dashboard showing system-wide statistics, active counters, and booking status layouts.
 */
const AdminDashboard = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await reportService.getDashboardStats();
      if (response.success && response.data?.summary) {
        setStats(response.data.summary);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-16 bg-slate-900 border border-slate-850 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton type="stats" count={6} />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Stats Aggregation Failed</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Failed to load system metrics. Return to dashboard or try again.
        </p>
        <button
          onClick={fetchStats}
          className="mt-6 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-slate-950 transition-colors"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Calculate booking distribution percentages for visualization
  const totalBookings = stats.pendingBookings + stats.confirmedBookings + stats.cancelledBookings || 1;
  const confirmedPct = Math.round((stats.confirmedBookings / totalBookings) * 100);
  const pendingPct = Math.round((stats.pendingBookings / totalBookings) * 100);
  const cancelledPct = Math.round((stats.cancelledBookings / totalBookings) * 100);

  const statCards = [
    { label: 'Total Passengers', value: stats.totalUsers, icon: <Users className="h-5 w-5" />, desc: 'Registered accounts' },
    { label: 'Active Buses', value: `${stats.activeBuses} / ${stats.totalBuses}`, icon: <Bus className="h-5 w-5" />, desc: 'Buses in operations' },
    { label: 'Drivers Shift', value: `${stats.activeDrivers} / ${stats.totalDrivers}`, icon: <UserCheck className="h-5 w-5" />, desc: 'Conductors online' },
    { label: 'Active Routes', value: stats.activeRoutes, icon: <Compass className="h-5 w-5" />, desc: 'Configured route paths' },
    { label: 'Today Bookings', value: stats.todayBookings, icon: <Calendar className="h-5 w-5" />, desc: 'Reserved tickets today' },
    { label: 'Today Revenue', value: `Rs. ${stats.todayRevenue.toFixed(2)}`, icon: <CreditCard className="h-5 w-5 text-emerald-400" />, desc: 'Today earnings' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Overview Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">SmartGo system stats and fleet performance logistics.</p>
        </div>
        <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-xl font-bold tracking-wider">
          LIVE STATUS
        </span>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-start justify-between shadow-lg">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <p className="text-2xl font-black text-slate-200">{card.value}</p>
              <p className="text-[10px] text-slate-450">{card.desc}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Booking Distributions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-6 shadow-xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Booking Status Spread
          </h3>

          <div className="space-y-4 relative z-10 pt-4">
            {/* Confirmed Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-350">Confirmed ({stats.confirmedBookings})</span>
                <span className="text-emerald-450">{confirmedPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${confirmedPct}%` }} />
              </div>
            </div>

            {/* Pending Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-350">Pending ({stats.pendingBookings})</span>
                <span className="text-amber-450">{pendingPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pendingPct}%` }} />
              </div>
            </div>

            {/* Cancelled Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-350">Cancelled ({stats.cancelledBookings})</span>
                <span className="text-red-455">{cancelledPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${cancelledPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fleet Actions */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-3">
            Quick Actions
          </h3>

          <div className="space-y-2">
            {[
              { label: 'Bus Configuration', path: '/admin/buses' },
              { label: 'Register Driver', path: '/admin/drivers' },
              { label: 'Route Placements', path: '/admin/routes' },
              { label: 'Trip Schedules', path: '/admin/schedules' }
            ].map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center justify-between p-3 border border-slate-850 hover:border-slate-800 bg-slate-950/40 rounded-xl text-xs text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition-all group"
              >
                <span>{action.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-550 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
