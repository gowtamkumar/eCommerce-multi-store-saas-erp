'use client';

import { UserRole } from '@/lib/enums/user-role.enum';
import { UserStatus } from '@/lib/enums/user-status.enum';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Eye, EyeOff, Loader2, Save, X, User as UserIcon, Mail, Phone,
    Shield, ShieldCheck, Hash, Lock, Building2, AlertTriangle, DollarSign, Tag, BadgeDollarSign
} from 'lucide-react';
import type { CustomerFormProps } from '../type';
import { useCustomerForm } from '../hooks/useCustomerForm';
import { useSettings } from '@/hooks/SettingsContext';

export default function CustomerForm({ isOpen, onClose, onSubmit, initialData }: CustomerFormProps) {
    const { selectedCurrency } = useSettings();
    const currencySymbol = selectedCurrency?.symbol || '$';

    const {
        submitting,
        showPassword,
        setShowPassword,
        activeTab,
        setActiveTab,
        priceBooks,
        priceBooksLoading,
        formData,
        setFormData,
        handleSubmit,
    } = useCustomerForm({ isOpen, onClose, onSubmit, initialData });

    if (!isOpen) return null;

    const tabs = [
        { key: 'basic', label: 'Basic Info' },
        { key: 'b2b', label: 'B2B / Credit' },
    ] as const;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                                    {initialData ? 'Edit Customer' : 'Add New Customer'}
                                </h2>
                                {formData.companyName && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formData.companyName}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.key
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {tab.label}
                                {tab.key === 'b2b' && formData.creditHold && (
                                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-100 dark:bg-rose-900/30 px-1.5 py-0.5 rounded-full uppercase">
                                        HOLD
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <form id="customerForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto outline-none flex-1">
                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                            placeholder="Enter customer name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Username</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-mono"
                                            placeholder="username"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                            placeholder="Optional phone number"
                                        />
                                    </div>
                                </div>

                                {!initialData && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                required
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">User Role</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none capitalize"
                                        >
                                            {Object.values(UserRole).map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Account Status</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none capitalize"
                                        >
                                            {Object.values(UserStatus).map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* B2B / Credit Tab */}
                        {activeTab === 'b2b' && (
                            <div className="space-y-5">
                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                        💼 B2B fields allow this customer to purchase on credit (Net 30 Terms). Set a credit limit and the system will automatically enforce it at checkout and POS.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Company Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                                placeholder="e.g. Acme Industries Ltd."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Customer Code</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.customerCode}
                                                onChange={(e) => setFormData({ ...formData, customerCode: e.target.value.toUpperCase() })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-mono"
                                                placeholder="e.g. ACME-001"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Tax ID / VAT Number</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.taxId}
                                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-mono"
                                                placeholder="e.g. BD-VAT-123456"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Credit Limit ({currencySymbol})</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="number"
                                                min={0}
                                                step={100}
                                                value={formData.creditLimit}
                                                onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Maximum total outstanding balance allowed. Set to 0 to disable credit sales for this customer.</p>
                                    </div>

                                    {/* Credit Hold Toggle */}
                                    <div className="md:col-span-2">
                                        <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${formData.creditHold
                                            ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-700'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.creditHold
                                                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                                    }`}>
                                                    <AlertTriangle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${formData.creditHold ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        Credit Hold {formData.creditHold && '— ACTIVE'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">Blocks all on-account purchases when active</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, creditHold: !formData.creditHold })}
                                                className={`relative w-12 h-6 rounded-full transition-all ${formData.creditHold ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                                            >
                                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.creditHold ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Assigned Price Book */}
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            Assigned Price Book
                                        </label>
                                        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 mb-2">
                                            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                                🏷️ Link a custom price book to give this customer exclusive pricing (WHOLESALE, VIP, contract rates). When assigned, the customer's pricing will automatically override default retail prices at checkout and in their cart.
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                value={formData.priceBookCode}
                                                onChange={(e) => setFormData({ ...formData, priceBookCode: e.target.value })}
                                                disabled={priceBooksLoading}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none font-mono disabled:opacity-50"
                                            >
                                                <option value="">— No Custom Price Book (use default Retail) —</option>
                                                {priceBooks.map((pb) => (
                                                    <option key={pb.id} value={pb.code}>
                                                        [{pb.type}] {pb.name} · {pb.code} ({pb.currency || 'BDT'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {formData.priceBookCode && (
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Tag className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                    Active assignment: <code className="font-mono bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded">{formData.priceBookCode}</code>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="customerForm"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {initialData ? 'Update Customer' : 'Create Customer'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
