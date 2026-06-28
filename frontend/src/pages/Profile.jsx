import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import userService from '../services/userService';
import PageLoader from '../components/common/PageLoader';
import { User, Shield, Info, Calendar, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  phoneNumber: z.string().min(5, 'Please provide a valid phone number')
});

/**
 * Profile Settings page allowing passengers to update name/phone, displaying role badges and registration dates.
 */
const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', phoneNumber: '' }
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await userService.getMe();
      if (response.success && response.data?.user) {
        const u = response.data.user;
        setValue('fullName', u.fullName || '');
        setValue('phoneNumber', u.phoneNumber || '');
      }
    } catch (err) {
      addToast('Failed to load profile parameters.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await userService.updateMe(data);
      if (response.success) {
        addToast('Profile settings updated successfully.', 'success');
        refreshUser(); // Sync AuthContext
      } else {
        addToast(response.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      addToast(err.normalizedMessage || 'Server error updating profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoader message="Loading profile settings..." />;

  const statusBadgeStyles = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    SUSPENDED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <User className="h-6 w-6 text-emerald-400" /> Profile Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Editable Form */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-4 relative z-10">
            Edit Information
          </h3>

          <form className="space-y-4 relative z-10" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                {...registerField('fullName')}
                className={`w-full bg-slate-950 border ${
                  errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-slate-200`}
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 555-5555"
                {...registerField('phoneNumber')}
                className={`w-full bg-slate-950 border ${
                  errors.phoneNumber ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-slate-200`}
                disabled={isSubmitting}
              />
              {errors.phoneNumber && (
                <p className="text-red-400 text-xs mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Email (Read-Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Email Address (Read Only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-slate-950/40 border border-slate-850/60 rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Profile Settings'
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Account Metadata Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-5 shadow-lg">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-850 pb-3">
              Account Summary
            </h4>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3 items-start">
                <Shield className="h-4.5 w-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">System Role</span>
                  <p className="font-bold text-slate-350">{user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Passenger'}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Info className="h-4.5 w-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Account Status</span>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${statusBadgeStyles[user?.status] || statusBadgeStyles.ACTIVE}`}>
                      {user?.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start border-t border-slate-850 pt-4">
                <Calendar className="h-4.5 w-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Member Since</span>
                  <p className="font-bold text-slate-350">{formattedJoinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
