import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import {
  Bell,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

/**
 * Passenger Notifications console panel.
 */
const Notifications = () => {
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  const fetchNotifications = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 10
      };
      if (categoryFilter === 'UNREAD') {
        query.isRead = false;
      }

      const response = await notificationService.getMyNotifications(query);
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, categoryFilter]);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        addToast('Notification marked as read.', 'success');
        if (categoryFilter === 'UNREAD') {
          fetchNotifications();
        }
      } else {
        addToast(response.message || 'Failed to update alert.', 'error');
      }
    } catch (err) {
      addToast('Error marking notification.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        addToast('All notifications marked as read.', 'success');
        fetchNotifications();
      } else {
        addToast(response.message || 'Action failed.', 'error');
      }
    } catch (err) {
      addToast('Error marking all notifications.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-emerald-400" /> Notifications
        </h2>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle className="h-4 w-4 text-emerald-400" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-850 gap-6 text-sm font-semibold">
        {['ALL', 'UNREAD'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setCategoryFilter(tab);
              setCurrentPage(1);
            }}
            className={`pb-3 capitalize transition-all border-b-2 ${
              categoryFilter === tab
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {loading ? (
          <LoadingSkeleton type="list" count={4} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900 border border-slate-850 rounded-2xl">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-slate-350 text-sm">Failed to retrieve notifications list.</p>
            <button onClick={fetchNotifications} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors">
              Retry
            </button>
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 border rounded-2xl flex items-center justify-between gap-4 transition-colors ${
                    notif.isRead
                      ? 'bg-slate-900/30 border-slate-900 text-slate-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-semibold leading-relaxed break-words">{notif.message}</p>
                    <span className="text-[9px] text-slate-650 font-bold uppercase tracking-wider">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-855">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="All Clear!"
            description="You don't have any notifications at the moment. We'll update you when new events arise."
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;
