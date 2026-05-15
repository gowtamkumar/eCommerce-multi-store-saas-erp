"use client";

import { getProfitAndLoss, getBalanceSheet, initializeAccounting } from "@/services/accounting";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, BarChart3,
    RefreshCw, Zap, ChevronRight, ArrowUpRight, ArrowDownRight, Loader2,
    BookOpen, Scale, PieChart
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface PLData {
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
}

interface BalanceSheetData {
    assets: { name: string; balance: number }[];
    totalAssets: number;
    liabilities: { name: string; balance: number }[];
    totalLiabilities: number;
    equity: { name: string; balance: number }[];
    totalEquity: number;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value || 0);
}

function formatPercent(value: number, total: number) {
    if (!total) return "0%";
    return ((value / total) * 100).toFixed(1) + "%";
}

export function FinancialDashboard() {
    const searchParams = useSearchParams();
    const viewParam = searchParams.get("view");

    const [plData, setPlData] = useState<PLData | null>(null);
    const [bsData, setBsData] = useState<BalanceSheetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<"overview" | "balance">(
        viewParam === "balance" ? "balance" : "overview"
    );
    const [initializing, setInitializing] = useState(false);

    useEffect(() => {
        setActiveView(viewParam === "balance" ? "balance" : "overview");
    }, [viewParam]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [plRes, bsRes] = await Promise.all([getProfitAndLoss(), getBalanceSheet()]);
            setPlData(plRes?.data || null);
            setBsData(bsRes?.data || null);
        } catch {
            // If 404, COA may not be initialized yet
            setPlData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleInit = async () => {
        setInitializing(true);
        try {
            await initializeAccounting();
            toast.success("Chart of Accounts initialized!");
            await fetchData();
        } catch {
            toast.error("Initialization failed.");
        } finally {
            setInitializing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    const grossMargin = plData ? (plData.grossProfit / (plData.revenue || 1)) * 100 : 0;
    const netMargin = plData ? (plData.netProfit / (plData.revenue || 1)) * 100 : 0;
    const isProfitable = (plData?.netProfit || 0) >= 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-violet-600" />
                        Financial Engine
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Real-time P&L and Balance Sheet powered by automated double-entry accounting.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleInit}
                        disabled={initializing}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-xl text-sm font-bold hover:bg-violet-200 transition-all"
                    >
                        {initializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Initialize COA
                    </button>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
                {[
                    { key: "overview", label: "Profit & Loss", icon: TrendingUp },
                    { key: "balance", label: "Balance Sheet", icon: Scale },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveView(key as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeView === key
                                ? "bg-white dark:bg-slate-700 text-violet-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeView === "overview" ? (
                    <motion.div key="pl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[
                                {
                                    label: "Total Revenue",
                                    value: formatCurrency(plData?.revenue || 0),
                                    icon: DollarSign,
                                    color: "blue",
                                    sub: "From Sales Account",
                                    up: true,
                                },
                                {
                                    label: "Cost of Goods Sold",
                                    value: formatCurrency(plData?.costOfGoodsSold || 0),
                                    icon: Package,
                                    color: "amber",
                                    sub: formatPercent(plData?.costOfGoodsSold || 0, plData?.revenue || 1) + " of revenue",
                                    up: false,
                                },
                                {
                                    label: "Gross Profit",
                                    value: formatCurrency(plData?.grossProfit || 0),
                                    icon: TrendingUp,
                                    color: "emerald",
                                    sub: grossMargin.toFixed(1) + "% margin",
                                    up: (plData?.grossProfit || 0) >= 0,
                                },
                                {
                                    label: "Net Profit",
                                    value: formatCurrency(plData?.netProfit || 0),
                                    icon: isProfitable ? TrendingUp : TrendingDown,
                                    color: isProfitable ? "violet" : "rose",
                                    sub: netMargin.toFixed(1) + "% net margin",
                                    up: isProfitable,
                                },
                            ].map((card) => (
                                <motion.div
                                    key={card.label}
                                    whileHover={{ y: -3 }}
                                    className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-900/20`}>
                                            <card.icon className={`w-5 h-5 text-${card.color}-600`} />
                                        </div>
                                        {card.up
                                            ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                            : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{card.value}</p>
                                    <p className="text-xs text-slate-400">{card.sub}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Waterfall P&L Chart */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-violet-600" />
                                Income Statement Breakdown
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { label: "Revenue", value: plData?.revenue || 0, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", sign: "+" },
                                    { label: "Cost of Goods Sold", value: plData?.costOfGoodsSold || 0, color: "bg-amber-400", textColor: "text-amber-600 dark:text-amber-400", sign: "−" },
                                    { label: "Gross Profit", value: plData?.grossProfit || 0, color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", sign: "=", bold: true },
                                    { label: "Operating Expenses", value: plData?.operatingExpenses || 0, color: "bg-rose-400", textColor: "text-rose-600 dark:text-rose-400", sign: "−" },
                                    { label: "Net Profit", value: plData?.netProfit || 0, color: isProfitable ? "bg-violet-600" : "bg-rose-600", textColor: isProfitable ? "text-violet-600 dark:text-violet-400" : "text-rose-600 dark:text-rose-400", sign: "=", bold: true },
                                ].map((row) => {
                                    const maxVal = plData?.revenue || 1;
                                    const barWidth = Math.min(Math.abs(row.value / maxVal) * 100, 100);
                                    return (
                                        <div key={row.label} className={`${row.bold ? "mt-6 pt-6 border-t border-slate-100 dark:border-slate-800" : ""}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 flex items-center justify-center text-lg font-black text-slate-400">{row.sign}</span>
                                                    <span className={`text-sm font-${row.bold ? "black" : "semibold"} text-slate-${row.bold ? "900 dark:text-white" : "600 dark:text-slate-300"}`}>{row.label}</span>
                                                </div>
                                                <span className={`text-sm font-black ${row.textColor}`}>{formatCurrency(row.value)}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-9">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${barWidth}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className={`h-full ${row.color} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="bs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[
                            { title: "Assets", items: bsData?.assets || [], total: bsData?.totalAssets || 0, color: "emerald", icon: TrendingUp },
                            { title: "Liabilities", items: bsData?.liabilities || [], total: bsData?.totalLiabilities || 0, color: "rose", icon: TrendingDown },
                            { title: "Equity", items: bsData?.equity || [], total: bsData?.totalEquity || 0, color: "violet", icon: DollarSign },
                        ].map((section) => (
                            <div key={section.title} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`p-2.5 bg-${section.color}-50 dark:bg-${section.color}-900/20 rounded-2xl`}>
                                        <section.icon className={`w-5 h-5 text-${section.color}-600`} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{section.title}</h4>
                                </div>
                                <div className="space-y-3">
                                    {section.items.length === 0 && (
                                        <p className="text-sm text-slate-400 text-center py-4">No data yet</p>
                                    )}
                                    {section.items.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                                            </div>
                                            <span className={`text-sm font-bold text-${section.color}-600 dark:text-${section.color}-400`}>{formatCurrency(item.balance)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className={`mt-4 pt-4 border-t-2 border-${section.color}-100 dark:border-${section.color}-900/30 flex items-center justify-between`}>
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">Total {section.title}</span>
                                    <span className={`text-lg font-black text-${section.color}-600`}>{formatCurrency(section.total)}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
