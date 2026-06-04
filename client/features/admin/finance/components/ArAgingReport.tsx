'use client';

import { fetchAPI } from '@/services/api';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import type { ArAgingRow } from '@/features/admin/customer/type';
import {
    AlertTriangle, CheckCircle2, CreditCard, DollarSign, Loader2,
    RefreshCw, Search, TrendingDown, X, FileText, Play, Plus, Trash2, Edit2, Clock, Mail
} from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

function AgingBadge({ days, amount }: { days: string; amount: number }) {
    const colorMap: Record<string, string> = {
        'Current': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        '1-30': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        '31-60': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        '61-90': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        '90+': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-black',
    };
    if (amount === 0) return <span className="text-slate-400 text-sm">—</span>;
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colorMap[days] || ''}`}>
            ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
    );
}

interface PaymentModalProps {
    customer: ArAgingRow;
    onClose: () => void;
    onSuccess: () => void;
}

function PaymentModal({ customer, onClose, onSuccess }: PaymentModalProps) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            toast.error('Please enter a valid payment amount');
            return;
        }
        if (parsedAmount > customer.totalOutstanding) {
            toast.error(`Cannot pay more than outstanding balance ($${customer.totalOutstanding})`);
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetchAPI('/finance/ar/payment', {
                method: 'POST',
                body: JSON.stringify({
                    customerId: customer.customerId,
                    amount: parsedAmount,
                    paymentMethod: method,
                    transactionId: `RCPT-${Date.now()}`,
                    remarks: remarks || `Payment from ${customer.customerName}`,
                }),
            });
            if (res.success) {
                toast.success(`$${parsedAmount} payment recorded for ${customer.customerName}`);
                onSuccess();
                onClose();
            } else {
                toast.error(res.message || 'Failed to record payment');
            }
        } catch {
            toast.error('Error recording payment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Record Payment</h3>
                            <p className="text-xs text-slate-500">{customer.customerName} — Outstanding: ${Number(customer.totalOutstanding).toLocaleString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Payment Amount (USD)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={customer.totalOutstanding}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                placeholder={`Max: $${Number(customer.totalOutstanding).toLocaleString()}`}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Payment Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        >
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="CARD">Card</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Remarks (Optional)</label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            placeholder="e.g. Invoice #1234 cleared"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Confirm Payment
                    </button>
                </form>
            </div>
        </div>
    );
}

interface DunningRule {
    id: string;
    dunningLevel: number;
    daysOverdue: number;
    action: 'EMAIL' | 'CREDIT_HOLD' | 'EMAIL_AND_HOLD';
    emailSubject: string;
    emailBody: string;
}

interface DunningRuleModalProps {
    rule: Partial<DunningRule> | null;
    onClose: () => void;
    onSuccess: () => void;
}

function DunningRuleModal({ rule, onClose, onSuccess }: DunningRuleModalProps) {
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

interface DunningLog {
    id: string;
    createdAt: string;
    actionTaken: 'EMAIL' | 'CREDIT_HOLD' | 'EMAIL_AND_HOLD';
    recipientEmail: string;
    emailSubject: string | null;
    emailBody: string | null;
    triggeredDaysOverdue: number;
    triggeredAmountOverdue: number;
    customer: {
        id: string;
        name: string;
        companyName: string | null;
    };
    dunningRule: {
        dunningLevel: number;
        daysOverdue: number;
    };
}

export default function ArAgingPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'logs'>('dashboard');
    const [rows, setRows] = useState<ArAgingRow[]>([]);
    const [rules, setRules] = useState<DunningRule[]>([]);
    const [logs, setLogs] = useState<DunningLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [payingCustomer, setPayingCustomer] = useState<ArAgingRow | null>(null);
    const [editingRule, setEditingRule] = useState<Partial<DunningRule> | null>(null);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [runningAudit, setRunningAudit] = useState(false);
    const [selectedLog, setSelectedLog] = useState<DunningLog | null>(null);

    const fetchAging = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/finance/ar/aging');
            if (res.success) setRows(res.data || []);
        } catch {
            toast.error('Failed to load AR aging report');
        } finally {
            setLoading(false);
        }
    };

    const fetchRules = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/finance/ar/dunning/rules');
            if (res.success) setRules(res.data || []);
        } catch {
            toast.error('Failed to load dunning rules');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/finance/ar/dunning/logs');
            if (res.success) setLogs(res.data || []);
        } catch {
            toast.error('Failed to load dunning logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchAging();
        } else if (activeTab === 'rules') {
            fetchRules();
        } else if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    const handleRunAudit = async () => {
        setRunningAudit(true);
        try {
            const res = await fetchAPI('/finance/ar/dunning/run-audit', { method: 'POST' });
            if (res.success) {
                toast.success(`Dunning audit finished: ${res.data.processed} accounts processed, ${res.data.logsCreated} notices generated.`);
                if (activeTab === 'dashboard') fetchAging();
                else if (activeTab === 'logs') fetchLogs();
            } else {
                toast.error(res.message || 'Audit execution failed');
            }
        } catch {
            toast.error('Failed to run dunning audit sweep');
        } finally {
            setRunningAudit(false);
        }
    };

    const handleDeleteRule = async (id: string) => {
        if (!confirm('Are you sure you want to delete this dunning rule?')) return;
        try {
            const res = await fetchAPI(`/finance/ar/dunning/rules/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Dunning rule deleted');
                fetchRules();
            } else {
                toast.error(res.message || 'Failed to delete rule');
            }
        } catch {
            toast.error('Error deleting dunning rule');
        }
    };

    const filtered = rows.filter(r =>
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        r.customerEmail.toLowerCase().includes(search.toLowerCase())
    );

    const totalOutstanding = rows.reduce((s, r) => s + Number(r.totalOutstanding), 0);
    const totalOverdue = rows.reduce((s, r) => s + r.aging['1-30'] + r.aging['31-60'] + r.aging['61-90'] + r.aging['90+'], 0);
    const holdCount = rows.filter(r => r.creditHold).length;

    const agingColumns = useMemo<DataTableColumn<ArAgingRow>[]>(() => [
        {
            key: 'customer',
            header: 'Customer / Company',
            cell: (row) => (
                <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{row.customerName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.companyName || row.customerEmail}</p>
                    {row.creditHold && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                            <AlertTriangle className="w-2.5 h-2.5" /> Credit Hold
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'outstanding',
            header: 'Outstanding',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => {
                const utilization = row.creditLimit > 0 ? (row.totalOutstanding / row.creditLimit) * 100 : 0;
                return (
                    <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm font-mono">
                            ${Number(row.totalOutstanding).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        {row.creditLimit > 0 && (
                            <div className="mt-1">
                                <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full ml-auto overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${utilization >= 90 ? 'bg-rose-500' : utilization >= 70 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(utilization, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 text-right mt-0.5">{utilization.toFixed(0)}% of ${Number(row.creditLimit).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'current',
            header: 'Current',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="Current" amount={row.aging.current} />,
        },
        {
            key: '1-30',
            header: '1–30 Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="1-30" amount={row.aging['1-30']} />,
        },
        {
            key: '31-60',
            header: '31–60 Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="31-60" amount={row.aging['31-60']} />,
        },
        {
            key: '61-90',
            header: '61–90 Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="61-90" amount={row.aging['61-90']} />,
        },
        {
            key: '90+',
            header: '90+ Days',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => <AgingBadge days="90+" amount={row.aging['90+']} />,
        },
        {
            key: 'creditLimit',
            header: 'Credit Limit',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (row) => row.creditLimit > 0
                ? <span className="text-sm font-bold text-indigo-755 dark:text-indigo-400 font-mono">${Number(row.creditLimit).toLocaleString()}</span>
                : <span className="text-slate-400 text-sm">—</span>,
        },
        {
            key: 'action',
            header: 'Action',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => (
                <button
                    onClick={() => setPayingCustomer(row)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm ml-auto inline-flex"
                >
                    <DollarSign className="w-3.5 h-3.5" />
                    Pay
                </button>
            ),
        },
    ], []);

    const logColumns = useMemo<DataTableColumn<DunningLog>[]>(() => [
        {
            key: 'triggeredDate',
            header: 'Triggered Date',
            cell: (log) => (
                <span className="text-slate-500 font-mono text-xs">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                </span>
            ),
        },
        {
            key: 'customer',
            header: 'Customer',
            cell: (log) => (
                <span className="font-semibold text-slate-900 dark:text-white">
                    {log.customer?.name || 'N/A'}
                    {log.customer?.companyName && <span className="block text-xs font-normal text-slate-400">{log.customer.companyName}</span>}
                </span>
            ),
        },
        {
            key: 'ruleLevel',
            header: 'Rule Level',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (log) => (
                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold">
                    Level {log.dunningRule?.dunningLevel || 'N/A'}
                </span>
            ),
        },
        {
            key: 'actionTaken',
            header: 'Action Taken',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (log) => {
                const actionColors = {
                    EMAIL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
                    CREDIT_HOLD: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
                    EMAIL_AND_HOLD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                };
                return (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${actionColors[log.actionTaken] || ''}`}>
                        {log.actionTaken}
                    </span>
                );
            },
        },
        {
            key: 'recipientEmail',
            header: 'Recipient Email',
            cell: (log) => (
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {log.recipientEmail}
                </span>
            ),
        },
        {
            key: 'daysOverdue',
            header: 'Days Overdue',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (log) => (
                <span className="font-black font-mono text-slate-700 dark:text-slate-300">
                    {log.triggeredDaysOverdue} days
                </span>
            ),
        },
        {
            key: 'amountOverdue',
            header: 'Amount Overdue',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (log) => (
                <span className="font-black font-mono text-indigo-600 dark:text-indigo-400">
                    ${Number(log.triggeredAmountOverdue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            key: 'viewEmail',
            header: 'View Email',
            headerClassName: 'text-center',
            className: 'text-center',
            cell: (log) => log.emailSubject ? (
                <button
                    onClick={() => setSelectedLog(log)}
                    className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all inline-block"
                >
                    Details
                </button>
            ) : (
                <span className="text-slate-400 text-xs">—</span>
            ),
        },
    ], []);

    return (
        <div className="space-y-6 pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Accounts Receivable & Dunning</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">B2B customer debt aging, credit limits, automated dunning rules, and logs</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRunAudit}
                        disabled={runningAudit}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm font-semibold disabled:opacity-50 shadow-md shadow-indigo-500/10"
                    >
                        {runningAudit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Run Dunning Audit
                    </button>
                    <button
                        onClick={() => {
                            if (activeTab === 'dashboard') fetchAging();
                            else if (activeTab === 'rules') fetchRules();
                            else if (activeTab === 'logs') fetchLogs();
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-semibold disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Custom Glassmorphism Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('rules')}
                    className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${activeTab === 'rules' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    Dunning Rules
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${activeTab === 'logs' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    Dunning Logs
                </button>
            </div>

            {activeTab === 'dashboard' && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Outstanding</p>
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                                ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{rows.length} active B2B accounts</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                    <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Overdue</p>
                            </div>
                            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                                ${totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Past due invoices (1-90+ days)</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${holdCount > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                    <AlertTriangle className={`w-5 h-5 ${holdCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Credit Hold</p>
                            </div>
                            <p className={`text-2xl font-black font-mono ${holdCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {holdCount} accounts
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Blocked from on-account purchases</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search customer, company, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    <DataTable
                        data={filtered}
                        columns={agingColumns}
                        getRowKey={(row) => row.customerId}
                        loading={loading}
                        loadingLabel="Loading aging report..."
                        emptyLabel={
                            <div className="flex flex-col items-center gap-3 text-slate-400 py-4">
                                <FileText className="w-10 h-10 opacity-40" />
                                <p className="text-sm font-medium">No outstanding AR balances found</p>
                                <p className="text-xs">All B2B accounts are fully settled</p>
                            </div>
                        }
                        minWidthClassName="min-w-[1100px]"
                        containerClassName="rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
                    />
                </>
            )}

            {activeTab === 'rules' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dunning Notice Rules</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Automate notices and credit freezes as invoices age</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingRule(null);
                                setShowRuleModal(true);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm font-bold shadow-md shadow-indigo-500/10"
                        >
                            <Plus className="w-4 h-4" /> Add Rule
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading && rules.length === 0 ? (
                            <div className="col-span-full py-12 flex justify-center items-center text-slate-500 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading rules...
                            </div>
                        ) : rules.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40 text-orange-500" />
                                <p className="font-semibold text-sm">No Dunning Rules Configured</p>
                                <p className="text-xs">Create a rule to automate notices and credit holds.</p>
                            </div>
                        ) : (
                            rules.map((rule) => {
                                const actionMap = {
                                    EMAIL: { label: 'Email Notice Only', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', icon: Mail },
                                    CREDIT_HOLD: { label: 'Credit Hold Only', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400', icon: AlertTriangle },
                                    EMAIL_AND_HOLD: { label: 'Email & Credit Hold', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', icon: AlertTriangle }
                                };
                                const act = actionMap[rule.action] || { label: rule.action, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800', icon: AlertTriangle };
                                return (
                                    <div key={rule.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-xs font-black">
                                                        L{rule.dunningLevel}
                                                    </span>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Dunning Level {rule.dunningLevel}</h3>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${act.color}`}>
                                                    {act.label}
                                                </span>
                                            </div>
                                            <div className="space-y-2 mt-4 text-xs">
                                                <p className="text-slate-500 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    Triggers at <strong className="text-slate-800 dark:text-white">{rule.daysOverdue} days</strong> overdue
                                                </p>
                                                {(rule.action === 'EMAIL' || rule.action === 'EMAIL_AND_HOLD') && (
                                                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                                        <p className="font-semibold text-[10px] text-slate-400 uppercase tracking-widest">Email Subject</p>
                                                        <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">{rule.emailSubject}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 justify-end mt-5 border-t border-slate-100 dark:border-slate-700 pt-3">
                                            <button
                                                onClick={() => {
                                                    setEditingRule(rule);
                                                    setShowRuleModal(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dunning Notice Logs</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Audit trail of sent notices and auto-hold enforcement events</p>
                    </div>

                    <DataTable
                        data={logs}
                        columns={logColumns}
                        getRowKey={(log) => log.id}
                        loading={loading}
                        emptyLabel="No dunning events recorded yet."
                        minWidthClassName="min-w-[1000px]"
                        containerClassName="rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
                    />
                </div>
            )}

            {/* Rule Modal */}
            {showRuleModal && (
                <DunningRuleModal
                    rule={editingRule}
                    onClose={() => {
                        setShowRuleModal(false);
                        setEditingRule(null);
                    }}
                    onSuccess={fetchRules}
                />
            )}

            {/* Payment Modal */}
            {payingCustomer && (
                <PaymentModal
                    customer={payingCustomer}
                    onClose={() => setPayingCustomer(null)}
                    onSuccess={fetchAging}
                />
            )}

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white">Sent Notice Preview</h3>
                            <button onClick={() => setSelectedLog(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Subject</p>
                                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedLog.emailSubject}</p>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Recipient</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{selectedLog.recipientEmail}</p>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Body</p>
                                <div className="mt-1 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl whitespace-pre-wrap font-sans text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 text-xs">
                                    {selectedLog.emailBody}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
