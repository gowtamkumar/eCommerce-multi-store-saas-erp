'use client';

import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import React from 'react';
import type { ReportExportSettingsProps } from '../../types';



const ReportExportSettings: React.FC<ReportExportSettingsProps> = ({
    reportType,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    suppliers,
    selectedSupplierId,
    onSupplierChange,
    customers,
    selectedCustomerId,
    onCustomerChange,
    onExport,
    isLoading
}) => {
    const isExportDisabled = isLoading ||
        (reportType === 'supplier-ledger' && !selectedSupplierId) ||
        (reportType === 'customer-ledger' && !selectedCustomerId);

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 delay-150 font-display">
            <div>
                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-brand-600" />
                    Report Configuration
                </h3>

                <div className="space-y-6">
                    {/* Date Range Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Date Range</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => onStartDateChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                />
                                <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-focus-within:border-brand-500/20 transition-all" />
                            </div>
                            <div className="relative group">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => onEndDateChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                />
                                <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-focus-within:border-brand-500/20 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Conditional Supplier Selection */}
                    {reportType === 'supplier-ledger' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Target Supplier</label>
                            <div className="relative group">
                                <select
                                    value={selectedSupplierId}
                                    onChange={(e) => onSupplierChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 outline-none appearance-none transition-all"
                                >
                                    <option value="">Choose a Supplier</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                    <Filter className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Conditional Customer Selection */}
                    {reportType === 'customer-ledger' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Target Customer</label>
                            <div className="relative group">
                                <select
                                    value={selectedCustomerId}
                                    onChange={(e) => onCustomerChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 outline-none appearance-none transition-all"
                                >
                                    <option value="">Choose a Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name || c.email}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                    <Filter className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Format Preview */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Output Format</label>
                        <div className="flex items-center gap-4 p-5 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">CSV Spreadsheet</p>
                                <p className="text-[10px] text-slate-500 font-medium">Standard format for Excel, Sheets, & Quickbooks</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onExport}
                disabled={isExportDisabled}
                className="w-full py-5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white rounded-2xl font-black font-display shadow-2xl shadow-brand-500/20 transition-all flex items-center justify-center gap-3 transform active:scale-[0.98] group"
            >
                {isLoading ? (
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        <span>PREPARING CSV...</span>
                    </div>
                ) : (
                    <>
                        <Download className="w-6 h-6 group-hover:bounce transition-transform" />
                        <span>INITIALIZE DATA EXPORT</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default React.memo(ReportExportSettings);
