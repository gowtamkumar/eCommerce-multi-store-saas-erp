'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useProcurementDashboard } from '../hooks/useProcurementDashboard';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';

export default function ProcurementDashboard() {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';
  const {
    loading,
    stats,
    chartData,
    delayedShipments,
    lowStockWarnings,
    timeframe,
    setTimeframe,
  } = useProcurementDashboard();

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Supply Chain <span className="text-indigo-600">Command</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Procurement, Sourcing & Vendor Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/procurement/requisitions">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-indigo-500/20">
              Create Requisition
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border ${stat.border} dark:border-slate-700 transition-all hover:shadow-lg group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <h3 className={`text-2xl font-black ${stat.color} dark:text-white font-mono`}>
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 ${stat.bg} dark:bg-slate-700 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              {stat.subValue}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Spend <span className="text-indigo-600">Analytics</span>
              </h2>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as 'YTD' | 'Last 12 Months')}
              className="bg-slate-50 dark:bg-slate-700 border-none text-xs font-bold rounded-xl px-4 py-2 outline-none cursor-pointer"
            >
              <option value="YTD">Year to Date</option>
              <option value="Last 12 Months">Last 12 Months</option>
            </select>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => `${currencySymbol}${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                  formatter={(value: unknown) => [formatCurrency(Number(value || 0), currencySymbol), 'Spend']}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#4f46e5"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
              Critical <span className="text-rose-500">Alerts</span>
            </h2>
            <div className="space-y-4">
              {delayedShipments.length === 0 && lowStockWarnings.length === 0 && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/20">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-wider">All Systems Normal</p>
                    <p className="text-[10px] text-emerald-700/70 dark:text-emerald-500 mt-0.5">No delayed shipments or low stock warnings.</p>
                  </div>
                </div>
              )}
              {delayedShipments.slice(0, 3).map((po) => (
                <div key={po.id} className="flex items-start gap-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-rose-900 dark:text-rose-400">Delayed Shipment</p>
                    <p className="text-[10px] font-bold text-rose-700/70 dark:text-rose-500 uppercase mt-1">
                      {po.referenceNumber} • {po.supplier?.name || 'Unknown Supplier'}
                    </p>
                  </div>
                </div>
              ))}
              {lowStockWarnings.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                  <PackageCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-amber-900 dark:text-amber-400">Low Stock Warning</p>
                    <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-500 uppercase mt-1">
                      {product.name} • Stock: {product.stock || 0} (Min: {product.lowStockThreshold || 5})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
