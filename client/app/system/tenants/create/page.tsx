'use client';

import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CreateStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    storeName: '',
    subdomain: '',
    ownerEmail: '',
    ownerName: '',
    ownerPassword: '',
    plan: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Auto-generate subdomain from storeName
    if (e.target.name === 'storeName') {
      setForm(prev => ({
        ...prev,
        storeName: e.target.value,
        subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName || !form.subdomain || !form.ownerEmail || !form.ownerName || !form.ownerPassword) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetchSuperAdminAPI('/tenants', {
        method: 'POST',
        body: JSON.stringify({
          storeName: form.storeName,
          subdomain: form.subdomain,
          ownerEmail: form.ownerEmail,
          ownerName: form.ownerName,
          ownerPassword: form.ownerPassword,
          planCode: form.plan || 'starter',
        }),
      });
      if (res.success) {
        toast.success('Store created successfully!');
        router.push('/system/tenants');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/system/tenants" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Store</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Provision a new tenant store on the platform</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
            <Store className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Store Details</h2>
            <p className="text-sm text-slate-500">Configure the new store and its owner account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Store Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Store Name *</label>
              <input
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                placeholder="e.g. My Awesome Shop"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                required
              />
            </div>

            {/* Subdomain */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subdomain *</label>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                <input
                  name="subdomain"
                  value={form.subdomain}
                  onChange={handleChange}
                  placeholder="my-awesome-shop"
                  className="flex-1 px-4 py-3 bg-transparent text-slate-900 dark:text-white outline-none text-sm font-mono"
                  required
                  pattern="[a-z0-9-]+"
                />
                <span className="px-4 py-3 text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 font-mono">.yourdomain.com</span>
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Owner Name *</label>
              <input
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                required
              />
            </div>

            {/* Owner Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Owner Email *</label>
              <input
                name="ownerEmail"
                type="email"
                value={form.ownerEmail}
                onChange={handleChange}
                placeholder="owner@store.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Initial Password *</label>
              <input
                name="ownerPassword"
                type="password"
                value={form.ownerPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                required
              />
            </div>

            {/* Plan */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subscription Plan</label>
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              >
                <option value="starter">Starter (Free)</option>
                <option value="pro_seller">Pro Seller ($29/mo)</option>
                <option value="enterprise">Enterprise ($99/mo)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4">
            <Link href="/system/tenants" className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 text-sm disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
