'use client';

import { RefreshCw } from 'lucide-react';

export interface WalletHeaderProps {
    loading: boolean;
    onRefresh: () => void;
}

export default function WalletHeader({ loading, onRefresh }: WalletHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                    Store Credit &amp; Wallet
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Manage customer wallets, credit refunds, and track store credit liability ledger.
                </p>
            </div>
            <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-semibold disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </button>
        </div>
    );
}
