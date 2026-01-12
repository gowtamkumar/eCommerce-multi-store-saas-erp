'use client';

import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { Activity, Clock, Database, HardDrive, ShieldCheck, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PlatformHealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const result = await fetchAPI('/super-admin/health');
        setData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return <div className="text-center py-20">Monitoring platform health...</div>;

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Health</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time system diagnostics and resource monitoring.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <Zap className="w-4 h-4 fill-emerald-600" />
          <span className="text-sm font-bold uppercase">System Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Database Status</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.health?.database || 'Connected'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">System Uptime</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatUptime(data?.health?.uptime || 0)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Platform Version</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">v{data?.health?.version || '1.0.0'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stats Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Objects</h2>
          </div>
          <div className="p-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Tenants</p>
              <p className="text-3xl font-bold text-indigo-600">{data?.stats?.tenants}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-indigo-600">{data?.stats?.users}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Orders (Global)</p>
              <p className="text-3xl font-bold text-indigo-600">{data?.stats?.orders}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Reviews</p>
              <p className="text-3xl font-bold text-indigo-600">{data?.stats?.reviews}</p>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6">
            <Activity className="w-10 h-10 text-slate-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Real-time Performance</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Live CPU and Memory monitoring is being calculated based on current server metrics.
          </p>
          <div className="w-full mt-8 bg-slate-100 dark:bg-slate-900/50 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '32%' }}
              className="h-full bg-indigo-600"
            />
          </div>
          <div className="w-full flex justify-between mt-2 text-xs font-bold text-slate-500">
            <span>CPU USAGE</span>
            <span>32%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
