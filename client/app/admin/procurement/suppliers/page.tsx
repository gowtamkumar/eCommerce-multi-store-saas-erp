'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  TrendingUp,
  X,
  CheckCircle2
} from 'lucide-react';
import { getSuppliers, createSupplier } from '@/services/procurement';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'General',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier(formData);
      setShowAddModal(false);
      fetchData();
      setFormData({ name: '', code: '', category: 'General', contactPerson: '', email: '', phone: '', address: '', taxId: '' });
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Supplier <span className="text-indigo-600">Directory</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Global Vendor Network & Performance Analytics
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="SEARCH VENDORS BY NAME, CODE OR CATEGORY..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          />
        </div>
        <button className="px-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:shadow-md transition-all">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((s, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={s.id}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                {s.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{s.name}</h3>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{s.code}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-bold">{s.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-bold">{s.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold line-clamp-1">{s.address || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-slate-700/50">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                <p className="text-sm font-black text-slate-900 dark:text-white font-mono italic">
                  ${Number(s.currentBalance).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  {s.category || 'General'}
                </p>
              </div>
            </div>

            <button className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
              View Vendor Profile
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                      New <span className="text-indigo-600">Supplier</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Register a new global vendor</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        placeholder="e.g. Global Tech Solutions"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Code</label>
                      <input 
                        required
                        type="text" 
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        placeholder="e.g. VEN-001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        placeholder="vendor@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none"
                      >
                        <option>General</option>
                        <option>Electronics</option>
                        <option>Logistics</option>
                        <option>Raw Materials</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Address</label>
                    <textarea 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all h-24"
                      placeholder="Full corporate address..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
                  >
                    Register Vendor Account
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
