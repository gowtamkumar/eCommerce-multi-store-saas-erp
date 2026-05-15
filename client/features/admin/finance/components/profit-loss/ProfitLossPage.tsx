"use client";
import { getProfitAndLoss } from "@/services/accounting";
import { motion } from "framer-motion";
import {
    TrendingUp, TrendingDown, DollarSign, Package, BarChart3,
    ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, PieChart
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface PLData {
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
}

function fmt(v: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v || 0);
}

export function ProfitLossPage() {
    const [data, setData] = useState<PLData | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getProfitAndLoss();
            setData(res?.data || null);
        } catch { toast.error("Failed to load P&L data"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
    );

    const grossMargin = data ? ((data.grossProfit / (data.revenue || 1)) * 100).toFixed(1) : "0.0";
    const netMargin = data ? ((data.netProfit / (data.revenue || 1)) * 100).toFixed(1) : "0.0";
    const isProfitable = (data?.netProfit || 0) >= 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-violet-600" /> Profit &amp; Loss
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Real-time income statement powered by FIFO inventory costing.
                    </p>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: "Total Revenue", value: fmt(data?.revenue || 0), icon: DollarSign, color: "blue", up: true, sub: "Gross sales income" },
                    { label: "Cost of Goods Sold", value: fmt(data?.costOfGoodsSold || 0), icon: Package, color: "amber", up: false, sub: `${((data?.costOfGoodsSold || 0) / (data?.revenue || 1) * 100).toFixed(1)}% of revenue` },
                    { label: "Gross Profit", value: fmt(data?.grossProfit || 0), icon: TrendingUp, color: "emerald", up: (data?.grossProfit || 0) >= 0, sub: `${grossMargin}% gross margin` },
                    { label: "Net Profit", value: fmt(data?.netProfit || 0), icon: isProfitable ? TrendingUp : TrendingDown, color: isProfitable ? "violet" : "rose", up: isProfitable, sub: `${netMargin}% net margin` },
                ].map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-900/20`}>
                                <card.icon className={`w-5 h-5 text-${card.color}-600`} />
                            </div>
                            {card.up ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{card.value}</p>
                        <p className="text-xs text-slate-400">{card.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Income Statement Waterfall */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-violet-600" /> Income Statement
                </h2>
                <div className="space-y-5">
                    {[
                        { label: "Revenue", value: data?.revenue || 0, bar: "bg-blue-500", text: "text-blue-600", sign: "+", bold: false },
                        { label: "Cost of Goods Sold (COGS)", value: data?.costOfGoodsSold || 0, bar: "bg-amber-400", text: "text-amber-600", sign: "−", bold: false },
                        { label: "= Gross Profit", value: data?.grossProfit || 0, bar: "bg-emerald-500", text: "text-emerald-600", sign: "=", bold: true },
                        { label: "Operating Expenses", value: data?.operatingExpenses || 0, bar: "bg-rose-400", text: "text-rose-600", sign: "−", bold: false },
                        { label: "= Net Profit", value: data?.netProfit || 0, bar: isProfitable ? "bg-violet-600" : "bg-rose-600", text: isProfitable ? "text-violet-700" : "text-rose-700", sign: "=", bold: true },
                    ].map((row) => {
                        const pct = Math.min(Math.abs((row.value / (data?.revenue || 1))) * 100, 100);
                        return (
                            <div key={row.label} className={row.bold ? "pt-4 mt-2 border-t border-slate-100 dark:border-slate-800" : ""}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 text-slate-400 font-black text-sm">{row.sign}</span>
                                        <span className={`text-sm ${row.bold ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-600 dark:text-slate-300"}`}>{row.label}</span>
                                    </div>
                                    <span className={`text-sm font-black ${row.text} dark:opacity-90`}>{fmt(row.value)}</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-7">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.9, ease: "easeOut" }}
                                        className={`h-full ${row.bar} rounded-full`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Box */}
                <div className={`mt-8 p-5 rounded-2xl border-2 ${isProfitable ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800"} flex items-center justify-between`}>
                    <div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Bottom Line</p>
                        <p className={`text-3xl font-black mt-1 ${isProfitable ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>{fmt(data?.netProfit || 0)}</p>
                        <p className="text-xs text-slate-400 mt-1">{isProfitable ? "✅ Profitable" : "⚠️ Operating at a loss"} — {netMargin}% net margin</p>
                    </div>
                    {isProfitable ? <TrendingUp className="w-12 h-12 text-emerald-400 opacity-50" /> : <TrendingDown className="w-12 h-12 text-rose-400 opacity-50" />}
                </div>
            </div>
        </div>
    );
}
