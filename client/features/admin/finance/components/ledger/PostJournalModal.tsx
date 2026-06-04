'use client';

import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, FileText, Loader2, Scale, Trash2, X } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import type { FormLine } from '../../types';

interface ChartAccount {
    id: string;
    code: string;
    name: string;
    type: string;
}

interface JournalFormTotals {
    debits: number;
    credits: number;
    difference: number;
    isBalanced: boolean;
}

export interface PostJournalModalProps {
    open: boolean;
    onClose: () => void;
    coa: ChartAccount[];
    journalType: string;
    onJournalTypeChange: (value: string) => void;
    journalDate: string;
    onJournalDateChange: (value: string) => void;
    description: string;
    onDescriptionChange: (value: string) => void;
    refType: string;
    onRefTypeChange: (value: string) => void;
    refId: string;
    onRefIdChange: (value: string) => void;
    lines: FormLine[];
    onAddLine: () => void;
    onRemoveLine: (idx: number) => void;
    onLineChange: (idx: number, field: keyof FormLine, value: string) => void;
    formTotals: JournalFormTotals;
    posting: boolean;
    onSubmit: (e: FormEvent) => void;
}

export default function PostJournalModal({
    open,
    onClose,
    coa,
    journalType,
    onJournalTypeChange,
    journalDate,
    onJournalDateChange,
    description,
    onDescriptionChange,
    refType,
    onRefTypeChange,
    refId,
    onRefIdChange,
    lines,
    onAddLine,
    onRemoveLine,
    onLineChange,
    formTotals,
    posting,
    onSubmit,
}: PostJournalModalProps) {
    const { formatPrice } = useSettings();

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden my-8"
                    >
                        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                    <Scale className="w-6 h-6 text-indigo-600" />
                                    Manual Journal Entry Voucher
                                </h2>
                                <p className="text-xs text-slate-400 font-semibold mt-1">Sum of Debits must equal Sum of Credits</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Journal Type</label>
                                    <select
                                        value={journalType}
                                        onChange={(e) => onJournalTypeChange(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm text-slate-900 dark:text-white"
                                    >
                                        <option value="GENERAL">General Journal</option>
                                        <option value="SALES">Sales Journal</option>
                                        <option value="PURCHASE">Purchase Journal</option>
                                        <option value="CASH_RECEIPT">Cash Receipt</option>
                                        <option value="CASH_DISBURSEMENT">Cash Disbursement</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Voucher Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={journalDate}
                                        onChange={(e) => onJournalDateChange(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Transaction Narration</label>
                                    <input
                                        type="text"
                                        required
                                        value={description}
                                        onChange={(e) => onDescriptionChange(e.target.value)}
                                        placeholder="Description of transaction..."
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ref Document Type (Optional)</label>
                                    <input
                                        type="text"
                                        value={refType}
                                        onChange={(e) => onRefTypeChange(e.target.value)}
                                        placeholder="e.g. INVOICE, PO"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ref Document ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={refId}
                                        onChange={(e) => onRefIdChange(e.target.value)}
                                        placeholder="e.g. INV-908123"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pl-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Lines</span>
                                    <button
                                        type="button"
                                        onClick={onAddLine}
                                        className="text-indigo-600 hover:text-indigo-700 text-xs font-black uppercase tracking-widest"
                                    >
                                        + Add Line
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                    {lines.map((line, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <select
                                                value={line.accountCode}
                                                required
                                                onChange={(e) => onLineChange(idx, 'accountCode', e.target.value)}
                                                className="flex-3 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-xs text-slate-900 dark:text-white"
                                            >
                                                <option value="">Select Account...</option>
                                                {coa.map((acc) => (
                                                    <option key={acc.id} value={acc.code}>
                                                        [{acc.code}] {acc.name} ({acc.type})
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                value={line.side}
                                                onChange={(e) => onLineChange(idx, 'side', e.target.value)}
                                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-xs text-slate-900 dark:text-white"
                                            >
                                                <option value="DEBIT">Debit</option>
                                                <option value="CREDIT">Credit</option>
                                            </select>

                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                min="0.01"
                                                placeholder="Amount"
                                                value={line.amount}
                                                onChange={(e) => onLineChange(idx, 'amount', e.target.value)}
                                                className="flex-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-black text-xs font-mono text-slate-900 dark:text-white"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => onRemoveLine(idx)}
                                                className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-900/20 hover:bg-rose-600 hover:text-white rounded-2xl transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${formTotals.isBalanced ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-950/20' : 'bg-rose-50 border-rose-100 dark:bg-rose-950/10 dark:border-rose-950/20'}`}>
                                <div className="flex gap-3 items-center">
                                    {formTotals.isBalanced ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                    ) : (
                                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                                    )}
                                    <div>
                                        <p className={`text-sm font-black uppercase ${formTotals.isBalanced ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                                            {formTotals.isBalanced ? 'Voucher Balanced' : 'Unbalanced Voucher'}
                                        </p>
                                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                            {formTotals.isBalanced ? 'Entry matches accounting rules and can be saved.' : `Difference of ${formatPrice(formTotals.difference)} needs to be cleared.`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 font-mono text-xs">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Debits</p>
                                        <p className="text-sm font-black text-emerald-600">{formatPrice(formTotals.debits)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Credits</p>
                                        <p className="text-sm font-black text-indigo-600">{formatPrice(formTotals.credits)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={posting || !formTotals.isBalanced || formTotals.debits === 0}
                                    className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2"
                                >
                                    {posting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4" />
                                            Post Voucher
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
