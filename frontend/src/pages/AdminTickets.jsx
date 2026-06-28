import React, { useState, useEffect } from 'react';
import ticketService from '../services/ticketService';
import DataTable from '../components/admin/DataTable';
import StatusBadge from '../components/admin/StatusBadge';
import Pagination from '../components/admin/Pagination';
import SearchFilterBar from '../components/admin/SearchFilterBar';
import ActionMenu from '../components/admin/ActionMenu';
import { useToast } from '../contexts/ToastContext';
import { Ticket, QrCode, AlertCircle, Scan, ShieldCheck, Loader2 } from 'lucide-react';

/**
 * Administrative Boarding Passes listing & QR Validation simulator.
 */
const AdminTickets = () => {
  const { addToast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);

  // Scan Simulator Modal
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [simulatorDevice, setSimulatorDevice] = useState('DEVICE-TERM-01');
  const [simulatorLocation, setSimulatorLocation] = useState('Colombo Main Station');
  const [isScanning, setIsScanning] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };
      if (statusFilter !== 'ALL') {
        query.status = statusFilter;
      }

      const response = await ticketService.getTickets(query);
      if (response.success && response.data) {
        setTickets(response.data.tickets || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load tickets rosters:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage, statusFilter, searchTerm]);

  const handleOpenScanSimulator = (ticketItem) => {
    setActiveTicket(ticketItem);
    setScanModalOpen(true);
  };

  const handleExecuteScan = async () => {
    setIsScanning(true);
    try {
      // Simulate validation request endpoint
      const payload = {
        qrPayload: {
          ticketCode: activeTicket.ticketCode,
          bookingCode: activeTicket.bookingId?.bookingCode || 'BK-MOCK',
          scheduleId: activeTicket.scheduleId?._id || 'SCH-MOCK',
          issuedAt: activeTicket.createdAt,
          version: '1.0'
        },
        qrHash: activeTicket.qrHash || 'mock-hash-checksum-validated',
        deviceId: simulatorDevice,
        boardingLocation: simulatorLocation
      };

      const response = await ticketService.scanTicket(payload);
      if (response.success) {
        addToast('Ticket scanned & validated. Boarding approved!', 'success');
        setScanModalOpen(false);
        fetchTickets();
      } else {
        addToast(response.message || 'Validation rejected.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Verification failed. Ticket already scanned or cancelled.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleViewDetails = (ticketItem) => {
    setActiveTicket(ticketItem);
    setDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const filters = [
    {
      name: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: (val) => {
        setStatusFilter(val);
        setCurrentPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Used', value: 'USED' },
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Expired', value: 'EXPIRED' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Ticket className="h-6 w-6 text-emerald-400" /> Digital Tickets Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">Verify passenger boarding passes, audit scan locations, and simulate QR check-ins.</p>
        </div>
      </div>

      {/* Filter bar */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search ticket code or name..."
        filters={filters}
        onReset={handleResetFilters}
      />

      {/* Data Table */}
      <DataTable
        headers={['Ticket Code', 'Booking Ref', 'Passenger Name', 'Route Terminal', 'Seat Codes', 'Status', 'Actions']}
        loading={loading}
        error={error}
        data={tickets}
        onRetry={fetchTickets}
        emptyTitle="No Tickets Found"
        emptyDescription="Try adjusting filters or search queries."
        renderRow={(ticketItem) => {
          const isScanable = ticketItem.status === 'ACTIVE';

          return (
            <tr key={ticketItem._id} className="hover:bg-slate-850/20 text-slate-350 transition-colors">
              <td className="p-4 sm:p-5 font-mono text-emerald-450 font-bold">{ticketItem.ticketCode}</td>
              <td className="p-4 sm:p-5 font-mono text-slate-450">{ticketItem.bookingId?.bookingCode || 'N/A'}</td>
              <td className="p-4 sm:p-5 text-slate-200 font-semibold">{ticketItem.bookingId?.passengerName || 'N/A'}</td>
              <td className="p-4 sm:p-5">
                {ticketItem.scheduleId?.routeId?.origin} ➔ {ticketItem.scheduleId?.routeId?.destination}
              </td>
              <td className="p-4 sm:p-5 font-mono font-bold">{ticketItem.seats?.join(', ')}</td>
              <td className="p-4 sm:p-5">
                <StatusBadge status={ticketItem.status} />
              </td>
              <td className="p-4 sm:p-5 text-right">
                <ActionMenu
                  onView={() => handleViewDetails(ticketItem)}
                  onChangeStatus={isScanable ? () => handleOpenScanSimulator(ticketItem) : null}
                  statusLabel="Scan Verification"
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

      {/* Details / QR Payload Modal */}
      {detailModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-850 rounded-3xl shadow-xl p-6 overflow-hidden animate-zoom-in">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 relative z-10">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
                <QrCode className="h-5 w-5 text-emerald-400" /> Boarding QR Payload
              </h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-250 font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 relative z-10 text-xs text-slate-350 leading-relaxed">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Database QR Cryptographic Hash</span>
                <p className="font-mono bg-slate-950 p-3 rounded-xl border border-slate-855 text-[10px] break-all select-all text-slate-400">
                  {activeTicket.qrHash || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Scanned Locations</span>
                  <p className="font-bold text-slate-200 mt-0.5">{activeTicket.validatedFrom || 'Pending boarding'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Scanned Time</span>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {activeTicket.validatedAt ? new Date(activeTicket.validatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Terminal Device</span>
                  <p className="font-mono text-slate-300 mt-0.5">{activeTicket.deviceId || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Ticket Version</span>
                  <p className="font-bold text-slate-200 mt-0.5">v1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Validation Scan Simulator */}
      {scanModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl shadow-xl p-6 overflow-hidden animate-zoom-in">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 relative z-10">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
                <Scan className="h-5 w-5 text-emerald-400" /> Conductor Scan Simulator
              </h3>
              <button
                onClick={() => setScanModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-250 font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4 relative z-10 text-xs text-slate-300">
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-1.5">
                <span className="text-[9px] text-slate-550 font-bold uppercase">Ticket Selected</span>
                <p className="font-bold text-emerald-400">{activeTicket.ticketCode} ({activeTicket.bookingId?.passengerName})</p>
                <p className="text-[10px] text-slate-500">Seats: {activeTicket.seats?.join(', ')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider">Boarding Station Terminal</label>
                <input
                  type="text"
                  value={simulatorLocation}
                  onChange={(e) => setSimulatorLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider">Device ID</label>
                <input
                  type="text"
                  value={simulatorDevice}
                  onChange={(e) => setSimulatorDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
                />
              </div>

              <button
                onClick={handleExecuteScan}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 mt-6"
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying QR hashes...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Validate Boarding Pass
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
