'use client';

import {
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    FileText,
    Loader2,
    Minus,
    Plus,
    Wallet,
} from 'lucide-react';
import type { WalletSummary, WalletTransaction } from '@/services/wallet';
import type { WalletAdjustmentType, WalletCustomerRow } from '../../types';

interface WalletTransactionRowProps {
    transaction: WalletTransaction;
    formatPrice: (amount: number) => string;
}

function WalletTransactionRow({ transaction, formatPrice }: WalletTransactionRowProps) {
    const isCredit = Number(transaction.amount) > 0;
    const amount = Math.abs(Number(transaction.amount));

    return (
        <div className="py-3.5 flex justify-between items-start gap-4">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCredit
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                    }`}>
                        {isCredit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {transaction.type}
                    </span>
                    <span className="text-[11px] text-slate-400">{new Date(transaction.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">{transaction.note || 'Adjustment transaction'}</p>
                {transaction.referenceId && (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {transaction.referenceType} ({transaction.referenceId.slice(0, 8)})
                    </p>
                )}
            </div>
            <div className="text-right">
                <p className={`text-sm font-bold font-mono ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isCredit ? '+' : '-'}{formatPrice(amount)}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Bal: {formatPrice(Number(transaction.balanceAfter))}
                </p>
            </div>
        </div>
    );
}

export interface WalletDetailsPanelProps {
    selectedCustomerId: string | null;
    customer: WalletCustomerRow | undefined;
    wallet: WalletSummary | null;
    historyLoading: boolean;
    onOpenAdjustment: (type: WalletAdjustmentType) => void;
    formatPrice: (amount: number) => string;
}

export default function WalletDetailsPanel({
    selectedCustomerId,
    customer,
    wallet,
    historyLoading,
    onOpenAdjustment,
    formatPrice,
}: WalletDetailsPanelProps) {
    if (!selectedCustomerId) {
        return (
            <div className="lg:col-span-7">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                    <Wallet className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-base">No Customer Selected</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Select a customer from the left sidebar to view their wallet balance and transaction ledger.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
                {customer && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">{customer.name}</h3>
                                <p className="text-xs text-slate-400">{customer.email}</p>
                            </div>
                        </div>
                        <div className="text-right sm:text-right">
                            <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Available Balance</p>
                            <p className="text-2xl font-black text-brand-600 font-mono mt-0.5">
                                {formatPrice(Number(wallet?.balance || 0))}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => onOpenAdjustment('credit')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-sm shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Credit Wallet
                    </button>
                    <button
                        onClick={() => onOpenAdjustment('debit')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all text-sm shadow-sm"
                    >
                        <Minus className="w-4 h-4" /> Debit Wallet
                    </button>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Transaction History (Ledger)
                    </h4>

                    {historyLoading ? (
                        <div className="flex justify-center items-center py-16 text-slate-400 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading ledger...
                        </div>
                    ) : !wallet || wallet.history.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No wallet transactions found for this customer
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {wallet.history.map((transaction) => (
                                <WalletTransactionRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    formatPrice={formatPrice}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
