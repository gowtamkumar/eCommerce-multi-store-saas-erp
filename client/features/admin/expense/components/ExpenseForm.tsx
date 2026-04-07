'use client';

import { fetchAPI } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Receipt, DollarSign, Calendar, Tag, FileText, Hash } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EXPENSE_CATEGORIES, type ExpenseFormProps } from '../types';



export default function ExpenseForm({ isOpen, onClose, onSuccess, initialData }: ExpenseFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'OTHER',
        expenseDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        description: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                amount: initialData.amount.toString(),
                category: initialData.category,
                expenseDate: initialData.expenseDate.split('T')[0],
                referenceNumber: initialData.referenceNumber || '',
                description: initialData.description || ''
            });
        } else {
            setFormData({
                title: '',
                amount: '',
                category: 'OTHER',
                expenseDate: new Date().toISOString().split('T')[0],
                referenceNumber: '',
                description: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        try {
            const url = initialData ? `/expenses/${initialData.id}` : '/expenses';
            const method = initialData ? 'PATCH' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify(payload),
            });

            toast.success(`Expense ${initialData ? 'updated' : 'recorded'} successfully`);
            onSuccess();
        } catch (error) {
            toast.error('Failed to save expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-rose-500" />
                            {initialData ? 'Edit Expense' : 'Record New Expense'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto outline-none">
                        <form id="expenseForm" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Expense Title</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                        placeholder="e.g. Server Hosting Fee"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Amount</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="date"
                                            value={formData.expenseDate}
                                            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Category</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none"
                                        >
                                            {EXPENSE_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ref Number</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.referenceNumber}
                                            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Notes & Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                                    placeholder="Optional additional notes..."
                                />
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="expenseForm"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {initialData ? 'Update Expense' : 'Save Record'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
