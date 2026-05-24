'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, Package, BarChart3,
    ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import { getProfitAndLoss } from '@/services/accounting';
import toast from 'react-hot-toast';
import { useSettings } from '@/hooks/SettingsContext';

interface AccountBreakdown {
    code: string;
    name: string;
    category: string;
    balance: number;
}

interface PLData {
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    revenueBreakdown: AccountBreakdown[];
    cogsBreakdown: AccountBreakdown[];
    operatingExpBreakdown: AccountBreakdown[];
}

export function ProfitLossPage() {
    const { formatPrice } = useSettings();
    const [data, setData] = useState<PLData | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Detailed breakdown expansions
    const [expandRevenue, setExpandRevenue] = useState(false);
    const [expandCogs, setExpandCogs] = useState(false);
    const [expandExpenses, setExpandExpenses] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await getProfitAndLoss(params);
            if (res.success) {
                setData(res.data || null);
            } else {
                toast.error(res.message || 'Failed to generate financial statement');
            }
        } catch {
            toast.error('Failed to connect to the reporting engine');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        load();
    }, [startDate, endDate]);

    // Quick range helpers
    const setPresetRange = (preset: 'month' | 'quarter' | 'year' | 'all') => {
        const now = new Date();
        let start = new Date();
        if (preset === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (preset === 'quarter') {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), currentQuarter * 3, 1);
        } else if (preset === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
        } else {
            setStartDate('');
            setEndDate('');
            return;
        }
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
    };

    const grossMargin = data ? ((data.grossProfit / (data.revenue || 1)) * 100).toFixed(1) : "0.0";
    const netMargin = data ? ((data.netProfit / (data.revenue || 1)) * 100).toFixed(1) : "0.0";
    const isProfitable = (data?.netProfit || 0) >= 0;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-indigo-600" /> Profit &amp; Loss
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                        General Ledger backed income statement with real-time transactional double-entry tracking
                    </p>
                </div>
                <button
                    onClick={load}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-xs font-black uppercase tracking-widest"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Scoping Filters Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Range Presets:</span>
                    {['month', 'quarter', 'year', 'all'].map((preset) => (
                        <button
                            key={preset}
                            onClick={() => setPresetRange(preset as any)}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold uppercase transition-all"
                        >
                            This {preset === 'all' ? 'All Time' : preset}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <span className="text-slate-400 text-xs font-bold">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
            ) : (
                <>
                    {/* KPI Summary Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { label: "Gross Revenues", value: formatPrice(data?.revenue || 0), icon: DollarSign, color: "indigo", up: true, sub: "Total transactional sales" },
                            { label: "Cost of Sales (COGS)", value: formatPrice(data?.costOfGoodsSold || 0), icon: Package, color: "amber", up: false, sub: `${((data?.costOfGoodsSold || 0) / (data?.revenue || 1) * 100).toFixed(1)}% sales cost ratio` },
                            { label: "Gross Profit", value: formatPrice(data?.grossProfit || 0), icon: TrendingUp, color: "emerald", up: (data?.grossProfit || 0) >= 0, sub: `${grossMargin}% gross margin` },
                            { label: "Net Earnings", value: formatPrice(data?.netProfit || 0), icon: isProfitable ? TrendingUp : TrendingDown, color: isProfitable ? "violet" : "rose", up: isProfitable, sub: `${netMargin}% bottom-line margin` },
                        ].map((card, i) => (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-950/20`}>
                                        <card.icon className={`w-5 h-5 text-${card.color}-600 dark:text-${card.color}-400`} />
                                    </div>
                                    {card.up ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mb-1 font-mono">{card.value}</p>
                                <p className="text-xs text-slate-400 font-semibold">{card.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Detailed Income Statement Waterfall */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-600" /> Multi-Step Income Statement
                        </h2>

                        <div className="space-y-4">
                            {/* REVENUE ROW */}
                            <div className="space-y-2">
                                <div 
                                    onClick={() => setExpandRevenue(!expandRevenue)}
                                    className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 px-2 rounded-xl transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 text-slate-400 font-black text-sm">+</span>
                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">Total Operating Revenues</span>
                                        {expandRevenue ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    <span className="text-sm font-black text-indigo-600 font-mono">{formatPrice(data?.revenue || 0)}</span>
                                </div>
                                
                                <AnimatePresence>
                                    {expandRevenue && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-8 space-y-1 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-50 dark:border-slate-750"
                                        >
                                            {data?.revenueBreakdown?.map((acc) => (
                                                <div key={acc.code} className="flex justify-between text-xs font-semibold text-slate-500 py-1">
                                                    <span>[{acc.code}] {acc.name}</span>
                                                    <span className="font-mono">{formatPrice(acc.balance)}</span>
                                                </div>
                                            ))}
                                            {(!data?.revenueBreakdown || data.revenueBreakdown.length === 0) && (
                                                <p className="text-xs text-slate-400 py-1">No transaction records found for Revenue accounts.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* COGS ROW */}
                            <div className="space-y-2">
                                <div 
                                    onClick={() => setExpandCogs(!expandCogs)}
                                    className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 px-2 rounded-xl transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 text-slate-400 font-black text-sm">−</span>
                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">Cost of Goods Sold (COGS)</span>
                                        {expandCogs ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    <span className="text-sm font-black text-amber-600 font-mono">{formatPrice(data?.costOfGoodsSold || 0)}</span>
                                </div>

                                <AnimatePresence>
                                    {expandCogs && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-8 space-y-1 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-50 dark:border-slate-750"
                                        >
                                            {data?.cogsBreakdown?.map((acc) => (
                                                <div key={acc.code} className="flex justify-between text-xs font-semibold text-slate-500 py-1">
                                                    <span>[{acc.code}] {acc.name}</span>
                                                    <span className="font-mono">{formatPrice(acc.balance)}</span>
                                                </div>
                                            ))}
                                            {(!data?.cogsBreakdown || data.cogsBreakdown.length === 0) && (
                                                <p className="text-xs text-slate-400 py-1">No transaction records found for Cost of Goods Sold accounts.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* GROSS PROFIT ROW */}
                            <div className="flex justify-between items-center py-4 bg-slate-50 dark:bg-slate-900 px-4 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-slate-400 font-black text-sm">=</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Gross Profit</span>
                                </div>
                                <span className="text-base font-black text-emerald-600 font-mono">{formatPrice(data?.grossProfit || 0)}</span>
                            </div>

                            {/* OPERATING EXPENSES ROW */}
                            <div className="space-y-2">
                                <div 
                                    onClick={() => setExpandExpenses(!expandExpenses)}
                                    className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 px-2 rounded-xl transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 text-slate-400 font-black text-sm">−</span>
                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">Operating &amp; Admin Expenses</span>
                                        {expandExpenses ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    <span className="text-sm font-black text-rose-600 font-mono">{formatPrice(data?.operatingExpenses || 0)}</span>
                                </div>

                                <AnimatePresence>
                                    {expandExpenses && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-8 space-y-1 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-50 dark:border-slate-750"
                                        >
                                            {data?.operatingExpBreakdown?.map((acc) => (
                                                <div key={acc.code} className="flex justify-between text-xs font-semibold text-slate-500 py-1">
                                                    <span>[{acc.code}] {acc.name}</span>
                                                    <span className="font-mono">{formatPrice(acc.balance)}</span>
                                                </div>
                                            ))}
                                            {(!data?.operatingExpBreakdown || data.operatingExpBreakdown.length === 0) && (
                                                <p className="text-xs text-slate-400 py-1">No transaction records found for Operating Expense accounts.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* NET INCOME ROW */}
                            <div className={`p-6 rounded-[2rem] border-2 mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isProfitable ? "bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-950/20" : "bg-rose-50/30 border-rose-100 dark:bg-rose-950/10 dark:border-rose-950/20"}`}>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Income / Bottom Line</p>
                                    <p className={`text-3xl font-black mt-1 font-mono ${isProfitable ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                                        {formatPrice(data?.netProfit || 0)}
                                    </p>
                                    <p className="text-xs text-slate-400 font-semibold mt-1">
                                        {isProfitable ? "✅ Operating profitably" : "⚠️ Operating at a net financial loss"} — {netMargin}% net profit margin
                                    </p>
                                </div>
                                {isProfitable ? (
                                    <TrendingUp className="w-10 h-10 text-emerald-500 opacity-60" />
                                ) : (
                                    <TrendingDown className="w-10 h-10 text-rose-500 opacity-60" />
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
