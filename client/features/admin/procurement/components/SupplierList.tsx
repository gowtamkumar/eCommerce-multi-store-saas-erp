'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Building2, 
  MapPin, 
  Star, 
  FileText,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';

export default function SupplierList() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const suppliers = [
    {
      id: 'SUP-001',
      name: 'Global Tech Inc.',
      category: 'IT_SOFTWARE',
      contactName: 'Sarah Jenkins',
      email: 'sarah@globaltech.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA',
      rating: 4.8,
      leadTime: 3,
      status: 'ACTIVE'
    },
    {
      id: 'SUP-002',
      name: 'Prime Packaging Solutions',
      category: 'PACKAGING',
      contactName: 'Marcus Wong',
      email: 'mwong@primepack.com',
      phone: '+1 (555) 987-6543',
      location: 'Chicago, USA',
      rating: 4.2,
      leadTime: 14,
      status: 'ACTIVE'
    }
  ];

  return (
    <div className="space-y-6 p-8 max-w-[1600px] mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
            Supplier <span className="text-indigo-600">Directory</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
            Vendor Management & Performance
          </p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">
          <Plus className="w-4 h-4" />
          Onboard Supplier
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-[400px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <select className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none">
            <option>All Categories</option>
            <option>Raw Materials</option>
            <option>Packaging</option>
            <option>IT & Software</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Vendor Details</th>
                <th className="px-8 py-5">Category & Location</th>
                <th className="px-8 py-5">Performance</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              <AnimatePresence>
                {suppliers.map((supplier, i) => (
                  <motion.tr 
                    key={supplier.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                            {supplier.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                              <Mail className="w-3 h-3" /> {supplier.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                        {supplier.category.replace('_', ' ')}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin className="w-3 h-3 text-rose-500" /> {supplier.location}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-black text-slate-900 dark:text-white">{supplier.rating}</span>
                          <span className="text-[10px] font-bold text-slate-400 ml-1">/ 5.0</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {supplier.leadTime} Days Lead Time
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
