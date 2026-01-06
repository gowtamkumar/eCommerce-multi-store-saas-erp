'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, CreditCard, Store, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SuperAdminOverview() {
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalUsers: 0,
    activePlans: 0,
    estimatedRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch stats from combined API or separate ones
        const res = await fetch('/api/tenants');
        const data = await res.json();
        if (data.tenants) {
          setStats(prev => ({ ...prev, totalTenants: data.tenants.length }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Stores', value: stats.totalTenants, icon: Store, color: 'bg-indigo-500', trend: '+12%' },
    { label: 'Active Sellers', value: stats.totalUsers || stats.totalTenants, icon: Users, color: 'bg-emerald-500', trend: '+5%' },
    { label: 'Global Revenue', value: `$${stats.estimatedRevenue}.00`, icon: CreditCard, color: 'bg-amber-500', trend: '+18%' },
    { label: 'Platform Load', value: 'Normal', icon: ActivityIcon, color: 'bg-blue-500', trend: 'Healthy' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, Super Admin. Here is what's happening across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-semibold hover:bg-indigo-700 transition-all text-sm">
            Generate Report
          </button>
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
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                {card.trend}
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{card.label}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '...' : card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity / Tenants Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recently Launched Stores</h2>
          <Link href="/super-admin/tenants" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
            View All
          </Link>
        </div>
        <div className="p-6 text-center text-slate-500">
          {loading ? (
            <p>Loading platform data...</p>
          ) : stats.totalTenants > 0 ? (
            <p>Total {stats.totalTenants} stores are active on the platform.</p>
          ) : (
            <p>No stores launched yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
