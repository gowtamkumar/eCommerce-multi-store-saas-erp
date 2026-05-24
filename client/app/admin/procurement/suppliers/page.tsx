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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { createSupplier } from '@/services/procurement';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'OTHER',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: ''
  });

  // Edit / View Profile States
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any | null>(null);

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6;

  // Selection / Checklist State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const fetchData = async (currentPage: number, searchVal: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchVal && { q: searchVal })
      });
      const res = await fetchAPI(`/suppliers?${params}`);
      if (res.success && res.data) {
        setSuppliers(res.data.items || []);
        setPage(res.data.page || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, debouncedSearchQuery);
  }, [page, debouncedSearchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === suppliers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(suppliers.map(s => s.id));
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      code: supplier.code || '',
      category: supplier.category || 'OTHER',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      taxId: supplier.taxId || ''
    });
    setShowAddModal(true);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected suppliers?`)) {
      try {
        await Promise.all(selectedIds.map(id => fetchAPI(`/suppliers/${id}`, { method: 'DELETE' })));
        setSelectedIds([]);
        setPage(1);
        fetchData(1, debouncedSearchQuery);
        toast.success('Selected suppliers deleted successfully');
      } catch (err) {
        console.error('Failed to bulk delete:', err);
        toast.error('Failed to bulk delete suppliers');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await fetchAPI(`/suppliers/${editingSupplier.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier(formData);
        toast.success('Supplier registered successfully');
      }
      setShowAddModal(false);
      setEditingSupplier(null);
      fetchData(page, debouncedSearchQuery);
      setFormData({ name: '', code: '', category: 'OTHER', contactPerson: '', email: '', phone: '', address: '', taxId: '' });
    } catch (err) {
      console.error('Failed to save supplier:', err);
      toast.error('Failed to save supplier');
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
          onClick={() => {
            setEditingSupplier(null);
            setFormData({ name: '', code: '', category: 'OTHER', contactPerson: '', email: '', phone: '', address: '', taxId: '' });
            setShowAddModal(true);
          }}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          />
        </div>
        <button className="px-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:shadow-md transition-all">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Selection Checklist Bar */}
      {suppliers.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedIds.length > 0 && selectedIds.length === suppliers.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
            />
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {selectedIds.length > 0 ? `${selectedIds.length} Checked` : 'Check All'}
            </span>
          </label>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 border border-slate-205 dark:border-slate-700 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Checked
              </button>
            </div>
          )}
        </div>
      )}

      {/* Supplier Grid */}
      {loading && suppliers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-slate-700" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Vendors Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((s, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={s.id}
              className={`bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${selectedIds.includes(s.id) ? 'border-indigo-650 dark:border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-700'}`}
            >
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                  Active
                </span>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(s.id)}
                  onChange={() => handleSelect(s.id)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-350 dark:border-slate-650 bg-slate-50 dark:bg-slate-900 transition-all cursor-pointer shrink-0"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate" title={s.name}>{s.name}</h3>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{s.code}</p>
                </div>
                <button
                  onClick={() => handleEdit(s)}
                  className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                  title="Edit Supplier"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-bold truncate">{s.email}</span>
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
                    {s.category ? s.category.replace('_', ' ') : 'OTHER'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setViewingSupplier(s)}
                className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
              >
                View Vendor Profile
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/10 dark:bg-slate-900/10 p-4 rounded-2xl">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Showing Page {page} of {totalPages} ({totalItems} vendors)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-3 border border-slate-205 dark:border-slate-700 rounded-2xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:border-indigo-600 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 animate-in fade-in" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="p-3 border border-slate-205 dark:border-slate-700 rounded-2xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:border-indigo-600 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 animate-in fade-in" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setEditingSupplier(null); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                      {editingSupplier ? 'Edit' : 'New'} <span className="text-indigo-600">Supplier</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {editingSupplier ? `Modify vendor details for: ${editingSupplier.name}` : 'Register a new global vendor'}
                    </p>
                  </div>
                  <button onClick={() => { setShowAddModal(false); setEditingSupplier(null); }} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors">
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none"
                      >
                        <option value="RAW_MATERIALS">Raw Materials</option>
                        <option value="PACKAGING">Packaging</option>
                        <option value="SERVICES">Services</option>
                        <option value="EQUIPMENT">Equipment</option>
                        <option value="LOGISTICS">Logistics</option>
                        <option value="IT_SOFTWARE">IT & Software</option>
                        <option value="OFFICE_SUPPLIES">Office Supplies</option>
                        <option value="OTHER">Other/General</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Person</label>
                      <input 
                        type="text" 
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        placeholder="e.g. Jane Smith"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax ID / VAT</label>
                      <input 
                        type="text" 
                        value={formData.taxId}
                        onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        placeholder="e.g. TAX-987654"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Address</label>
                      <textarea 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all h-[52px] resize-none"
                        placeholder="Full corporate address..."
                      ></textarea>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
                  >
                    {editingSupplier ? 'Save Vendor Changes' : 'Register Vendor Account'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Vendor Profile Modal */}
      <AnimatePresence>
        {viewingSupplier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-105 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                    {viewingSupplier.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate max-w-[300px]">
                      {viewingSupplier.name}
                    </h2>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">{viewingSupplier.code || 'NO_CODE'}</p>
                  </div>
                </div>
                <button onClick={() => setViewingSupplier(null)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto space-y-6 flex-1">
                {/* Rating & Status */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Rating</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white">⭐ {Number(viewingSupplier.rating || 5).toFixed(1)} / 5.0</span>
                    </div>
                    <div className="border-r border-slate-200 dark:border-slate-700 h-8 mx-2" />
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Category</span>
                      <span className="text-xs font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {viewingSupplier.category ? viewingSupplier.category.replace('_', ' ') : 'OTHER'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${viewingSupplier.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {viewingSupplier.isActive !== false ? 'Active Vendor' : 'Inactive'}
                  </span>
                </div>

                {/* Balance & Ledger */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Balance</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                        ${Number(viewingSupplier.currentBalance || 0).toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/admin/suppliers/${viewingSupplier.id}/ledger`}
                      className="text-xs font-bold text-indigo-600 hover:underline mt-4 inline-block animate-pulse"
                    >
                      View Account Ledger →
                    </Link>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Person</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{viewingSupplier.contactPerson || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tax ID / VAT</span>
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-350 mt-0.5">{viewingSupplier.taxId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-700/50">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email Address</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{viewingSupplier.email || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-700/50">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Phone Number</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{viewingSupplier.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-slate-105 dark:border-slate-700/50">
                    <MapPin className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Corporate Address</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{viewingSupplier.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-slate-105 dark:border-slate-700 flex gap-3 bg-slate-50 dark:bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => setViewingSupplier(null)}
                  className="flex-1 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all cursor-pointer text-center"
                >
                  Close Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleEdit(viewingSupplier);
                    setViewingSupplier(null);
                  }}
                  className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-lg shadow-indigo-500/25 transition-all cursor-pointer text-center"
                >
                  Edit Vendor Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
