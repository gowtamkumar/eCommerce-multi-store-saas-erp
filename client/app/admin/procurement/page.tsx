'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  Users,
  DollarSign,
  Plus,
  ArrowRight,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { getSuppliers } from '@/services/procurement';
import Link from 'next/link';

const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-xl group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex flex-col items-end">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
          {value}
        </h3>
      </div>
    </div>
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
      <TrendingUp className="w-3 h-3 text-emerald-500" />
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        {subValue}
      </span>
    </div>
  </motion.div>
);

export default function ProcurementDashboard() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (err) {
        console.error('Failed to fetch suppliers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Procurement <span className="text-indigo-600">& Supply</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Global Sourcing & Inventory Logistics Control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all flex items-center gap-2">
            <Users className="w-4 h-4" />
            Suppliers
          </button>
          <button className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Spend" value="$245,800" icon={DollarSign} color="bg-indigo-500" subValue="+12% from last month" />
        <StatCard label="Active Orders" value="18" icon={Package} color="bg-amber-500" subValue="4 orders delayed" />
        <StatCard label="Total Suppliers" value={suppliers.length.toString()} icon={Users} color="bg-emerald-500" subValue="2 new this month" />
        <StatCard label="Pending Receipts" value="7" icon={Truck} color="bg-rose-500" subValue="Warehouse capacity: 84%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Recent <span className="text-indigo-600">Purchase Orders</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Latest execution records and delivery status
              </p>
            </div>
            <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <Filter className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {/* Placeholder for orders */}
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">PO-2024-00{i + 1}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600">
                          VN
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Global Tech Solutions</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs font-bold">$12,450.00</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${i % 2 === 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                        {i % 2 === 0 ? 'Pending' : 'Received'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Suppliers & Performance */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Top <span className="text-indigo-600">Suppliers</span>
              </h2>
              <Link href="/admin/procurement/suppliers" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {suppliers.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black text-white">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{s.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.category || 'General'}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Score</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">98%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 blur-2xl group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-indigo-200" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Inventory Alert</h3>
              </div>
              <p className="text-xl font-black italic mb-4 leading-tight">
                Critical stock levels detected in <span className="text-indigo-200">Main Warehouse.</span>
              </p>
              <button className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                Restock Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
