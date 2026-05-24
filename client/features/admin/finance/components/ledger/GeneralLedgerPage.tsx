'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, Search, RefreshCw, Trash2, ArrowRightLeft,
    Loader2, CheckCircle2, AlertTriangle, X, ChevronDown, ChevronUp,
    Filter, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, FileText, Scale
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getJournalEntries, createJournalEntry, reverseJournalEntry, getAccounts } from '@/services/accounting';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';

interface LedgerEntry {
    id: string;
    createdAt: string;
    type: string;
    quantity: number;
    unitCost: number;
    cogsAmount: number;
    balanceAfter: number;
    remainingQuantity: number;
    referenceType: string;
    referenceId: string;
    remarks: string;
    product?: { name: string; images?: string[] };
    warehouse?: { name: string };
    user?: { name: string };
}

interface GLJournalLine {
    id: string;
    side: 'DEBIT' | 'CREDIT';
    amount: number;
    balanceAfter: number;
    account: {
        code: string;
        name: string;
        type: string;
    };
}

interface GLJournalEntry {
    id: string;
    date: string;
    type: string;
    description: string;
    referenceType: string;
    referenceId: string;
    totalAmount: number;
    isReversal: boolean;
    reversedJournalEntryId: string;
    lines: GLJournalLine[];
}

interface FormLine {
    accountCode: string;
    side: 'DEBIT' | 'CREDIT';
    amount: string;
}

const INV_TYPE_COLORS: Record<string, string> = {
    PURCHASE: "emerald",
    SALE: "blue",
    RETURN: "violet",
    SALES_RETURN: "violet",
    ADJUSTMENT: "amber",
    TRANSFER_IN: "cyan",
    TRANSFER_OUT: "orange",
    INITIAL_BALANCE: "slate",
};

const INV_TYPE_LABELS: Record<string, string> = {
    PURCHASE: "Purchase",
    SALE: "Sale",
    RETURN: "Return",
    SALES_RETURN: "Sales Return",
    ADJUSTMENT: "Adjustment",
    TRANSFER_IN: "Transfer In",
    TRANSFER_OUT: "Transfer Out",
    INITIAL_BALANCE: "Opening Balance",
};

