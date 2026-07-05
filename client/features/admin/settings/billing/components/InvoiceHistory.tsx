'use client';

import dayjs from 'dayjs';
import { Clock, Download } from 'lucide-react';
import React from 'react';
import { useSettings } from '@/hooks/SettingsContext';
import { InvoiceHistoryProps } from '../../type';
import { convertAmountToBaseCurrency } from '../lib/formatBillingCurrency';



const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ history }) => {
    const { formatPrice, settings } = useSettings();

    return (
        <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/50 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl transition-transform hover:scale-110">
                        <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-display">Billing History</h3>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/20 transition-colors">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Invoice</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Plan</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Amount</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Date</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center font-display">Status</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right font-display">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-16 text-center text-slate-500 font-medium italic">
                                    No billing history found. Your journey starts here!
                                </td>
                            </tr>
                        ) : (
                            history.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">#{invoice.invoiceNumber}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize">{invoice.plan?.name}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-black text-slate-900 dark:text-white">
                                            {formatPrice(convertAmountToBaseCurrency(invoice.amount, invoice.currency, settings))}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            {dayjs(invoice.billingDate).format('MMM DD, YYYY')}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-transparent transition-all ${invoice.status === 'PAID' || invoice.status === 'COMPLETED'
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:border-emerald-200 dark:group-hover:border-emerald-800'
                                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:border-amber-200 dark:group-hover:border-amber-800'
                                            }`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all group/btn shadow-sm hover:shadow active:scale-90">
                                            <Download className="w-5 h-5 text-slate-400 group-hover/btn:text-indigo-600 transition-colors" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default React.memo(InvoiceHistory);
