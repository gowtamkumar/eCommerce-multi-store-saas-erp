import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { Loader2, Plus, X } from 'lucide-react';
import type { DunningRule } from '../../types';

export interface DunningRuleModalProps {
    rule: Partial<DunningRule> | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DunningRuleModal({ rule, onClose, onSuccess }: DunningRuleModalProps) {
    const [dunningLevel, setDunningLevel] = useState(rule?.dunningLevel || 1);
    const [daysOverdue, setDaysOverdue] = useState(rule?.daysOverdue || 30);
    const [action, setAction] = useState<'EMAIL' | 'CREDIT_HOLD' | 'EMAIL_AND_HOLD'>(rule?.action || 'EMAIL');
    const [emailSubject, setEmailSubject] = useState(rule?.emailSubject || 'URGENT: Overdue Account Notice');
    const [emailBody, setEmailBody] = useState(rule?.emailBody || 'Dear {{customerName}},\n\nYour account has invoices that are past due. Please pay immediately.\n\nSincerely,\nFinance');
    const [submitting, setSubmitting] = useState(false);

    const isEdit = !!rule?.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const endpoint = isEdit ? `/finance/ar/dunning/rules/${rule.id}` : '/finance/ar/dunning/rules';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetchAPI(endpoint, {
                method,
                body: JSON.stringify({
                    dunningLevel,
                    daysOverdue,
                    action,
                    emailSubject,
                    emailBody,
                }),
            });

            if (res.success) {
                toast.success(`Dunning rule ${isEdit ? 'updated' : 'created'} successfully`);
                onSuccess();
                onClose();
            } else {
                toast.error(res.message || 'Failed to save rule');
            }
        } catch {
            toast.error('Error saving dunning rule');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Dunning Rule' : 'Create Dunning Rule'}</h3>
                            <p className="text-xs text-slate-500">Configure thresholds, actions, and templates</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Dunning Level</label>
                            <input
                                required
                                type="number"
                                min="1"
                                value={dunningLevel}
                                onChange={(e) => setDunningLevel(parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                placeholder="e.g. 1"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Days Overdue Trigger</label>
                            <input
                                required
                                type="number"
                                min="1"
                                value={daysOverdue}
                                onChange={(e) => setDaysOverdue(parseInt(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                placeholder="e.g. 30"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Dunning Action</label>
                        <select
                            value={action}
                            onChange={(e) => setAction(e.target.value as any)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        >
                            <option value="EMAIL">Send Email Notification Only</option>
                            <option value="CREDIT_HOLD">Apply Credit Hold Only</option>
                            <option value="EMAIL_AND_HOLD">Send Email and Apply Credit Hold</option>
                        </select>
                    </div>

                    {(action === 'EMAIL' || action === 'EMAIL_AND_HOLD') && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Subject Template</label>
                                <input
                                    required
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Subject line"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Body Template</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-sans text-sm"
                                    placeholder="Write your email body. Use placeholders like {{customerName}}, {{companyName}}, {{daysOverdue}}, {{amountOverdue}}"
                                />
                                <p className="text-[10px] text-slate-400">
                                    Placeholders: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{"{{customerName}}"}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{"{{companyName}}"}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{"{{daysOverdue}}"}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{"{{amountOverdue}}"}</code>
                                </p>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isEdit ? 'Save Changes' : 'Create Rule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
