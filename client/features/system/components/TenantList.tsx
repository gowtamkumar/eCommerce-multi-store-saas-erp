'use client';

import { fetchAPI } from '@/services/api';
import { AnimatePresence } from 'framer-motion';
import { Filter, Search, Terminal } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import TenantRow from './TenantRow';
import TenantDetailsModal from './TenantDetailsModal';
import { Tenant, TenantListProps, StatusStyles } from '../types/tenant.types';

export default function TenantList({ initialTenants }: TenantListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState(initialTenants);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  /**
   * Memoized filtered tenants to prevent recalculation on every render
   * unless tenants or search term changes.
   */
  const filteredTenants = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return tenants;
    return tenants.filter((t) =>
      t.storeName.toLowerCase().includes(term) ||
      t.subdomain.toLowerCase().includes(term)
    );
  }, [tenants, searchTerm]);

  /**
   * Memoized status style getter
   */
  const getStatusStyles = useCallback((status: string): StatusStyles => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
          dot: 'bg-emerald-500',
          icon: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-500 shadow-sm shadow-indigo-500/10',
          gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'
        };
      case 'suspended':
        return {
          bg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
          dot: 'bg-rose-500',
          icon: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400',
          gradient: 'bg-slate-400 shadow-slate-400/20'
        };
      case 'expired':
        return {
          bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
          dot: 'bg-amber-500',
          icon: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 text-amber-500 shadow-sm shadow-amber-500/10',
          gradient: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400',
          dot: 'bg-slate-500',
          icon: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400',
          gradient: 'bg-slate-300 shadow-slate-300/20'
        };
    }
  }, []);

  const handleUpdateStatus = useCallback(async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const res = await fetchAPI(`/tenant-traffic/tenants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        setTenants(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        setSelectedTenant(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
        toast.success(`Store ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoadingId(null);
    }
  }, []);

  const handleFetchDetails = useCallback(async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    try {
      const res = await fetchAPI(`/tenant-traffic/tenants/${tenant.id}`);
      if (res.success) {
        setSelectedTenant(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch full tenant details');
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Store Infrastructure</h1>
          <p className="text-slate-500 dark:text-slate-400">Total {tenants.length} merchants partitions active on the cluster.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm antialiased"
            />
          </div>
          <button className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Merchant Details</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Subscription Plan</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Sub Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Store Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Cluster Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Terminal className="w-8 h-8 opacity-20" />
                      <p className="italic font-medium">No records found matching criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTenants.map((tenant) => (
                    <TenantRow
                      key={tenant.id}
                      tenant={tenant}
                      styles={getStatusStyles(tenant.status)}
                      loadingId={loadingId}
                      onUpdateStatus={handleUpdateStatus}
                      onFetchDetails={handleFetchDetails}
                    />
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TenantDetailsModal
        selectedTenant={selectedTenant}
        loadingId={loadingId}
        onClose={() => setSelectedTenant(null)}
        onUpdateStatus={handleUpdateStatus}
        getStatusStyles={getStatusStyles}
      />
    </div>
  );
}
