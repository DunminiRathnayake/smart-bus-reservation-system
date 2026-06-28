import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import notificationService from '../services/notificationService';
import DataTable from '../components/admin/DataTable';
import Pagination from '../components/admin/Pagination';
import SearchFilterBar from '../components/admin/SearchFilterBar';
import { useToast } from '../contexts/ToastContext';
import { Bell, Megaphone, Loader2 } from 'lucide-react';

const broadcastSchema = z.object({
  title: z.string().min(2, 'Broadcast title is required (min 2 characters)'),
  message: z.string().min(5, 'Broadcast message is required (min 5 characters)')
});

/**
 * Administrative Notifications console. Enables system-wide broadcast dispatch and audit logs.
 */
const AdminNotifications = () => {
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: '', message: '' }
  });

  const fetchNotifications = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };

      const response = await notificationService.getNotifications(query);
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load notifications history:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, searchTerm]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await notificationService.broadcastNotification(data);
      if (response.success) {
        addToast('Global system broadcast dispatched successfully.', 'success');
        reset({ title: '', message: '' });
        fetchNotifications();
      } else {
        addToast(response.message || 'Dispatch failed.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Error broadcasting alert.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="h-6 w-6 text-emerald-400" /> Notifications & Broadcasts
          </h2>
          <p className="text-xs text-slate-400 mt-1">Audit notification logs and dispatch global alerts to all active accounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: List table */}
        <div className="lg:col-span-2 space-y-4">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search message content..."
            onReset={() => setSearchTerm('')}
          />

          <DataTable
            headers={['Date & Time', 'Title / Details', 'Target Type']}
            loading={loading}
            error={error}
            data={notifications}
            onRetry={fetchNotifications}
            emptyTitle="No Alerts Dispatched"
            emptyDescription="Dispatched system logs will appear here."
            renderRow={(notif) => {
              const formattedDate = notif.createdAt
                ? new Date(notif.createdAt).toLocaleString()
                : 'N/A';
              const isGlobal = !notif.userId;

              return (
                <tr key={notif._id} className="hover:bg-slate-850/20 text-slate-350 transition-colors">
                  <td className="p-4 sm:p-5 font-mono text-[10px] text-slate-450">{formattedDate}</td>
                  <td className="p-4 sm:p-5">
                    <div className="space-y-1 max-w-sm">
                      <p className="font-semibold text-slate-200">{notif.title || 'System Alert'}</p>
                      <p className="text-[11px] leading-relaxed break-words text-slate-400">{notif.message}</p>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                      isGlobal
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-750'
                    }`}>
                      {isGlobal ? 'GLOBAL BROADCAST' : 'INDIVIDUAL'}
                    </span>
                  </td>
                </tr>
              );
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Column: Dispatch Broadcast Form */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-5 shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-1.5 relative z-10">
            <Megaphone className="h-4.5 w-4.5 text-emerald-400" /> Dispatch System Broadcast
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10 text-xs text-slate-300">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-450 uppercase tracking-wider">Broadcast Title</label>
              <input
                type="text"
                placeholder="e.g. Schedule Delay Alert"
                {...registerField('title')}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
              />
              {errors.title && <p className="text-red-400 text-[10px] mt-0.5">{errors.title.message}</p>}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-450 uppercase tracking-wider">Message Content</label>
              <textarea
                placeholder="Type your notification message detail here..."
                rows={4}
                {...registerField('message')}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-250 leading-relaxed resize-none"
              />
              {errors.message && <p className="text-red-400 text-[10px] mt-0.5">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Dispatched...
                </>
              ) : (
                'Dispatch Broadcast'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
