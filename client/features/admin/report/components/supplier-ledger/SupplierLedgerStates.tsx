'use client';

import { Search } from 'lucide-react';

export function SupplierLedgerInitializing() {
    return (
        <div className="p-12 text-center text-slate-500 animate-pulse">
            <div className="inline-block p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium">Initializing supplier records...</p>
        </div>
    );
}

export function SupplierLedgerEmpty() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-full">
                <Search className="w-8 h-8 text-slate-400" />
            </div>
            <div className="max-w-xs">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose a Supplier</h3>
                <p className="text-slate-500 text-sm mt-1">Select a supplier from the list above to view their transactional history and account balance.</p>
            </div>
        </div>
    );
}

export function SupplierLedgerLoading() {
    return (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
            <p className="font-medium">Fetching ledger records...</p>
        </div>
    );
}