export function GeneralLedgerPage() {
    const { formatPrice } = useSettings();
    const [activeTab, setActiveTab] = useState<'double-entry' | 'inventory'>('double-entry');
    
    // Chart of Accounts for combo box
    const [coa, setCoa] = useState<any[]>([]);

    // Financial GL Entries state
    const [glEntries, setGlEntries] = useState<GLJournalEntry[]>([]);
    const [glLoading, setGlLoading] = useState(true);
    const [glSearch, setGlSearch] = useState('');
    const [expandedJournals, setExpandedJournals] = useState<string[]>([]);
    
    // Inventory Ledger state (original features)
    const [invEntries, setInvEntries] = useState<LedgerEntry[]>([]);
    const [invTotal, setInvTotal] = useState(0);
    const [invPage, setInvPage] = useState(1);
    const [invSearch, setInvSearch] = useState("");
    const [invTypeFilter, setInvTypeFilter] = useState("");
    const [invLoading, setInvLoading] = useState(true);
    const INV_LIMIT = 20;

    // Post modal states
    const [postOpen, setPostOpen] = useState(false);
    const [journalType, setJournalType] = useState('GENERAL');
    const [description, setDescription] = useState('');
    const [journalDate, setJournalDate] = useState('');
    const [refType, setRefType] = useState('');
    const [refId, setRefId] = useState('');
    const [lines, setLines] = useState<FormLine[]>([
        { accountCode: '', side: 'DEBIT', amount: '' },
        { accountCode: '', side: 'CREDIT', amount: '' }
    ]);
    const [posting, setPosting] = useState(false);

    const fetchCoa = async () => {
        try {
            const res = await getAccounts();
            if (res.success) setCoa(res.data || []);
        } catch {}
    };

    const loadGLEntries = async () => {
        setGlLoading(true);
        try {
            const res = await getJournalEntries();
            if (res.success) setGlEntries(res.data || []);
        } catch {
            toast.error('Failed to load journal entries');
        } finally {
            setGlLoading(false);
        }
    };

    const loadInvEntries = useCallback(async () => {
        setInvLoading(true);
        try {
            const params = new URLSearchParams({ page: String(invPage), limit: String(INV_LIMIT) });
            if (invSearch) params.set("q", invSearch);
            if (invTypeFilter) params.set("type", invTypeFilter);
            const res = await fetchAPI(`/inventory-ledger?${params.toString()}`);
            setInvEntries(res?.data?.items || []);
            setInvTotal(res?.data?.total || 0);
        } catch {
            toast.error("Failed to load inventory movements");
        } finally { setInvLoading(false); }
    }, [invPage, invSearch, invTypeFilter]);

    useEffect(() => {
        fetchCoa();
    }, []);

    useEffect(() => {
        if (activeTab === 'double-entry') {
            loadGLEntries();
        } else {
            loadInvEntries();
        }
    }, [activeTab, loadInvEntries]);

    // Expand/Collapse Journal detail rows
    const toggleExpand = (id: string) => {
        setExpandedJournals(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Calculate Balanced Double-Entry totals
    const formTotals = useMemo(() => {
        let debits = 0;
        let credits = 0;
        lines.forEach(l => {
            const val = parseFloat(l.amount) || 0;
            if (l.side === 'DEBIT') debits += val;
            else credits += val;
        });
        return {
            debits,
            credits,
            difference: Math.abs(debits - credits),
            isBalanced: Math.abs(debits - credits) < 0.01
        };
    }, [lines]);

    const handleAddLine = () => {
        setLines([...lines, { accountCode: '', side: 'DEBIT', amount: '' }]);
    };

    const handleRemoveLine = (idx: number) => {
        if (lines.length <= 2) {
            toast.error('A journal entry must contain at least 2 lines');
            return;
        }
        setLines(lines.filter((_, i) => i !== idx));
    };

    const handleLineChange = (idx: number, field: keyof FormLine, value: string) => {
        const next = [...lines];
        next[idx][field] = value as any;
        setLines(next);
    };

    const handlePostJournal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTotals.isBalanced || formTotals.debits === 0) {
            toast.error('Journal entry is unbalanced or empty');
            return;
        }
        
        // Ensure all lines have account selection
        if (lines.some(l => !l.accountCode)) {
            toast.error('Please select an account for all entry lines');
            return;
        }

        setPosting(true);
        const toastId = toast.loading('Posting journal voucher to General Ledger...');
        try {
            const payload = {
                date: journalDate || undefined,
                type: journalType,
                description,
                referenceType: refType || undefined,
                referenceId: refId || undefined,
                lines: lines.map(l => ({
                    accountCode: l.accountCode,
                    side: l.side,
                    amount: parseFloat(l.amount)
                }))
            };

            const res = await createJournalEntry(payload);
            if (res.success) {
                toast.success('Journal entry posted successfully!', { id: toastId });
                setPostOpen(false);
                setDescription('');
                setJournalDate('');
                setRefType('');
                setRefId('');
                setLines([
                    { accountCode: '', side: 'DEBIT', amount: '' },
                    { accountCode: '', side: 'CREDIT', amount: '' }
                ]);
                loadGLEntries();
            } else {
                toast.error(res.message || 'Post execution failed', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Error posting journal entry', { id: toastId });
        } finally {
            setPosting(false);
        }
    };

    const handleReverseJournal = async (id: string) => {
        if (!confirm('Are you sure you want to reverse this journal entry? This will generate a correcting counter-journal.')) return;
        const toastId = toast.loading('Reversing journal...');
        try {
            const res = await reverseJournalEntry(id);
            if (res.success) {
                toast.success('Journal entry reversed successfully!', { id: toastId });
                loadGLEntries();
            } else {
                toast.error(res.message || 'Reversal failed', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Error reversing journal entry', { id: toastId });
        }
    };

    // Filtered Financial entries
    const filteredGlEntries = glEntries.filter(e =>
        e.description.toLowerCase().includes(glSearch.toLowerCase()) ||
        e.type.toLowerCase().includes(glSearch.toLowerCase()) ||
        e.referenceId?.toLowerCase().includes(glSearch.toLowerCase()) ||
        e.lines.some(l => l.account.name.toLowerCase().includes(glSearch.toLowerCase()) || l.account.code.includes(glSearch))
    );

    const totalInvPages = Math.ceil(invTotal / INV_LIMIT);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-indigo-600" /> General Ledger Audit
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                        Dual inventory movements ledger and immutable double-entry financial journals
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {activeTab === 'double-entry' && (
                        <button
                            onClick={() => setPostOpen(true)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-755 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Post Entry
                        </button>
                    )}
                    <button
                        onClick={activeTab === 'double-entry' ? loadGLEntries : loadInvEntries}
                        disabled={glLoading || invLoading}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${(glLoading || invLoading) ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('double-entry')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'double-entry' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    Financial Journals
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'inventory' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    Inventory Movements
                </button>
            </div>

            {activeTab === 'double-entry' ? (
                <>
                    {/* Search bar */}
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search description, reference, or accounts..."
                            value={glSearch}
                            onChange={(e) => setGlSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                        />
                    </div>

                    {/* Financial Journals Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 w-12"></th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Journal Type</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reference</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Debit/Credit Total</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                                        <th className="px-6 py-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {glLoading ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" />
                                            </td>
                                        </tr>
                                    ) : filteredGlEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-16 text-center text-slate-400 font-semibold">
                                                No financial journal transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredGlEntries.map((journal) => {
                                            const isExpanded = expandedJournals.includes(journal.id);
                                            return (
                                                <>
                                                    <tr 
                                                        key={journal.id} 
                                                        onClick={() => toggleExpand(journal.id)}
                                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 cursor-pointer transition-colors"
                                                    >
                                                        <td className="px-6 py-4 text-center">
                                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                            {new Date(journal.date || (journal as any).createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                                                                {journal.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                            {journal.description}
                                                            {journal.isReversal && (
                                                                <span className="ml-2 px-2 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 rounded text-[9px] font-bold">REVERSAL</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                                                            {journal.referenceType ? `${journal.referenceType}: ${journal.referenceId}` : '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-black text-slate-950 dark:text-white font-mono text-sm">
                                                            {formatPrice(journal.totalAmount)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${journal.isReversal ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                POSTED
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {!journal.isReversal && !journal.reversedJournalEntryId && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleReverseJournal(journal.id);
                                                                    }}
                                                                    title="Post reversing entry to void transaction"
                                                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                                                >
                                                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>

                                                    {/* Expansion details displaying journal lines */}
                                                    {isExpanded && (
                                                        <tr className="bg-slate-50/50 dark:bg-slate-900/10">
                                                            <td colSpan={8} className="px-8 py-4 border-l-4 border-indigo-500">
                                                                <div className="space-y-2">
                                                                    <div className="grid grid-cols-12 text-[10px] font-black uppercase text-slate-400 tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                                                                        <div className="col-span-2">Account Code</div>
                                                                        <div className="col-span-5">Account Name</div>
                                                                        <div className="col-span-2 text-right">Debits</div>
                                                                        <div className="col-span-2 text-right">Credits</div>
                                                                        <div className="col-span-1 text-right">Balance After</div>
                                                                    </div>
                                                                    {journal.lines?.map((line) => (
                                                                        <div key={line.id} className="grid grid-cols-12 text-xs font-semibold text-slate-600 dark:text-slate-300 py-1.5 border-b border-slate-100/50 dark:border-slate-850">
                                                                            <div className="col-span-2 font-mono">{line.account?.code}</div>
                                                                            <div className="col-span-5">{line.account?.name}</div>
                                                                            <div className="col-span-2 text-right font-mono text-emerald-600">
                                                                                {line.side === 'DEBIT' ? formatPrice(line.amount) : ''}
                                                                            </div>
                                                                            <div className="col-span-2 text-right font-mono text-indigo-600">
                                                                                {line.side === 'CREDIT' ? formatPrice(line.amount) : ''}
                                                                            </div>
                                                                            <div className="col-span-1 text-right font-mono text-slate-400">
                                                                                {formatPrice(line.balanceAfter)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Filters (Original Inventory Ledger logic) */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={invSearch}
                                onChange={(e) => { setInvSearch(e.target.value); setInvPage(1); }}
                                placeholder="Search by product or reference..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={invTypeFilter}
                                onChange={(e) => { setInvTypeFilter(e.target.value); setInvPage(1); }}
                                className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none transition-all text-slate-700 dark:text-slate-200"
                            >
                                <option value="">All Types</option>
                                {Object.entries(INV_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Inventory Table (Original layout) */}
                    <div className="bg-white dark:bg-slate-805 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                        {invLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                            </div>
                        ) : invEntries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                                <p className="font-bold">No inventory movements found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            {["Date", "Product", "Type", "Qty", "Unit Cost", "COGS", "Balance", "Warehouse", "Reference"].map(h => (
                                                <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invEntries.map((entry, i) => {
                                            const color = INV_TYPE_COLORS[entry.type] || "slate";
                                            const isIn = entry.quantity > 0;
                                            return (
                                                <tr
                                                    key={entry.id}
                                                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                                >
                                                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                                                                {entry.product?.name || "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-${color}-50 text-${color}-700 dark:bg-${color}-900/20 dark:text-${color}-400`}>
                                                            {isIn ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                                                            {INV_TYPE_LABELS[entry.type] || entry.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`text-sm font-black ${isIn ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                            {isIn ? "+" : ""}{entry.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                        {entry.unitCost ? formatPrice(entry.unitCost) : "—"}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-amber-600 dark:text-amber-400 font-semibold">
                                                        {entry.cogsAmount ? formatPrice(entry.cogsAmount) : "—"}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
                                                        {entry.balanceAfter}
                                                    </td>
                                                    <td className="px-5 py-4 text-xs text-slate-400">
                                                        {entry.warehouse?.name || "—"}
                                                    </td>
                                                    <td className="px-5 py-4 text-xs text-slate-400 font-mono truncate max-w-[100px]">
                                                        {entry.referenceId || "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Inventory Pagination */}
                        {totalInvPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-400">{invTotal} movements total</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setInvPage(p => Math.max(1, p - 1))} disabled={invPage === 1}
                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition-all">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 px-2">
                                        {invPage} / {totalInvPages}
                                    </span>
                                    <button onClick={() => setInvPage(p => Math.min(totalInvPages, p + 1))} disabled={invPage === totalInvPages}
                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Post Journal Voucher Modal */}
            <AnimatePresence>
                {postOpen && (
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
                                    onClick={() => setPostOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handlePostJournal} className="p-8 space-y-6">
                                {/* Header Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Journal Type</label>
                                        <select
                                            value={journalType}
                                            onChange={(e) => setJournalType(e.target.value)}
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
                                            onChange={(e) => setJournalDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Transaction Narration</label>
                                        <input
                                            type="text"
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
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
                                            onChange={(e) => setRefType(e.target.value)}
                                            placeholder="e.g. INVOICE, PO"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ref Document ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={refId}
                                            onChange={(e) => setRefId(e.target.value)}
                                            placeholder="e.g. INV-908123"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-semibold text-sm text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Ledger Lines Grid */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pl-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Lines</span>
                                        <button
                                            type="button"
                                            onClick={handleAddLine}
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
                                                    onChange={(e) => handleLineChange(idx, 'accountCode', e.target.value)}
                                                    className="flex-[3] px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-xs text-slate-900 dark:text-white"
                                                >
                                                    <option value="">Select Account...</option>
                                                    {coa.map(acc => (
                                                        <option key={acc.id} value={acc.code}>
                                                            [{acc.code}] {acc.name} ({acc.type})
                                                        </option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={line.side}
                                                    onChange={(e) => handleLineChange(idx, 'side', e.target.value)}
                                                    className="flex-[1] px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-bold text-xs text-slate-900 dark:text-white"
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
                                                    onChange={(e) => handleLineChange(idx, 'amount', e.target.value)}
                                                    className="flex-[2] px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 outline-none font-black text-xs font-mono text-slate-900 dark:text-white"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLine(idx)}
                                                    className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-955/20 hover:bg-rose-600 hover:text-white rounded-2xl transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Balanced Validation Summary Card */}
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

                                {/* Form Action Buttons */}
                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPostOpen(false)}
                                        className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={posting || !formTotals.isBalanced || formTotals.debits === 0}
                                        className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-755 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2"
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
        </div>
    );
}
