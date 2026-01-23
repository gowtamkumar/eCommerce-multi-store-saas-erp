'use client';

import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, BarChart3, CreditCard, ShieldCheck, Store, Users } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalTenants: number;
  totalUsers: number;
  totalOrders: number;
  totalReviews: number;
  requestsLast24h: number;
  plans: Record<string, number>;
  statuses: Record<string, number>;
}

interface TrafficData {
  id: string;
  tenantId: string;
  date: string;
  requestCount: number;
  lastUpdated: string;
}

interface SuperAdminDashboardProps {
  stats: Stats;
  traffic: TrafficData[];
}

export default function SuperAdminDashboard({ stats, traffic }: SuperAdminDashboardProps) {
  const cards = [
    { label: 'Total Stores', value: stats.totalTenants, icon: Store, color: 'bg-indigo-500', trend: '+12%' },
    { label: 'Merchant Accounts', value: stats.totalUsers, icon: Users, color: 'bg-emerald-500', trend: '+5%' },
    { label: 'Global Orders', value: stats.totalOrders, icon: BarChart3, color: 'bg-amber-500', trend: '+18%' },
    { label: '24h Traffic', value: stats.requestsLast24h, icon: Activity, color: 'bg-blue-500', trend: 'Requests' },
  ];

  const planLabels: Record<string, string> = {
    enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    basic: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitoring {stats.totalTenants} merchants across the infrastructure.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 transition-all text-sm">
            Export Analytics
          </button>
          <Link href="/super-admin/tenants" className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-semibold hover:bg-indigo-700 transition-all text-sm">
            Manage Stores
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.color} text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                {card.trend}
              </span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{card.label}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Plan Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Plan Distribution</h2>
          <div className="space-y-6">
            {Object.entries(stats.plans).map(([plan, count]) => (
              <div key={plan}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${planLabels[plan] || planLabels.basic}`}>
                    {plan}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.totalTenants) * 100}%` }}
                    className={`h-full ${plan === 'enterprise' ? 'bg-purple-500' : plan === 'pro' ? 'bg-blue-500' : 'bg-slate-400'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Status */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Platform Activity</h2>
              <p className="text-sm text-slate-500">Cross-tenant request volume</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-bold">System Healthy</span>
            </div>
          </div>
          <div className="flex-1 p-8">
            {traffic.length > 0 ? (
              <div className="h-48 flex items-end gap-2 px-4">
                {traffic.slice(0, 14).reverse().map((t, i) => {
                  const maxVal = Math.max(...traffic.map(x => x.requestCount));
                  const height = (t.requestCount / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {t.requestCount} requests
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-t-lg transition-colors min-h-[4px]"
                      />
                      <span className="text-[8px] font-bold text-slate-400 uppercase hidden md:block">
                        {new Date(t.date).toLocaleDateString([], { weekday: 'short' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 italic py-12">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p>No traffic data collected yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
