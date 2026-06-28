import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import userService from '../services/userService';
import DataTable from '../components/admin/DataTable';
import StatusBadge from '../components/admin/StatusBadge';
import Pagination from '../components/admin/Pagination';
import SearchFilterBar from '../components/admin/SearchFilterBar';
import ActionMenu from '../components/admin/ActionMenu';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { Users as UsersIcon, Shield, Loader2 } from 'lucide-react';

const userEditSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (min 2 characters)'),
  role: z.string().min(1, 'Role selection is required'),
  status: z.string().min(1, 'Status selection is required')
});

/**
 * Administrative Users accounts management.
 */
const Users = () => {
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search, filter, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal editing states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Soft delete warning dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(userEditSchema),
    defaultValues: { fullName: '', role: 'ROLE_PASSENGER', status: 'ACTIVE' }
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const query = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };
      if (roleFilter !== 'ALL') query.role = roleFilter;
      if (statusFilter !== 'ALL') query.status = statusFilter;

      const response = await userService.getUsers(query);
      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load system users:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, searchTerm]);

  const handleOpenEdit = (userItem) => {
    setEditingUser(userItem);
    setValue('fullName', userItem.fullName);
    setValue('role', userItem.role);
    setValue('status', userItem.status);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await userService.updateUser(editingUser._id, data);
      if (response.success) {
        addToast('User settings updated successfully.', 'success');
        setModalOpen(false);
        fetchUsers();
      } else {
        addToast(response.message || 'Action failed.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Error connecting to user service.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await userService.deleteUser(selectedDeleteId);
      if (response.success) {
        addToast('Passenger account deactivated and soft-deleted.', 'success');
        fetchUsers();
      } else {
        addToast(response.message || 'Deletion failed.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Error removing user.', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const filters = [
    {
      name: 'role',
      label: 'Role',
      value: roleFilter,
      onChange: (val) => {
        setRoleFilter(val);
        setCurrentPage(1);
      },
      options: [
        { label: 'All Roles', value: 'ALL' },
        { label: 'Administrator', value: 'ROLE_ADMIN' },
        { label: 'Passenger', value: 'ROLE_PASSENGER' }
      ]
    },
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
        { label: 'Suspended', value: 'SUSPENDED' },
        { label: 'Pending', value: 'PENDING' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-emerald-400" /> Users Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">Audit user credentials, configure roles, and adjust system permissions.</p>
        </div>
      </div>

      {/* Filter controls */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search user name or email..."
        filters={filters}
        onReset={handleResetFilters}
      />

      {/* Data list table */}
      <DataTable
        headers={['User Details', 'Email Address', 'System Role', 'Status', 'Actions']}
        loading={loading}
        error={error}
        data={users}
        onRetry={fetchUsers}
        emptyTitle="No Users Found"
        emptyDescription="Try clearing filters or search queries."
        renderRow={(userItem) => (
          <tr key={userItem._id} className="hover:bg-slate-850/20 text-slate-350 transition-colors">
            <td className="p-4 sm:p-5 font-semibold text-slate-200">{userItem.fullName}</td>
            <td className="p-4 sm:p-5 text-slate-450">{userItem.email}</td>
            <td className="p-4 sm:p-5">
              <span className="font-semibold text-[10px] text-slate-400 tracking-wide uppercase">
                {userItem.role === 'ROLE_ADMIN' ? 'Administrator' : 'Passenger'}
              </span>
            </td>
            <td className="p-4 sm:p-5">
              <StatusBadge status={userItem.status} />
            </td>
            <td className="p-4 sm:p-5 text-right">
              <ActionMenu
                onEdit={() => handleOpenEdit(userItem)}
                onDelete={() => handleDeleteClick(userItem._id)}
              />
            </td>
          </tr>
        )}
      />

      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl shadow-xl p-6 overflow-hidden animate-zoom-in">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 relative z-10">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
                <Shield className="h-5 w-5 text-emerald-400" /> Edit System Permissions
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-250 font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10 text-xs text-slate-300">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-450 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  {...registerField('fullName')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                />
                {errors.fullName && <p className="text-red-400 text-[10px] mt-0.5">{errors.fullName.message}</p>}
              </div>

              {/* Roles */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-455 uppercase tracking-wider">Role</label>
                <select
                  {...registerField('role')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-350 font-medium"
                >
                  <option value="ROLE_PASSENGER">Passenger</option>
                  <option value="ROLE_ADMIN">Administrator</option>
                </select>
                {errors.role && <p className="text-red-400 text-[10px] mt-0.5">{errors.role.message}</p>}
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-455 uppercase tracking-wider">Duty Status</label>
                <select
                  {...registerField('status')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500 text-slate-350 font-medium"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING">Pending</option>
                </select>
                {errors.status && <p className="text-red-400 text-[10px] mt-0.5">{errors.status.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Soft-Delete User?"
        description="Are you sure you want to delete this account? The user will lose system credentials but transaction data will remain."
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
};

export default Users;
