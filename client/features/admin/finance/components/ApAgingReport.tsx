'use client';

import { fetchAPI } from '@/services/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    AlertTriangle, CheckCircle2, CreditCard, DollarSign, Loader2,
    RefreshCw, Search, TrendingDown, FileText, Play, Plus, Clock, Mail, CheckSquare, Square
} from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';

function AgingBadge({ days, amount }: { days: string; amount: number }) {
    const { formatPrice } = useSettings();
    const colorMap: Record<string, string> = {
        'Current': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
        '1-30': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
        '31-60': 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
        '61-90': 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400',
        '90+': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-black',
    };
    if (amount === 0) return <span className="text-slate-400 dark:text-slate-600 text-sm">—</span>;
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colorMap[days] || ''}`}>
            {formatPrice(amount)}
        </span>
    );
}

interface ApAgingRow {
    supplierId: string;
    supplierName: string;
    email: string;
    phone: string;
    totalOutstanding: number;
    aging: {
        current: number;
        '1-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
}

interface UnpaidInvoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    matchStatus: string;
    supplierId: string;
    supplier?: {
        name: string;
    };
}

export default function ApAgingReport() {
    const { formatPrice } = useSettings();
    const [activeTab, setActiveTab] = useState<'aging' | 'batch-payment'>('aging');
    const [agingData, setAgingData] = useState<ApAgingRow[]>([]);
    const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Batch Payment selection state
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
    const [transactionId, setTransactionId] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentRunResult, setPaymentRunResult] = useState<any | null>(null);

    const fetchAging = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/supplier-invoices/aging');
            if (res.success) setAgingData(res.data || []);
        } catch {
            toast.error('Failed to load AP aging report');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnpaidInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/supplier-invoices');
            if (res.success) {
                // Filter locally for unpaid/partially paid status
                const items = Array.isArray(res.data?.items) ? res.data.items : (res.data || []);
                const unpaid = items.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED');
                setUnpaidInvoices(unpaid);
            }
        } catch {
            toast.error('Failed to load unpaid invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'aging') {
            fetchAging();
        } else {
            fetchUnpaidInvoices();
            setSelectedInvoiceIds([]);
            setPaymentRunResult(null);
        }
    }, [activeTab]);

    const handleSelectInvoice = (id: string) => {
        setSelectedInvoiceIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAllInvoices = () => {
        if (selectedInvoiceIds.length === unpaidInvoices.length) {
            setSelectedInvoiceIds([]);
        } else {
            setSelectedInvoiceIds(unpaidInvoices.map(i => i.id));
        }
    };

    const handleBatchPaymentRun = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedInvoiceIds.length === 0) {
            toast.error('Please select at least one invoice to pay');
            return;
        }

        setProcessingPayment(true);
        const toastId = toast.loading('Running batch payments — posting debits to AP ledger...');
        try {
            const res = await fetchAPI('/supplier-invoices/batch-payment', {
                method: 'POST',
                body: JSON.stringify({
                    invoiceIds: selectedInvoiceIds,
                    paymentMethod,
                    transactionId: transactionId || `BATCH-${Date.now()}`,
                    note: paymentNote || 'Batch payment execution run'
                })
            });

            if (res.success) {
                toast.success('Batch payment run completed successfully!', { id: toastId });
                setPaymentRunResult(res.data);
                fetchUnpaidInvoices();
                setSelectedInvoiceIds([]);
                setTransactionId('');
                setPaymentNote('');
            } else {
                toast.error(res.message || 'Batch payment execution failed', { id: toastId });
            }
        } catch {
            toast.error('Error executing batch payment run', { id: toastId });
        } finally {
            setProcessingPayment(false);
        }
    };

    const filteredAging = agingData.filter(r =>
        r.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        r.email?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredInvoices = unpaidInvoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.supplier?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const totalOutstanding = agingData.reduce((s, r) => s + Number(r.totalOutstanding), 0);
    const totalOverdue = agingData.reduce((s, r) => s + r.aging['1-30'] + r.aging['31-60'] + r.aging['61-90'] + r.aging['90+'], 0);
    const unpaidCount = unpaidInvoices.length;

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Accounts Payable & Payment Runs</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">Track vendor liability aging categories and execute batch payment matching sweeps</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (activeTab === 'aging') fetchAging();
                            else fetchUnpaidInvoices();
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Glass Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('aging')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'aging' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    AP Aging Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('batch-payment')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'batch-payment' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    Batch Payment Run ({unpaidCount})
                </button>
            </div>

            {activeTab === 'aging' ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Accounts Payable</p>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                                {formatPrice(totalOutstanding)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1.5">{agingData.length} suppliers with balances</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                                    <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Overdue AP</p>
                            </div>
                            <p className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
                                {formatPrice(totalOverdue)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Aged liability (1-90+ days)</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aging Ratio</p>
                            </div>
                            <p className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                                {totalOutstanding > 0 ? ((totalOverdue / totalOutstanding) * 100).toFixed(1) : '0.0'}%
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Percentage of liability overdue</p>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search supplier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                        />
                    </div>

                    {/* Aging Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Outstanding</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Not Yet Due</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">1–30 Days</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">31–60 Days</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">61–90 Days</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">90+ Days</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex justify-center items-center gap-2 text-slate-500">
                                                    <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                                                    <span className="font-bold text-xs uppercase tracking-wider">Loading aging ledger...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredAging.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                                    <FileText className="w-12 h-12 opacity-30" />
                                                    <p className="font-black text-sm uppercase tracking-widest text-slate-400">No outstanding AP</p>
                                                    <p className="text-xs text-slate-500 font-medium">All supplier balances are paid and settled</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAging.map((row) => (
                                            <tr key={row.supplierId} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{row.supplierName}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{row.email || row.phone || 'No contact'}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-black text-slate-900 dark:text-white text-sm font-mono">
                                                        {formatPrice(row.totalOutstanding)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center"><AgingBadge days="Current" amount={row.aging.current} /></td>
                                                <td className="px-6 py-4 text-center"><AgingBadge days="1-30" amount={row.aging['1-30']} /></td>
                                                <td className="px-6 py-4 text-center"><AgingBadge days="31-60" amount={row.aging['31-60']} /></td>
                                                <td className="px-6 py-4 text-center"><AgingBadge days="61-90" amount={row.aging['61-90']} /></td>
                                                <td className="px-6 py-4 text-center"><AgingBadge days="90+" amount={row.aging['90+']} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Selectable Invoices List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search invoice or vendor..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                                />
                            </div>
                            {unpaidInvoices.length > 0 && (
                                <button
                                    onClick={handleSelectAllInvoices}
                                    className="text-brand-600 hover:text-brand-700 text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    {selectedInvoiceIds.length === unpaidInvoices.length ? 'Deselect All' : 'Select All Invoices'}
                                </button>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 w-12"></th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Invoice Ref</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Due Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Outstanding</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Match Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {loading && unpaidInvoices.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" />
                                                </td>
                                            </tr>
                                        ) : filteredInvoices.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium">
                                                    No outstanding invoices to pay.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredInvoices.map((inv) => {
                                                const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount || 0);
                                                const isSelected = selectedInvoiceIds.includes(inv.id);
                                                const isMatched = inv.matchStatus === 'MATCHED';
                                                
                                                return (
                                                    <tr 
                                                        key={inv.id} 
                                                        className={`hover:bg-slate-50/30 dark:hover:bg-slate-700/10 cursor-pointer transition-colors ${isSelected ? 'bg-brand-50/30 dark:bg-brand-950/10' : ''}`}
                                                        onClick={() => handleSelectInvoice(inv.id)}
                                                    >
                                                        <td className="px-6 py-4 text-center">
                                                            <button type="button" className="text-slate-400 hover:text-brand-600">
                                                                {isSelected ? (
                                                                    <CheckSquare className="w-5 h-5 text-brand-600" />
                                                                ) : (
                                                                    <Square className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 font-black text-slate-900 dark:text-white text-sm">
                                                            {inv.invoiceNumber}
                                                            <span className="block text-[9px] text-slate-400 font-medium mt-0.5">Bill Date: {new Date(inv.invoiceDate).toLocaleDateString()}</span>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm">
                                                            {inv.supplier?.name}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                                                            {new Date(inv.dueDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white font-mono text-sm">
                                                            {formatPrice(outstanding)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isMatched ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'}`}>
                                                                {inv.matchStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Batch Actions Form */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-lg">Payment Run Config</h3>
                                <p className="text-xs text-slate-400 font-semibold mt-1">Pay selected bills in bulk and post GL movements</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold">Selected Bills:</span>
                                    <span className="font-black text-slate-900 dark:text-white font-mono">{selectedInvoiceIds.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold">Total Payment Run:</span>
                                    <span className="font-black text-brand-600 dark:text-brand-400 font-mono text-base">
                                        {formatPrice(
                                            unpaidInvoices
                                                .filter(inv => selectedInvoiceIds.includes(inv.id))
                                                .reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount || 0)), 0)
                                        )}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleBatchPaymentRun} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-sm transition-all"
                                    >
                                        <option>Bank Transfer</option>
                                        <option>Cash</option>
                                        <option>BKash / Mobile</option>
                                        <option>Cheque</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Consolidated Txn ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm transition-all text-slate-900 dark:text-white"
                                        placeholder="e.g. BT-98127391"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Run Notes / Remarks</label>
                                    <textarea
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm transition-all resize-none text-slate-900 dark:text-white"
                                        placeholder="e.g. End of month payment batch run..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processingPayment || selectedInvoiceIds.length === 0}
                                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
                                >
                                    {processingPayment ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Executing...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Execute Payment Run
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Payment Run Result Receipt */}
                        {paymentRunResult && (
                            <div className="bg-emerald-50 border border-emerald-100 dark:border-emerald-950/20 dark:bg-emerald-950/10 rounded-3xl p-6 space-y-4">
                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-black text-xs uppercase tracking-widest">Run Execution Receipt</span>
                                </div>
                                <div className="text-xs space-y-1 font-semibold text-emerald-700 dark:text-emerald-300">
                                    <p>✓ Processed: <span className="font-bold">{paymentRunResult.processedCount} invoices paid in full</span></p>
                                    {paymentRunResult.failedCount > 0 && (
                                        <p className="text-rose-600 dark:text-rose-400">✗ Failed: {paymentRunResult.failedCount} invoice executions rejected</p>
                                    )}
                                </div>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2 border-t border-emerald-100 dark:border-emerald-950/20">
                                    {paymentRunResult.payments?.map((p: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-[10px] font-mono text-emerald-800 dark:text-emerald-400">
                                            <span>Invoice #{p.invoiceNumber}</span>
                                            <span>+{formatPrice(p.amountPaid)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
