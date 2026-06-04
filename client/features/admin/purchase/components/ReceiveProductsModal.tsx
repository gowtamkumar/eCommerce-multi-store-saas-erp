'use client';

import { CheckCircle, Building2, Warehouse as WarehouseIcon, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import type { Warehouse, Branch, ReceiveProductsModalProps } from '../types';

export default function ReceiveProductsModal({
    order,
    warehouses,
    branches,
    onClose,
    onConfirm,
}: ReceiveProductsModalProps) {
    const [warehouseId, setWarehouseId] = useState('');
    const [branchId, setBranchId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onConfirm(warehouseId, branchId);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 bg-emerald-600 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Receive Products</h3>
                        <p className="text-emerald-100 text-sm mt-1">
                            Select destination — stock &amp; AP ledger will update automatically
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Items summary */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-2 max-h-40 overflow-y-auto">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Items to Receive
                        </p>
                        {order?.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[60%]">
                                    {item.product?.name || 'Product'}
                                </span>
                                <span className="font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                    Qty: {item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Warehouse */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <WarehouseIcon className="w-3 h-3" /> Destination Warehouse
                        </label>
                        <select
                            required
                            value={warehouseId}
                            onChange={e => setWarehouseId(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-emerald-500 outline-none font-semibold text-sm transition-all"
                        >
                            <option value="" disabled>Select destination warehouse...</option>
                            {warehouses.map((w: Warehouse) => (
                                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                            ))}
                        </select>
                    </div>

                    {/* Branch */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <Building2 className="w-3 h-3" /> Branch
                        </label>
                        <select
                            required
                            value={branchId}
                            onChange={e => setBranchId(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-emerald-500 outline-none font-semibold text-sm transition-all"
                        >
                            <option value="" disabled>Select branch...</option>
                            {branches.map((b: Branch) => (
                                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                            ))}
                        </select>
                    </div>

                    {/* Notice */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                            ✓ A verified GRN will be created automatically<br />
                            ✓ Product stock levels will be incremented<br />
                            ✓ Supplier AP ledger will be updated
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                    >
                        <CheckCircle className="w-5 h-5" />
                        {submitting ? 'Processing...' : 'Confirm Receipt & Update Stock'}
                    </button>
                </form>
            </div>
        </div>
    );
}
