'use client';

import dayjs from 'dayjs';
import { ShoppingBag, Wallet } from 'lucide-react';
import React from 'react';
import { CustomerLedgerTableProps, LedgerTransaction } from '../../types';


const getStatusColor = (tx: LedgerTransaction) => {
    if (tx.type === 'PAYMENT') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';

    switch (tx.status?.toUpperCase()) {
        case 'DELIVERED':
        case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'PENDING': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'CANCELLED': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
        default: return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
};

const CustomerLedgerTable: React.FC<CustomerLedgerTableProps> = ({ transactions, formatPrice, customerInfo }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden font-display">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Transaction History</h3>
                    <p className="text-sm text-slate-500 font-medium">{customerInfo.name} • {customerInfo.email}</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-black">
                            <th className="p-4">Date</th>
                            <th className="p-4">Transaction Details</th>
                            <th className="p-4 text-right">Debit (Owed)</th>
                            <th className="p-4 text-right">Credit (Paid)</th>
                            <th className="p-4 text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400 font-medium italic">
                                    No transaction records found for this customer.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                                    <td className="p-4 whitespace-nowrap">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{dayjs(tx.date).format('MMM D, YYYY')}</p>
                                        <p className="text-[10px] text-slate-400">{dayjs(tx.date).format('h:mm A')}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${tx.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30'}`}>
                                                {tx.type === 'PAYMENT' ? <Wallet className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {tx.type === 'PAYMENT' ? 'Payment Settlement' : 'Store Order'}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${getStatusColor(tx)}`}>
                                                        {tx.status || 'SUCCESS'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">Ref: {tx.reference}</p>
                                                {tx.note && <p className="text-[10px] text-slate-400 italic mt-1 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded w-fit capitalize">Note: {tx.note}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {tx.debit > 0 ? (
                                            <span className="text-sm font-bold text-rose-600">+{formatPrice(tx.debit)}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        {tx.credit > 0 ? (
                                            <span className="text-sm font-bold text-emerald-600">-{formatPrice(tx.credit)}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`text-sm font-black ${tx.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {formatPrice(tx.balance)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default React.memo(CustomerLedgerTable);
