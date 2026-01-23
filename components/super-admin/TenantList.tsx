'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Ban, BarChart3, CheckCircle2, ExternalLink, Filter, Search, Settings2, ShieldCheck, Store, Terminal } from 'lucide-react';
import { useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Tenant {
  id: string;
  storeName: string;
  subdomain: string;
  customDomain?: string;
  planTier: string;
  status: string;
  createdAt: string;
}

interface TenantListProps {
  initialTenants: Tenant[];
}

export default function TenantList({ initialTenants }: TenantListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState(initialTenants);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredTenants = tenants.filter((t) =>
    t.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const res = await fetchAPI(`/super-admin/tenants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        setTenants(tenants.map(t => t.id === id ? { ...t, status: newStatus } : t));
        toast.success(`Store ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdatePlan = async (id: string, newPlan: string) => {
    setLoadingId(id);
    try {
      const res = await fetchAPI(`/super-admin/tenants/${id}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ planTier: newPlan }),
      });

      if (res.success) {
        setTenants(tenants.map(t => t.id === id ? { ...t, planTier: newPlan } : t));
        toast.success(`Plan updated to ${newPlan}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update plan');
    } finally {
      setLoadingId(null);
    }
  };

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
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
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
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Subscription</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Cluster Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Terminal className="w-8 h-8 opacity-20" />
                      <p className="italic">No records found matching criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTenants.map((tenant) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={tenant.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${tenant.status === 'active' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                            <Store className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white leading-tight">{tenant.storeName}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{tenant.subdomain}.host.local</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={tenant.planTier}
                          disabled={loadingId === tenant.id}
                          onChange={(e) => handleUpdatePlan(tenant.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        >
                          <option value="basic">Basic Partition</option>
                          <option value="pro">Pro Partition</option>
                          <option value="enterprise">Enterprise Cluster</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tenant.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {new Date(tenant.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {tenant.status === 'active' ? (
                            <button
                              onClick={() => handleUpdateStatus(tenant.id, 'suspended')}
                              disabled={loadingId === tenant.id}
                              className="p-2 text-slate-400 hover:text-rose-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg disabled:opacity-50"
                              title="Suspend Merchant"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(tenant.id, 'active')}
                              disabled={loadingId === tenant.id}
                              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg disabled:opacity-50"
                              title="Activate Merchant"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          <Link
                            href={`/super-admin/tenants/${tenant.id}/analytics`}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg"
                            title="Detailed Analytics"
                          >
                            <BarChart3 className="w-5 h-5" />
                          </Link>
                          <a
                            href={`http://${tenant.subdomain}.localhost:3000`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg"
                            title="Visit Infrastructure"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
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
    </div>
  );
}
