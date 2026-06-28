import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import DataTable from '../components/admin/DataTable';
import StatusBadge from '../components/admin/StatusBadge';
import Pagination from '../components/admin/Pagination';
import SearchFilterBar from '../components/admin/SearchFilterBar';
import ActionMenu from '../components/admin/ActionMenu';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { CreditCard, Eye, AlertCircle, RefreshCcw } from 'lucide-react';

/**
 * Administrative Payments & Refunds overrides panel.
 */
const Payments = () => {
  const { addToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Details Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  // Refund warning dialog
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };
      if (statusFilter !== 'ALL') {
        query.paymentStatus = statusFilter;
      }

      const response = await paymentService.getPayments(query);
      if (response.success && response.data) {
        setPayments(response.data.payments || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load transaction payments roster:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter, searchTerm]);

  const handleRefundClick = (id) => {
    setSelectedRefundId(id);
    setRefundDialogOpen(true);
  };

  const handleConfirmRefund = async () => {
    try {
      const response = await paymentService.refundPayment(selectedRefundId);
      if (response.success) {
        addToast('Payment refunded and seat reservations cancellation triggers updated.', 'success');
        fetchPayments();
      } else {
        addToast(response.message || 'Refund failed.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Error initiating refund.', 'error');
    }
  };

  const handleViewDetails = (payment) => {
    setActivePayment(payment);
    setDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const filters = [
    {
      name: 'paymentStatus',
      label: 'Status',
      value: statusFilter,
      onChange: (val) => {
        setStatusFilter(val);
        setCurrentPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'ALL' },
        { label: 'Successful', value: 'SUCCESS' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Refunded', value: 'REFUNDED' },
        { label: 'Failed', value: 'FAILED' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-400" /> Payments & Refunds
          </h2>
          <p className="text-xs text-slate-400 mt-1">Audit passenger payments, check gateway transaction refs, and issue credit refunds.</p>
        </div>
      </div>

      {/* Filter bar */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search transaction or booking ref..."
        filters={filters}
        onReset={handleResetFilters}
      />

      {/* Data Table */}
      <DataTable
        headers={['Transaction Ref', 'Booking Code', 'Paid Amount', 'Gateway Method', 'Payment Date', 'Status', 'Actions']}
        loading={loading}
        error={error}
        data={payments}
        onRetry={fetchPayments}
        emptyTitle="No Transactions Found"
        emptyDescription="Try clearing filters or search queries."
        renderRow={(payment) => {
          const formattedDate = payment.createdAt
            ? new Date(payment.createdAt).toLocaleDateString()
            : 'N/A';
          const isRefundable = payment.paymentStatus === 'SUCCESS';

          return (
            <tr key={payment._id} className="hover:bg-slate-850/20 text-slate-350 transition-colors">
              <td className="p-4 sm:p-5 font-mono text-slate-200">{payment.transactionReference}</td>
              <td className="p-4 sm:p-5 font-mono text-emerald-450">{payment.bookingId?.bookingCode || 'N/A'}</td>
              <td className="p-4 sm:p-5 font-mono text-slate-200 font-semibold">${payment.amount?.toFixed(2)}</td>
              <td className="p-4 sm:p-5 capitalize">{payment.paymentMethod || 'Card'}</td>
              <td className="p-4 sm:p-5">{formattedDate}</td>
              <td className="p-4 sm:p-5">
                <StatusBadge status={payment.paymentStatus} />
              </td>
              <td className="p-4 sm:p-5 text-right">
                <ActionMenu
                  onView={() => handleViewDetails(payment)}
                  onChangeStatus={isRefundable ? () => handleRefundClick(payment._id) : null}
                  statusLabel="Refund Transaction"
                />
              </td>
            </tr>
          );
        }}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Details Modal */}
      {detailModalOpen && activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl shadow-xl p-6 overflow-hidden animate-zoom-in">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 relative z-10">
              <h3 className="text-base font-bold text-slate-200">Transaction Details</h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-250 font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 relative z-10 text-xs text-slate-300 leading-relaxed">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Transaction Ref</span>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">{activePayment.transactionReference}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Booking Reference</span>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{activePayment.bookingId?.bookingCode || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Passenger Details</span>
                  <p className="font-bold text-slate-200 mt-0.5">{activePayment.bookingId?.passengerName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Payment Gateway</span>
                  <p className="font-bold text-slate-250 uppercase mt-0.5">{activePayment.paymentMethod || 'Card'}</p>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4 flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-450">Transaction Value</span>
                <span className="font-mono text-emerald-450 font-black">${activePayment.amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund warning dialog */}
      <ConfirmDialog
        isOpen={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        onConfirm={handleConfirmRefund}
        title="Refund Transaction?"
        description="Are you sure you want to refund this payment? The booking reservations status will be set to CANCELLED/REFUNDED and seats will be released."
        confirmText="Confirm Refund"
        type="danger"
      />
    </div>
  );
};

export default Payments;
