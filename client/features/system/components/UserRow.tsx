'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Store, User as UserIcon, Info, Loader2, UserCheck } from 'lucide-react';
import { UserRole } from '@/lib/enums/user-role.enum';
import { UserStatus } from '@/lib/enums/user-status.enum';
import { User } from '../types/user-management.types';

interface UserRowProps {
  user: User;
  updatingId: string | null;
  onStatusChange: (userId: string, newStatus: UserStatus) => void;
  onSelectUser: (user: User) => void;
  onImpersonate?: (userId: string) => void;
  impersonatingId?: string | null;
}

const UserRow = ({
  user,
  updatingId,
  onStatusChange,
  onSelectUser,
  onImpersonate,
  impersonatingId,
}: UserRowProps) => {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white capitalize leading-tight">{user.name}</p>
            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {user.role === UserRole.SUPER_ADMIN ? (
            <Shield className="w-4 h-4 text-rose-500" />
          ) : user.role === UserRole.ADMIN ? (
            <Shield className="w-4 h-4 text-indigo-500" />
          ) : (
            <UserIcon className="w-4 h-4 text-slate-400" />
          )}
          <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === UserRole.SUPER_ADMIN ? 'text-rose-500' :
            user.role === UserRole.ADMIN ? 'text-indigo-500' : 'text-slate-500'
            }`}>
            {user.role?.replace('_', ' ')}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        {user.tenantId ? (
          <div className="flex items-center gap-2 text-slate-900 dark:text-white text-sm">
            <Store className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">{user.tenantId.storeName}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
              {user.tenantId.subdomain}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">Platform</span>
        )}
      </td>
      <td className="px-6 py-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          {onImpersonate && (
            <button
              onClick={() => onImpersonate(user.id)}
              disabled={updatingId !== null || (impersonatingId !== undefined && impersonatingId !== null)}
              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all disabled:opacity-30"
              title="Impersonate User"
            >
              {impersonatingId === user.id ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              ) : (
                <UserCheck className="w-5 h-5" />
              )}
            </button>
          )}

          <button
            onClick={() => onSelectUser(user)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
            title="View Details"
          >
            <Info className="w-5 h-5" />
          </button>

          <div className="relative">
            {updatingId === user.id ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            ) : (
              <select
                value={user.status}
                onChange={(e) => onStatusChange(user.id, e.target.value as UserStatus)}
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border-0 outline-none cursor-pointer appearance-none transition-all pr-1 ${user.status === UserStatus.ACTIVE
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                  }`}
              >
                <option value={UserStatus.ACTIVE}>Active</option>
                <option value={UserStatus.BLOCKED}>Blocked</option>
              </select>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  );
};

export default React.memo(UserRow);
