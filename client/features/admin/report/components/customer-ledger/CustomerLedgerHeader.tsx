'use client';

import { ChevronRight, Download, Loader2, Printer, Receipt, Users } from 'lucide-react';
import React from 'react';
import { CustomerLedgerHeaderProps } from '../../types';



const CustomerLedgerHeader: React.FC<CustomerLedgerHeaderProps> = ({
    customers,
    selectedCustomerId,
    onCustomerChange,
    hasLedgerData,
    currencyCode,
    currencySymbol,
    onExportCsv,
    isExporting,
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-brand-600" />
                    Customer Payment Ledger
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Track obligations and settlements for your customers
                    {currencyCode && currencySymbol && (
                        <span className="ml-2 text-xs font-bold text-brand-600 dark:text-brand-400">
                            · {currencyCode} ({currencySymbol})
                        </span>
                    )}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative w-64">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={selectedCustomerId}
                        onChange={(e) => onCustomerChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none"
                    >
                        <option value="">Select a Customer</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                        ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                </div>
                {hasLedgerData && (
                    <>
                        {onExportCsv && (
                            <button
                                type="button"
                                onClick={onExportCsv}
                                disabled={isExporting}
                                className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                title="Download CSV"
                            >
                                {isExporting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">{isExporting ? 'Exporting…' : 'CSV'}</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title="Print Ledger"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default React.memo(CustomerLedgerHeader);
