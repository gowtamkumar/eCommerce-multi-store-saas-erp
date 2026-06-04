'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, AlertCircle } from 'lucide-react';
import { Shift } from '../types';

interface ShiftDetailModalProps {
    shift: Shift | null;
    onClose: () => void;
}

export default function ShiftDetailModal({ shift, onClose }: ShiftDetailModalProps) {
    if (!shift) return null;

    const variance = shift.difference !== null ? Number(shift.difference) : 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <History className="w-6 h-6 text-brand-600" />
                            Shift Audit Report
                        </h4>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Core Shift Info */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-sm">
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Cashier / User</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                    {shift.user?.username || shift.user?.email || shift.userId.substring(0, 8)}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">POS Register</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                    {shift.register?.name || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Opened At</span>
                                <span className="font-medium text-slate-600 dark:text-slate-350">
                                    {new Date(shift.openingTime).toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Closed At</span>
                                <span className="font-medium text-slate-600 dark:text-slate-350">
                                    {shift.closingTime ? new Date(shift.closingTime).toLocaleString() : 'Active Shift'}
                                </span>
                            </div>
                        </div>

                        {/* Reconciliation Card */}
                        <div className="border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Drawer Reconciliation</h5>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                    <span>Opening Base Cash</span>
                                    <span>${Number(shift.openingBalance).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                    <span>Cash Sales Collected</span>
                                    <span className="text-emerald-600 dark:text-emerald-455">+${Number(shift.cashSales).toFixed(2)}</span>
                                </div>
                                {Number(shift.cashIn || 0) > 0 && (
                                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                        <span>Cash In (Adjustments)</span>
                                        <span className="text-emerald-600 dark:text-emerald-455">+${Number(shift.cashIn).toFixed(2)}</span>
                                    </div>
                                )}
                                {Number(shift.cashOut || 0) > 0 && (
                                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                        <span>Cash Out (Adjustments)</span>
                                        <span className="text-rose-600 dark:text-rose-450">-${Number(shift.cashOut).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs font-black text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800 pt-2">
                                    <span>Expected Drawer Cash</span>
                                    <span>${Number(shift.expectedClosingBalance).toFixed(2)}</span>
                                </div>
                                {shift.status === 'CLOSED' && (
                                    <>
                                        <div className="flex justify-between text-xs font-black text-slate-800 dark:text-slate-200">
                                            <span>Actual Audited Cash Count</span>
                                            <span>${Number(shift.closingBalance).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-black border-t border-slate-100 dark:border-slate-800 pt-2">
                                            <span className="flex items-center gap-1">
                                                <AlertCircle className={`w-4 h-4 ${variance === 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                                                Discrepancy (Variance)
                                            </span>
                                            <span className={variance === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                                {variance === 0 
                                                    ? '$0.00' 
                                                    : variance > 0 
                                                        ? `+$${variance.toFixed(2)} (Overage)` 
                                                        : `-$${Math.abs(variance).toFixed(2)} (Shortage)`
                                                }
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Non-Cash Payments Breakdown */}
                        <div className="border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Payment Breakdown (Totals)</h5>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Cash</span>
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">${Number(shift.cashSales).toFixed(2)}</span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Card</span>
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">${Number(shift.cardSales || 0).toFixed(2)}</span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Mobile</span>
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">${Number(shift.mobileSales || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Remarks */}
                        {shift.remarks && (
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase">Audit Remarks</label>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs text-slate-700 dark:text-slate-350 font-medium italic">
                                    &ldquo;{shift.remarks}&rdquo;
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-sm transition-all"
                    >
                        Close Report
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
