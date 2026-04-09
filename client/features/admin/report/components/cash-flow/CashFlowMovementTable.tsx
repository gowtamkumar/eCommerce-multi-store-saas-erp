'use client';

import dayjs from 'dayjs';
import React from 'react';
import { CashMovement } from '../../types';

interface CashFlowMovementTableProps {
    movements: CashMovement[];
    formatPrice: (price: number) => string;
}

const CashFlowMovementTable: React.FC<CashFlowMovementTableProps> = ({ movements, formatPrice }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden font-display">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white">Detailed Cash Movements</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                            <th className="p-4">Date</th>
                            <th className="p-4">Reference/Category</th>
                            <th className="p-4 text-right">Inflow</th>
                            <th className="p-4 text-right">Outflow</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {movements.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-slate-400 font-medium italic">
                                    No movements recorded in the selected period.
                                </td>
                            </tr>
                        ) : (
                            movements.map((m, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                                    <td className="p-4 whitespace-nowrap">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{dayjs(m.date).format('MMM D, YYYY')}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{m.reference || 'N/A'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{m.category}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        {m.type === 'INFLOW' ? (
                                            <span className="text-sm font-black text-emerald-600">+{formatPrice(m.amount)}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        {m.type === 'OUTFLOW' ? (
                                            <span className="text-sm font-black text-rose-600">-{formatPrice(m.amount)}</span>
                                        ) : '-'}
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

export default React.memo(CashFlowMovementTable);
