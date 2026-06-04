'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Branch, PosRegisterTerminal, RegisterFormData } from '../types';

interface RegisterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingRegister: PosRegisterTerminal | null;
    formData: RegisterFormData;
    setFormData: React.Dispatch<React.SetStateAction<RegisterFormData>>;
    branches: Branch[];
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function RegisterFormModal({
    isOpen,
    onClose,
    editingRegister,
    formData,
    setFormData,
    branches,
    handleSubmit,
}: RegisterFormModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800"
                    >
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            {editingRegister ? 'Edit Register Terminal' : 'New Register Terminal'}
                        </h4>
                        
                        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Terminal Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none"
                                    placeholder="e.g. Front Desk Terminal 1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Linked Branch</label>
                                <select
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none font-bold"
                                    required
                                >
                                    <option value="" disabled>Select Linked Branch</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm outline-none font-bold"
                                >
                                    <option value="ACTIVE">Active / Online</option>
                                    <option value="INACTIVE">Inactive / Offline</option>
                                </select>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all text-sm"
                                >
                                    {editingRegister ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
