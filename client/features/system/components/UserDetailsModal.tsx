'use client';

import { UserStatus } from '@/lib/enums/user-status.enum';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2, Store, User as UserIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { User } from '../types/user-management.types';
import { fetchSuperAdminAPI } from '@/services/superAdminApi';
import toast from 'react-hot-toast';

interface UserDetailsModalProps {
  user: User | null;
  updatingId: string | null;
  onClose: () => void;
  onStatusChange: (userId: string, newStatus: UserStatus) => void;
}

const UserDetailsModal = ({
  user,
  updatingId,
  onClose,
  onStatusChange,
}: UserDetailsModalProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleForcePasswordReset = async () => {
    if (!user) return;
    setIsResetting(true);
    try {
      const res = await fetchSuperAdminAPI(`/super-admin/users/${user.id}/force-password-reset`, {
        method: 'POST',
      });
      if (res.success) {
        toast.success('User will be forced to reset password on next login.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to force password reset');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSendVerification = async () => {
    if (!user) return;
    setIsVerifying(true);
    try {
      const res = await fetchSuperAdminAPI(`/super-admin/users/${user.id}/send-verification`, {
        method: 'POST',
      });
      if (res.success) {
        toast.success('Verification email sent successfully.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to send verification email');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize leading-none mb-2">{user.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">@{user.username}</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-widest leading-none">{user.role?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Email Address</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 shadow-sm">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Phone Number</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Location</h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.address || 'No address saved.'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Platform Context</h3>
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200/50 dark:border-slate-700/50">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                        <Store className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2">Store Membership</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">{user.tenantId?.storeName || 'Global Platform'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2">Orders</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">0</p>
                      </div>
                      <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
                      <div className="text-center flex-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2">Status</p>
                        <span className={`text-xs font-black uppercase tracking-widest ${user.status === UserStatus.ACTIVE ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-auto space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleForcePasswordReset}
                      disabled={isResetting}
                      className="py-3 rounded-2xl font-bold uppercase tracking-wider text-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Force Password Reset'}
                    </button>
                    <button
                      onClick={handleSendVerification}
                      disabled={isVerifying}
                      className="py-3 rounded-2xl font-bold uppercase tracking-wider text-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send Verification'}
                    </button>
                  </div>

                  <button
                    onClick={() => onStatusChange(user.id, user.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE)}
                    disabled={updatingId === user.id}
                    className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl ${user.status === UserStatus.ACTIVE
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                      } disabled:opacity-50`}
                  >
                    {updatingId === user.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : user.status === UserStatus.ACTIVE ? (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        Block Security Access
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Restore Security Access
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(UserDetailsModal);
