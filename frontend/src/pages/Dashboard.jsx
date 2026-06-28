import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import bookingService from '../services/bookingService';
import ticketService from '../services/ticketService';
import notificationService from '../services/notificationService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import {
  Compass,
  History,
  User,
  Bell,
  Ticket,
  ArrowRight,
  Calendar,
  Clock,
  Bus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

/**
 * Passenger dashboard with stats counters, upcoming ticket boarding passes,
 * quick action buttons, and active system alerts.
 */
const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [stats, setStats] = useState({ bookingsCount: 0, ticketsCount: 0, unreadNotifications: 0 });
  const [upcomingJourney, setUpcomingJourney] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [bookingsRes, ticketsRes, notificationsRes] = await Promise.all([
        bookingService.getMyBookings(),
        ticketService.getMyTickets(),
        notificationService.getMyNotifications({ limit: 3 })
      ]);

      if (bookingsRes.success && ticketsRes.success) {
        const bookingsList = bookingsRes.data.bookings || [];
        const ticketsList = ticketsRes.data.tickets || [];
        const notificationsList = notificationsRes.data?.notifications || [];

        // Calculate statistics
        const activeBookings = bookingsList.filter((b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PENDING').length;
        const totalTickets = ticketsList.length;
        const unreadCount = notificationsList.filter((n) => !n.isRead).length;

        setStats({
          bookingsCount: activeBookings,
          ticketsCount: totalTickets,
          unreadNotifications: unreadCount
        });

        // Find upcoming journey (Confirmed booking with travel date closest to now)
        const sortedUpcoming = bookingsList
          .filter((b) => b.bookingStatus === 'CONFIRMED' && b.scheduleId && new Date(b.scheduleId.travelDate) >= new Date().setHours(0,0,0,0))
          .sort((a, b) => new Date(a.scheduleId.travelDate) - new Date(b.scheduleId.travelDate));

        setUpcomingJourney(sortedUpcoming[0] || null);
        setRecentNotifications(notificationsList.slice(0, 3));
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load passenger dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setRecentNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setStats((prev) => ({ ...prev, unreadNotifications: Math.max(0, prev.unreadNotifications - 1) }));
        addToast('Notification marked as read.', 'success');
      }
    } catch (err) {
      addToast('Failed to mark notification as read.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-28 bg-slate-900 border border-slate-850 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton type="stats" count={3} />
        </div>
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Failed to Load Dashboard</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Please check your connection and click the button below to reload your dashboard.
        </p>
        <button
          onClick={fetchDashboardData}
          className="mt-6 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-slate-950 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Card Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Hi, {user?.fullName || 'Traveler'}!
          </h2>
          <p className="text-slate-400 text-sm max-w-md">
            Welcome back. Ready to reserve seats, track tickets, or find your next trip?
          </p>
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Bookings</span>
            <p className="text-3xl font-extrabold text-slate-100">{stats.bookingsCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <History className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Tickets</span>
            <p className="text-3xl font-extrabold text-slate-100">{stats.ticketsCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Ticket className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unread Alerts</span>
            <p className="text-3xl font-extrabold text-slate-100">{stats.unreadNotifications}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Bell className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid: Journey & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Journey */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Upcoming Journey</h3>
            {upcomingJourney ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-emerald-500/35 transition-all">
                <div className="bg-emerald-500/5 p-4 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    Booking Code: {upcomingJourney.bookingCode}
                  </span>
                  <span className="px-2.5 py-0.5 text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md font-bold uppercase">
                    {upcomingJourney.bookingStatus}
                  </span>
                </div>
                <div className="p-6 space-y-6">
                  {/* Destinations details */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Origin</p>
                      <h4 className="text-base font-bold text-slate-200 mt-0.5">
                        {upcomingJourney.scheduleId?.routeId?.origin}
                      </h4>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-400 animate-pulse" />
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Destination</p>
                      <h4 className="text-base font-bold text-slate-200 mt-0.5">
                        {upcomingJourney.scheduleId?.routeId?.destination}
                      </h4>
                    </div>
                  </div>

                  {/* Date and schedule tags */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-850 pt-4 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>{new Date(upcomingJourney.scheduleId?.travelDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 justify-end">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>{upcomingJourney.scheduleId?.departureTime}</span>
                    </div>
                  </div>

                  {/* Seat and Bus specifics */}
                  <div className="flex items-center justify-between border-t border-slate-850 pt-4 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-slate-500" />
                      <span className="font-semibold text-slate-350">
                        {upcomingJourney.scheduleId?.busId?.name || 'SmartGo Cruiser'}
                      </span>
                    </div>
                    <div>
                      Seats: <span className="font-mono font-bold text-emerald-400">{upcomingJourney.seats?.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 text-center">
                <p className="text-xs text-slate-500">No upcoming journey booked yet.</p>
                <Link
                  to="/search-bus"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/10"
                >
                  <Compass className="h-4 w-4" /> Book a Bus
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Links & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/search-bus"
                className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500/40 transition-colors shadow-md group"
              >
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
                  <Compass className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-300">Book Seat</span>
              </Link>

              <Link
                to="/profile"
                className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500/40 transition-colors shadow-md group"
              >
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-300">My Profile</span>
              </Link>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Alerts</h3>
              <Link to="/notifications" className="text-[10px] text-emerald-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-3.5 border rounded-xl flex items-start gap-3 transition-colors ${
                      notif.isRead
                        ? 'bg-slate-900/30 border-slate-900 text-slate-500'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="p-1 hover:bg-slate-800 rounded-md text-emerald-500 hover:text-emerald-400 flex-shrink-0"
                        title="Mark as read"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-semibold leading-relaxed truncate">{notif.message}</p>
                      <span className="text-[9px] text-slate-650 font-medium">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 text-center text-xs text-slate-500">
                  No notifications recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
