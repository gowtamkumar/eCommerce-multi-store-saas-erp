'use client';

import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Terminal,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import TenantRow from './TenantRow';
import { StatusStyles, TenantListProps } from '../types/tenant.types';

const PLAN_OPTIONS = ['All Plans', 'Starter', 'Pro Seller', 'Enterprise'];
const STATUS_OPTIONS = ['All Status', 'active', 'trial', 'suspended', 'expired'];
const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest First' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A-Z' },
];

export default function TenantList({ initialTenants }: TenantListProps) {
  const [tenants, setTenants] = useState(initialTenants);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All Plans');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedSort, setSelectedSort] = useState('created_desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (debouncedSearch) qs.set('search', debouncedSearch);
      if (selectedStatus !== 'All Status') qs.set('status', selectedStatus);
      if (selectedPlan !== 'All Plans') qs.set('plan', selectedPlan);
      qs.set('sort', selectedSort);

      const res = await fetchSuperAdminAPI(`/super-admin/tenants?${qs}`);
      if (res.success) setTenants(res.data);
    } catch (e: any) {
      toast.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedStatus, selectedPlan, selectedSort]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const getStatusStyles = useCallback((status: string): StatusStyles => {
    switch (status) {
      case 'active': return {
        bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        icon: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-500 shadow-sm shadow-indigo-500/10',
        gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20',
      };
      case 'suspended': return {
        bg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
        dot: 'bg-rose-500',
        icon: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400',
        gradient: 'bg-slate-400 shadow-slate-400/20',
      };
      case 'expired': return {
        bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        dot: 'bg-amber-500',
        icon: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 text-amber-500 shadow-sm shadow-amber-500/10',
        gradient: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20',
      };
      default: return {
        bg: 'bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400',
        dot: 'bg-slate-500',
        icon: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400',
        gradient: 'bg-slate-300 shadow-slate-300/20',
      };
    }
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tenants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tenants.map(t => t.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      if (bulkAction === 'suspend') {
        await fetchSuperAdminAPI('/super-admin/tenants/bulk-status', {
          method: 'POST',
          body: JSON.stringify({ ids, status: 'suspended' }),
        });
        toast.success(`${ids.length} tenants suspended`);
      } else if (bulkAction === 'activate') {
        await fetchSuperAdminAPI('/super-admin/tenants/bulk-status', {
          method: 'POST',
          body: JSON.stringify({ ids, status: 'active' }),
        });
        toast.success(`${ids.length} tenants activated`);
      }
      setSelectedIds(new Set());
      setBulkAction('');
      fetchTenants();
    } catch (e: any) {
      toast.error(e.message || 'Bulk action failed');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Store Infrastructure</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {loading ? 'Loading...' : `${tenants.length} merchants`} in the cluster.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search merchants..."
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm w-56"
            />
          </div>
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-medium ${showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {/* Refresh */}
          <button onClick={fetchTenants} disabled={loading} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : 'text-slate-500'}`} />
          </button>
          {/* Create Store */}
          <Link
            href="/system/tenants/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-semibold hover:bg-indigo-700 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Store
          </Link>
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-wrap gap-4">
              {/* Plan Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</label>
                <div className="flex gap-2">
                  {PLAN_OPTIONS.map(p => (
                    <button key={p} onClick={() => setSelectedPlan(p)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${selectedPlan === p ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => setSelectedStatus(s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all capitalize ${selectedStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort</label>
                <div className="flex gap-2">
                  {SORT_OPTIONS.map(s => (
                    <button key={s.value} onClick={() => setSelectedSort(s.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${selectedSort === s.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              <div className="flex items-end">
                <button onClick={() => { setSelectedPlan('All Plans'); setSelectedStatus('All Status'); setSelectedSort('created_desc'); setSearchTerm(''); }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-all">
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-4 flex items-center gap-4"
        >
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{selectedIds.size} selected</span>
          <div className="flex items-center gap-3 ml-auto">
            <select
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value)}
              className="text-sm font-medium border border-indigo-200 dark:border-indigo-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select action...</option>
              <option value="activate">✅ Activate All</option>
              <option value="suspend">🚫 Suspend All</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || isBulkProcessing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              {isBulkProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
              Apply
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === tenants.length && tenants.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Merchant Details</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Subscription Plan</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Sub Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Store Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading merchants...</p>
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Terminal className="w-8 h-8 opacity-20" />
                      <p className="italic font-medium">No records found matching criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {tenants.map(tenant => (
                    <TenantRow
                      key={tenant.id}
                      tenant={tenant}
                      styles={getStatusStyles(tenant.status)}
                      isSelected={selectedIds.has(tenant.id)}
                      onSelect={toggleSelect}
                    />
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
