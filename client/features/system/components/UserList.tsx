'use client';

import { fetchAPI } from '@/services/api';
import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Search, Terminal, Filter, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { UserStatus } from '@/lib/enums/user-status.enum';
import { PaginationMeta, User, UserListProps } from '../types/user-management.types';
import UserDetailsModal from './UserDetailsModal';
import UserRow from './UserRow';

export default function UserList({ initialUsers, initialPagination }: UserListProps) {
  // Data State
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Filters State
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedTenantId, setSelectedTenantId] = useState('ALL');
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load tenants on mount
  useEffect(() => {
    const loadTenants = async () => {
      try {
        const res = await fetchSuperAdminAPI('/super-admin/tenants');
        if (res.success) setTenantsList(res.data || []);
      } catch (e) {
        console.error('Error loading tenants:', e);
      }
    };
    loadTenants();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Fetch users from server with pagination and filters
   */
  const fetchUsers = useCallback(async (page: number, q: string) => {
    setIsLoading(true);
    try {
      let endpoint = `/super-admin/users?page=${page}&limit=${pagination.limit}`;
      if (q) endpoint += `&q=${q}`;
      if (selectedRole !== 'ALL') endpoint += `&role=${selectedRole}`;
      if (selectedStatus !== 'ALL') endpoint += `&status=${selectedStatus}`;
      if (selectedTenantId !== 'ALL') endpoint += `&tenantId=${selectedTenantId}`;
      
      const res = await fetchSuperAdminAPI(endpoint);

      if (res.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to refresh users');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, selectedRole, selectedStatus, selectedTenantId]);

  // Refetch when search, role, status, or tenant changes
  useEffect(() => {
    fetchUsers(1, debouncedSearch);
  }, [debouncedSearch, selectedRole, selectedStatus, selectedTenantId, fetchUsers]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, debouncedSearch);
    }
  };

  const handleImpersonate = useCallback(async (userId: string) => {
    setImpersonatingId(userId);
    try {
      const res = await fetchSuperAdminAPI(`/super-admin/impersonate/${userId}`, {
        method: 'POST',
      });

      if (res.success && res.data?.redirectUrl) {
        toast.success(res.message || 'Impersonation successful, redirecting...');
        window.location.href = res.data.redirectUrl;
      } else {
        toast.error('Failed to get redirect URL for impersonation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate impersonation');
    } finally {
      setImpersonatingId(null);
    }
  }, []);

  const handleStatusChange = useCallback(async (userId: string, newStatus: UserStatus) => {
    setUpdatingId(userId);
    try {
      // Note: Endpoint might need to be adjusted based on actual API design
      const res = await fetchSuperAdminAPI(`/super-admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
        }
        toast.success(`User status updated to ${newStatus}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }, [selectedUser]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Identity Repository</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring {pagination.total} neural identities across the network cluster.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto items-center">
          <div className="relative flex-1 md:w-80">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isLoading ? 'text-indigo-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Query by identity name or mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium shadow-sm text-slate-900 dark:text-white"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              </div>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-medium ${showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/80'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button 
            onClick={() => fetchUsers(1, debouncedSearch)} 
            disabled={isLoading} 
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            title="Refresh users"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-wrap gap-6">
              {/* Role Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => { setSelectedRole(e.target.value); handlePageChange(1); }}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
                >
                  <option value="ALL">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); handlePageChange(1); }}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
                >
                  <option value="ALL">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Tenant Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Partition</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => { setSelectedTenantId(e.target.value); handlePageChange(1); }}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[180px] max-w-[280px]"
                >
                  <option value="ALL">All Stores (Global)</option>
                  {tenantsList.map((t) => (
                    <option key={t.id} value={t.id}>{t.storeName} ({t.subdomain})</option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              <div className="flex items-end">
                <button
                  onClick={() => { setSelectedRole('ALL'); setSelectedStatus('ALL'); setSelectedTenantId('ALL'); setSearchTerm(''); }}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Node</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Tier</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partition Association</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">System Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400">Syncing database records...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Terminal className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400">Zero matches found in repository</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      updatingId={updatingId}
                      onStatusChange={handleStatusChange}
                      onSelectUser={setSelectedUser}
                      onImpersonate={handleImpersonate}
                      impersonatingId={impersonatingId}
                    />
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:row justify-between items-center gap-4">
          <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            Showing <span className="text-slate-900 dark:text-white">{users.length}</span> of <span className="text-slate-900 dark:text-white">{pagination.total}</span> Records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1;
                // Simple windowing logic
                if (pagination.totalPages > 5 && pagination.page > 3) {
                  pageNum = pagination.page - 3 + i + 1;
                }
                if (pageNum > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${pagination.page === pageNum
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
              title="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <UserDetailsModal
        user={selectedUser}
        updatingId={updatingId}
        onClose={() => setSelectedUser(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
