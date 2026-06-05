'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    CreditCard,
    DollarSign,
    Download,
    Search,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    XCircle,
    TrendingUp,
    TrendingDown,
    Calendar,
    Users,
    ArrowUpRight,
    Filter
} from 'lucide-react';
import { fetchSuperAdminAPI } from '@/services/superAdminApi';
import toast from 'react-hot-toast';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    billingCycle: string;
    billingDate: string;
    transactionId?: string;
    tenant?: {
        id: string;
        storeName: string;
        subdomain: string;
    };
    subscriptionPlan?: {
        name: string;
    };
}

interface ChurnedTenant {
    id: string;
    storeName: string;
    subdomain: string;
    plan: string;
    status: string;
    subscriptionStatus: string;
    endsAt: string | null;
}

export default function BillingDashboard() {
    const [overview, setOverview] = useState({
        totalRevenue: 0,
        mrr: 0,
        arr: 0,
        failedCount: 0,
        pendingCount: 0,
        totalInvoices: 0
    });
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [churnedTenants, setChurnedTenants] = useState<ChurnedTenant[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    // Pagination & Filter States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const [overviewRes, revenueRes, churnRes] = await Promise.all([
                fetchSuperAdminAPI('/super-admin/billing/overview'),
                fetchSuperAdminAPI('/super-admin/billing/revenue-chart?months=12'),
                fetchSuperAdminAPI('/super-admin/billing/churn')
            ]);

            if (overviewRes?.success) setOverview(overviewRes.data);
            if (revenueRes?.success) setRevenueData(revenueRes.data || []);
            if (churnRes?.success) setChurnedTenants(churnRes.data || []);
        } catch (e) {
            console.error('Error fetching billing stats:', e);
            toast.error('Failed to load billing metrics');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    const loadInvoices = useCallback(async () => {
        try {
            const res = await fetchSuperAdminAPI(
                `/super-admin/billing/invoices?page=${currentPage}&limit=8&status=${statusFilter}&search=${debouncedSearch}`
            );
            if (res?.success) {
                setInvoices(res.data.invoices || []);
                setTotalPages(res.data.pagination?.totalPages || 1);
            }
        } catch (e) {
            console.error('Error fetching invoices:', e);
            toast.error('Failed to load invoices');
        }
    }, [currentPage, statusFilter, debouncedSearch]);

    // Initial and Refresh loading
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Invoice auto re-fetch on filters/page changes
    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    const handleRefreshAll = () => {
        loadData(true);
        loadInvoices();
        toast.success('Billing data refreshed');
    };

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            const link = document.createElement('a');
            link.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/super-admin/billing/invoices/export`;
            link.click();
            toast.success('CSV export started');
        } catch (e) {
            toast.error('Failed to export invoices');
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'paid':
                return (
                    <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                );
            case 'failed':
            case 'unpaid':
                return (
                    <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending
                    </span>
                );
        }
    };

    const columns: DataTableColumn<Invoice>[] = [
        {
            key: 'invoiceNumber',
            header: 'Invoice #',
            className: 'px-6 py-4.5 font-bold text-slate-800 dark:text-slate-200',
            cell: (invoice) => invoice.invoiceNumber,
        },
        {
            key: 'merchant',
            header: 'Store / Merchant',
            className: 'px-6 py-4.5',
            cell: (invoice) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {invoice.tenant?.storeName || 'Unknown Store'}
                    </span>
                    <span className="text-xs text-slate-400">{invoice.tenant?.subdomain || 'no-subdomain'}</span>
                </div>
            ),
        },
        {
            key: 'plan',
            header: 'Plan / Cycle',
            className: 'px-6 py-4.5',
            cell: (invoice) => (
                <div className="flex flex-col gap-1">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 w-fit">
                        {invoice.subscriptionPlan?.name || 'Starter'}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">{invoice.billingCycle}</span>
                </div>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            className: 'px-6 py-4.5 font-black text-slate-900 dark:text-white',
            cell: (invoice) => invoice.amount.toLocaleString('en-US', { style: 'currency', currency: invoice.currency || 'USD' }),
        },
        {
            key: 'date',
            header: 'Date',
            className: 'px-6 py-4.5 text-xs text-slate-400 font-bold',
            cell: (invoice) => new Date(invoice.billingDate).toLocaleDateString(),
        },
        {
            key: 'status',
            header: 'Status',
            className: 'px-6 py-4.5',
            cell: (invoice) => getStatusBadge(invoice.status),
        },
        {
            key: 'actions',
            header: '',
            headerClassName: 'text-right',
            className: 'px-6 py-4.5 text-right',
            cell: (invoice) => invoice.tenant?.id ? (
                <a
                    href={`/system/tenants/${invoice.tenant.id}/analytics`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs text-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                >
                    Merchant <ArrowUpRight className="w-3 h-3" />
                </a>
            ) : null,
        },
    ];

    const dataTablePagination = {
        page: currentPage,
        total: overview.totalInvoices || 0,
        totalPages: totalPages,
        onPageChange: (page: number) => setCurrentPage(page),
    };

    const dataTablePaginationSummary = (
        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hidden sm:block">
            Page {currentPage} of {totalPages}
        </span>
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading billing module...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Topbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Billing & Subscription Revenue</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Global SaaS cash flow monitoring, invoice reconciliation, and merchant churn.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefreshAll}
                        disabled={isRefreshing}
                        className="p-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-100 dark:border-slate-700/60 shadow-sm transition-all"
                        title="Refresh metrics"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
                    </button>
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-100 dark:border-slate-700/60 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all text-sm"
                    >
                        <Download className="w-4 h-4" />
                        {isExporting ? 'Exporting...' : 'Export Invoices'}
                    </button>
                </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    icon={<DollarSign className="w-6 h-6" />}
                    label="All-Time Revenue"
                    value={`$${overview.totalRevenue.toLocaleString()}`}
                    sub="Gross settled payments"
                    color="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Monthly Recurring Revenue"
                    value={`$${overview.mrr.toLocaleString()}`}
                    sub="Current Month MRR"
                    color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                />
                <StatCard
                    icon={<Activity className="w-6 h-6" />}
                    label="Annual Recurring Revenue"
                    value={`$${overview.arr.toLocaleString()}`}
                    sub="MRR Extrapolated * 12"
                    color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                />
                <StatCard
                    icon={<AlertCircle className="w-6 h-6" />}
                    label="Failed Payments"
                    value={overview.failedCount.toString()}
                    sub="Requires attention"
                    badge={overview.failedCount > 0 ? `${overview.failedCount} failed` : undefined}
                    color="text-rose-600 bg-rose-50 dark:bg-rose-900/20"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm p-6 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Revenue Growth</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Monthly revenue history</p>
                        </div>
                        <Calendar className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="h-64 flex-1 min-h-[250px]">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/40" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 'bold' }}
                                        stroke="#94a3b8"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 'bold' }}
                                        stroke="#94a3b8"
                                    />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenue"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 italic">No revenue transaction logs yet</div>
                        )}
                    </div>
                </div>

                {/* Churned Stores List */}
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm p-6 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Subscription Churn</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Expired or canceled subscriptions</p>
                        </div>
                        <Users className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 max-h-[260px] pr-2">
                        {churnedTenants.length > 0 ? (
                            churnedTenants.map((merchant) => (
                                <div key={merchant.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/50 dark:border-slate-700/30 hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{merchant.storeName}</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">{merchant.subdomain}</p>
                                        <div className="flex gap-2 items-center mt-2">
                                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">
                                                {merchant.plan}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                Ended {merchant.endsAt ? new Date(merchant.endsAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                                        {merchant.subscriptionStatus || 'expired'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 italic text-sm py-12">
                                No recent subscription churn
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Invoices List with Filters & Search */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Invoices Registry</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Historical cross-tenant invoices</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search invoice, store..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-100 dark:border-slate-700/80 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                            />
                        </div>
                        {/* Filters */}
                        <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-700/80">
                            {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${statusFilter === st ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    {st === 'ALL' ? 'All' : st === 'COMPLETED' ? 'Completed' : st === 'PENDING' ? 'Pending' : 'Failed'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DataTable
                    data={invoices}
                    columns={columns}
                    getRowKey={(invoice) => invoice.id}
                    loading={isLoading}
                    loadingLabel="Syncing billing registry..."
                    emptyLabel="No invoices matching the search criteria."
                    containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                    pagination={dataTablePagination}
                    paginationSummary={dataTablePaginationSummary}
                />
            </div>
        </div>
    );
}

// --- Sub components ---
function StatCard({ icon, label, value, sub, badge, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; badge?: string; color: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white truncate mt-0.5">{value}</p>
                {sub && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight opacity-75">{sub}</p>}
            </div>
            {badge && (
                <span className="absolute top-4 right-4 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </div>
    );
}

const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3.5 rounded-2xl shadow-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">Revenue Snapshot</p>
                <div className="flex items-center justify-between gap-4 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settled Amount:</span>
                    <p className="text-sm font-black text-emerald-400">
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};
