'use client';

import { fetchSuperAdminAPI } from '@/services/superAdminApi';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Terminal, Filter, RefreshCw, Shield, Store, User as UserIcon, Info, Loader2, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { UserStatus } from '@/lib/enums/user-status.enum';
import { UserRole } from '@/lib/enums/user-role.enum';
import { PaginationMeta, User, UserListProps } from '../types/user-management.types';
import UserDetailsModal from './UserDetailsModal';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

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
        setUsers(res.data.users || []);
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

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Identity Node',
      className: 'px-6 py-4',
      cell: (user) => (
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
      )
    },
    {
      key: 'role',
      header: 'Access Tier',
      className: 'px-6 py-4',
      cell: (user) => (
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
      )
    },
    {
      key: 'partition',
      header: 'Partition Association',
      className: 'px-6 py-4',
      cell: (user) => user.tenantId ? (
        <div className="flex items-center gap-2 text-slate-900 dark:text-white text-sm">
          <Store className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold">{user.tenantId.storeName}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
            {user.tenantId.subdomain}
          </span>
        </div>
      ) : (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">Platform</span>
      )
    },
    {
      key: 'createdAt',
      header: 'Sync Date',
      className: 'px-6 py-4 text-xs text-slate-500 font-bold uppercase tracking-widest',
      cell: (user) => <span>{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
    },
    {
      key: 'actions',
      header: 'System Actions',
      headerClassName: 'text-right',
      className: 'px-6 py-4',
      cell: (user) => (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleImpersonate(user.id)}
            disabled={updatingId !== null || impersonatingId !== null}
            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all disabled:opacity-30"
            title="Impersonate User"
          >
            {impersonatingId === user.id ? (
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            ) : (
              <UserCheck className="w-5 h-5" />
            )}
          </button>

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
      )
    }
  ];

  const dataTablePagination = {
    page: pagination.page,
    total: pagination.total,
    totalPages: pagination.totalPages,
    onPageChange: (p: number) => handlePageChange(p)
  };

  const dataTablePaginationSummary = (
    <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
      Showing <span className="text-slate-900 dark:text-white">{users.length}</span> of <span className="text-slate-900 dark:text-white">{pagination.total}</span> Records
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight animate-in fade-in duration-300">System Identity Repository</h1>
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
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in duration-500">
        <DataTable
          data={users}
          columns={columns}
          getRowKey={(user) => user.id}
          loading={isLoading}
          loadingLabel="Syncing database records..."
          emptyLabel={
            <div className="flex flex-col items-center gap-3 opacity-30 py-12">
              <Terminal className="w-12 h-12 text-slate-200 dark:text-slate-700" />
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">Zero matches found in repository</p>
            </div>
          }
          containerClassName="border-0 shadow-none rounded-t-none bg-transparent rounded-b-[2rem]"
          pagination={dataTablePagination}
          paginationSummary={dataTablePaginationSummary}
        />
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
