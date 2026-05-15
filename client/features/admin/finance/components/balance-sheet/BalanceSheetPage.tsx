"use client";
import { getBalanceSheet } from "@/services/accounting";
import { motion } from "framer-motion";
import { Scale, TrendingUp, TrendingDown, DollarSign, Loader2, RefreshCw, ChevronRight, AlertCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface BSData {
    assets: { name: string; balance: number }[];
    totalAssets: number;
    liabilities: { name: string; balance: number }[];
    totalLiabilities: number;
    equity: { name: string; balance: number }[];
    totalEquity: number;
}

function fmt(v: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v || 0);
}

const SECTIONS = [
    { key: "assets" as const, totalKey: "totalAssets" as const, title: "Assets", icon: TrendingUp, color: "emerald", desc: "Everything the business owns" },
    { key: "liabilities" as const, totalKey: "totalLiabilities" as const, title: "Liabilities", icon: TrendingDown, color: "rose", desc: "Everything the business owes" },
    { key: "equity" as const, totalKey: "totalEquity" as const, title: "Equity", icon: DollarSign, color: "violet", desc: "Owner's stake in the business" },
];

export function BalanceSheetPage() {
    const [data, setData] = useState<BSData | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getBalanceSheet();
            setData(res?.data || null);
        } catch { toast.error("Failed to load Balance Sheet"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
    );

    const isBalanced = data ? Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01 : false;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Scale className="w-6 h-6 text-violet-600" /> Balance Sheet
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Snapshot of Assets, Liabilities, and Equity at this point in time.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {data && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${isBalanced ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"}`}>
                            {isBalanced ? "✓ Balanced" : <><AlertCircle className="w-3 h-3" /> Out of Balance</>}
                        </div>
                    )}
                    <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* Accounting Equation Banner */}
            <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl p-6 text-white">
                <p className="text-sm font-bold opacity-70 mb-3 uppercase tracking-wider">Accounting Equation</p>
                <div className="flex flex-wrap items-center gap-3 text-lg font-black">
                    <span className="bg-white/20 px-4 py-2 rounded-2xl">{fmt(data?.totalAssets || 0)}<span className="block text-xs font-normal opacity-70 mt-0.5">Total Assets</span></span>
                    <span className="opacity-60 text-2xl">=</span>
                    <span className="bg-white/20 px-4 py-2 rounded-2xl">{fmt(data?.totalLiabilities || 0)}<span className="block text-xs font-normal opacity-70 mt-0.5">Total Liabilities</span></span>
                    <span className="opacity-60 text-2xl">+</span>
                    <span className="bg-white/20 px-4 py-2 rounded-2xl">{fmt(data?.totalEquity || 0)}<span className="block text-xs font-normal opacity-70 mt-0.5">Total Equity</span></span>
                </div>
            </div>

            {/* Three Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {SECTIONS.map((sec, si) => {
                    const items = data?.[sec.key] || [];
                    const total = data?.[sec.totalKey] || 0;
                    return (
                        <motion.div key={sec.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                            {/* Section Header */}
                            <div className={`p-5 border-b border-slate-100 dark:border-slate-800 bg-${sec.color}-50/50 dark:bg-${sec.color}-900/10`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 bg-${sec.color}-100 dark:bg-${sec.color}-900/30 rounded-2xl`}>
                                        <sec.icon className={`w-5 h-5 text-${sec.color}-600`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{sec.title}</h3>
                                        <p className="text-xs text-slate-400">{sec.desc}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="p-5 space-y-2">
                                {items.length === 0 && (
                                    <p className="text-sm text-slate-400 text-center py-6">No accounts yet</p>
                                )}
                                {items.map((item, i) => (
                                    <motion.div key={item.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.1 + i * 0.05 }}
                                        className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                                            <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                                        </div>
                                        <span className={`text-sm font-bold text-${sec.color}-600 dark:text-${sec.color}-400`}>{fmt(item.balance)}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Total Footer */}
                            <div className={`mx-5 mb-5 p-4 bg-${sec.color}-50 dark:bg-${sec.color}-900/20 rounded-2xl flex items-center justify-between`}>
                                <span className="text-sm font-black text-slate-700 dark:text-slate-200">Total {sec.title}</span>
                                <span className={`text-xl font-black text-${sec.color}-600`}>{fmt(total)}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
