'use client';

import { ArrowDownRight, ArrowUpRight, RefreshCw, Users } from 'lucide-react';
import type { PointsAdjustmentTabProps } from '../types';

export default function PointsAdjustmentTab({
    customerId,
    adjustPoints,
    adjustNote,
    customerHistory,
    loadingHistory,
    message,
    onCustomerIdChange,
    onAdjustPointsChange,
    onAdjustNoteChange,
    onFetchHistory,
    onAdjustment,
}: PointsAdjustmentTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200/50 dark:border-slate-800 space-y-6 h-fit">
                <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    Balance Adjustment
                </h3>

                {message.text && (
                    <div className={`p-4 rounded-xl text-xs font-bold border ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400'
                        : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Customer ID (UUID)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Paste User ID..."
                            value={customerId}
                            onChange={(event) => onCustomerIdChange(event.target.value)}
                            className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white font-mono"
                        />
                        <button
                            onClick={onFetchHistory}
                            disabled={loadingHistory}
                            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                        >
                            Find
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Point Amount</label>
                        <input
                            type="number"
                            value={adjustPoints}
                            onChange={(event) => onAdjustPointsChange(Number(event.target.value))}
                            className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Audit / Ledger Note</label>
                        <textarea
                            placeholder="E.g., Customer points mismatch reconciliation"
                            value={adjustNote}
                            onChange={(event) => onAdjustNoteChange(event.target.value)}
                            className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white h-24 resize-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={() => onAdjustment('credit')}
                        disabled={loadingHistory}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
                    >
                        Credit Points
                    </button>
                    <button
                        onClick={() => onAdjustment('debit')}
                        disabled={loadingHistory}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-rose-500/10 active:scale-95 disabled:opacity-50"
                    >
                        Debit Points
                    </button>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50 dark:border-slate-800 space-y-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <span>Audit Ledger</span>
                    {customerId.trim() && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">User: {customerId.slice(0, 8)}...</span>
                    )}
                </h3>

                {loadingHistory ? (
                    <div className="flex flex-col items-center justify-center p-16">
                        <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
                        <p className="text-xs font-bold text-slate-500 mt-2">Loading Customer History...</p>
                    </div>
                ) : customerHistory.length === 0 ? (
                    <div className="p-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                        <Users className="w-10 h-10 text-slate-400 mx-auto" />
                        <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">No Ledger Retrieved</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Input a valid customer ID in the balance adjustment tool and click &quot;Find&quot; or perform adjustments to view their immutable transaction logs.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Action</th>
                                    <th className="px-5 py-3">Note</th>
                                    <th className="px-5 py-3 text-right">Points Changed</th>
                                    <th className="px-5 py-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {customerHistory.map((entry) => {
                                    const isEarn = entry.points > 0;
                                    return (
                                        <tr key={entry.id} className="text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isEarn
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {isEarn ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                    {entry.type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-slate-500 dark:text-slate-400 max-w-[180px] truncate" title={entry.note || ''}>
                                                {entry.note || 'N/A'}
                                            </td>
                                            <td className={`px-5 py-3.5 text-right font-black font-mono text-xs ${isEarn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {isEarn ? '+' : ''}{entry.points.toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-black font-mono text-xs text-slate-900 dark:text-white">
                                                {entry.balanceAfter.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
