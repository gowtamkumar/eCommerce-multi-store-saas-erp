'use client';

import { UserRole } from '@/lib/enums/user-role.enum';
import { UserStatus } from '@/lib/enums/user-status.enum';
import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Loader2, Search, Shield, Store, User as UserIcon, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  username: string;
  phone?: string;
  address?: string;
  tenantId?: {
    id: string;
    storeName: string;
    subdomain: string;
  };
}

interface UserListProps {
  initialUsers: User[];
}

export default function UserList({ initialUsers }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    setUpdatingId(userId);
    try {
      const res = await fetchAPI(`/tenant-traffic/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
        toast.success(`User status updated to ${newStatus}`);
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Connection error while updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Global User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage all {users.length} users across the entire platform.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm antialiased"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Associated Store</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic font-medium">No users found matching your search.</td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white capitalize">{user.name}</p>
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
                          <span className={`text-xs font-bold uppercase ${user.role === UserRole.SUPER_ADMIN ? 'text-rose-500' :
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
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg">Platform</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setSelectedUser(user)}
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
                                onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
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
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Modal Content */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                      <UserIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize">{selectedUser.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">@{selectedUser.username}</span>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{selectedUser.role?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Email</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{selectedUser.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <CheckCircle className="w-4 h-4 text-indigo-500" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Phone</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedUser.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Location</h3>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedUser.address || 'No address saved.'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Platform Context</h3>
                      <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner">
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
                            <Store className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Store Membership</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.tenantId?.storeName || 'General Platform'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Orders</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">0</p>
                          </div>
                          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                          <div className="text-center flex-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
                            <span className={`text-xs font-black uppercase ${selectedUser.status === UserStatus.ACTIVE ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {selectedUser.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-auto">
                      <button
                        onClick={() => handleStatusChange(selectedUser.id, selectedUser.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE)}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl ${selectedUser.status === UserStatus.ACTIVE
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                          }`}
                      >
                        {selectedUser.status === UserStatus.ACTIVE ? (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            Block User
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Unblock User
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
