'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { 
    Megaphone, Search, Download, Mail, MessageSquare, Bell,
    CheckCircle2, XCircle, AlertCircle, Calendar, Users, BarChart3,
    Tag, Percent, Activity, Sparkles, RefreshCcw
} from 'lucide-react';

// Memoized KPI Metric Card
const MetricCard = memo(({ title, value, subtext, icon: Icon, colorClass, borderClass }: any) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border ${borderClass || 'border-slate-100 dark:border-slate-800'} shadow-sm transition-all hover:shadow-md group`}>
        <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
            <div className={`p-2.5 ${colorClass} rounded-xl transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1 font-semibold">{subtext}</p>}
    </div>
));
MetricCard.displayName = 'MetricCard';

export default function MarketingReportDashboard() {
    const { formatPrice } = useSettings();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [subscribersCount, setSubscribersCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const [campaignSearch, setCampaignSearch] = useState('');
    const [couponSearch, setCouponSearch] = useState('');

    // Fetch unified marketing statistics
    const loadMarketingData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, couponsRes, subscribersRes] = await Promise.all([
                fetchAPI('/campaigns').catch(() => ({ success: false, data: [] })),
                fetchAPI('/coupons').catch(() => ({ success: false, data: { coupons: [] } })),
                fetchAPI('/subscribers?limit=1').catch(() => ({ success: false, meta: { total: 0 } }))
            ]);

            if (campaignsRes.success) {
                setCampaigns(campaignsRes.data || []);
            }
            if (couponsRes.success) {
                setCoupons(couponsRes.data?.coupons || couponsRes.data || []);
            }
            if (subscribersRes.success) {
                setSubscribersCount(subscribersRes.meta?.total || subscribersRes.total || 0);
            }
        } catch (error) {
            console.error('Failed to load marketing dashboard details', error);
            toast.error('Failed to load marketing metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMarketingData();
    }, []);

    // Campaign filters
    const filteredCampaigns = useMemo(() => {
        const query = campaignSearch.toLowerCase();
        return campaigns.filter(c => c.name.toLowerCase().includes(query));
    }, [campaigns, campaignSearch]);

    // Coupon filters
    const filteredCoupons = useMemo(() => {
        const query = couponSearch.toLowerCase();
        return coupons.filter(c => c.code.toLowerCase().includes(query));
    }, [coupons, couponSearch]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        // Campaigns
        const totalCampaigns = campaigns.length;
        const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
        const totalFailed = campaigns.reduce((sum, c) => sum + (c.failedCount || 0), 0);
        const totalReach = campaigns.reduce((sum, c) => sum + (c.totalAudience || 0), 0);
        const attempts = totalSent + totalFailed;
        const deliverySuccessRate = attempts > 0 ? (totalSent / attempts) * 100 : 100;

        // Coupons
        const totalCoupons = coupons.length;
        const activeCoupons = coupons.filter(c => c.isActive).length;
        const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

        return {
            totalCampaigns,
            totalReach,
            deliverySuccessRate,
            totalCoupons,
            activeCoupons,
            totalRedemptions
        };
    }, [campaigns, coupons]);

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'email': return <Mail className="w-3.5 h-3.5 text-blue-500" />;
            case 'sms': return <MessageSquare className="w-3.5 h-3.5 text-purple-500" />;
            case 'push': return <Bell className="w-3.5 h-3.5 text-amber-500" />;
            default: return <Megaphone className="w-3.5 h-3.5 text-slate-500" />;
        }
    };

    const getCampaignStatus = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-md">Completed</span>;
            case 'running':
                return <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider rounded-md animate-pulse">Running</span>;
            case 'scheduled':
                return <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 text-[9px] font-black uppercase tracking-wider rounded-md">Scheduled</span>;
            default:
                return <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-wider rounded-md">Draft</span>;
        }
    };

    const handleExportCSV = () => {
        try {
            let csvContent = 'TYPE,NAME/CODE,DETAILS,STATUS,REACH/LIMIT,SUCCESS/USED,FAILURES/UNUSED,SUCCESS RATE\n';
            
            // Add campaigns
            campaigns.forEach(c => {
                const total = (c.sentCount || 0) + (c.failedCount || 0);
                const rate = total > 0 ? ((c.sentCount || 0) / total) * 100 : 100;
                csvContent += `"CAMPAIGN","${c.name}","Channel: ${c.type}","${c.status}",${c.totalAudience || 0},${c.sentCount || 0},${c.failedCount || 0},"${rate.toFixed(1)}%"\n`;
            });

            // Add coupons
            coupons.forEach(c => {
                const statusStr = c.isActive ? 'Active' : 'Inactive';
                const discDetails = c.discountType === 'percentage' ? `${c.amount}% off` : `${c.amount} flat off`;
                csvContent += `"COUPON","${c.code}","${discDetails}","${statusStr}",${c.usageLimit || 'Unlimited'},${c.usedCount || 0},${c.usageLimit ? (c.usageLimit - c.usedCount) : 'N/A'},"N/A"\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `unified-marketing-performance-report.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Unified marketing report exported');
        } catch (error) {
            console.error('Failed to export unified report', error);
            toast.error('Failed to export report');
        }
    };

    return (
        <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-brand-600" />
                        Marketing Performance Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Unified marketing overview including campaign dispatch rates, coupon conversions, and subscriber audience growth.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadMarketingData}
                        className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900/80 text-slate-500 dark:text-slate-400 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleExportCSV}
                        disabled={loading || (campaigns.length === 0 && coupons.length === 0)}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl transition-all font-semibold border border-transparent disabled:opacity-50 text-sm shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export Master Report
                    </button>
                </div>
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Newsletter Audience"
                    value={subscribersCount}
                    subtext="Total active subscribers"
                    icon={Users}
                    colorClass="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                />
                <MetricCard
                    title="Campaign Dispatch"
                    value={metrics.totalCampaigns}
                    subtext={`${metrics.totalReach} total reach`}
                    icon={Megaphone}
                    colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                />
                <MetricCard
                    title="Campaign Delivery"
                    value={`${metrics.deliverySuccessRate.toFixed(1)}%`}
                    subtext="Average delivery rate"
                    icon={Activity}
                    colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                />
                <MetricCard
                    title="Coupon Redemption"
                    value={metrics.totalRedemptions}
                    subtext={`${metrics.activeCoupons} active coupons`}
                    icon={Tag}
                    colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                />
            </div>

            {/* Two Column Layout: Campaigns (Left) & Coupons (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Campaigns Table (Left 2/3) */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-blue-500" />
                                    Messaging Campaigns Performance
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Performance tracking of email, SMS, and push notification dispatches</p>
                            </div>
                            <div className="relative group w-full sm:w-64">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search campaign name..."
                                    value={campaignSearch}
                                    onChange={e => setCampaignSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-500/20"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">Campaign</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">Channel</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">Status</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">Reach</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">Success</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">Failures</th>
                                        <th className="px-4 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {loading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={7} className="px-4 py-5"><div className="h-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-pulse" /></td>
                                            </tr>
                                        ))
                                    ) : filteredCampaigns.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-semibold">No campaign data found</td>
                                        </tr>
                                    ) : (
                                        filteredCampaigns.map(c => {
                                            const total = (c.sentCount || 0) + (c.failedCount || 0);
                                            const rate = total > 0 ? ((c.sentCount || 0) / total) * 100 : 100;
                                            return (
                                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 text-xs">
                                                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 max-w-[150px] truncate">{c.name}</td>
                                                    <td className="px-4 py-3 capitalize font-semibold flex items-center gap-1.5">{getChannelIcon(c.type)} {c.type}</td>
                                                    <td className="px-4 py-3">{getCampaignStatus(c.status)}</td>
                                                    <td className="px-4 py-3 font-mono font-semibold">{c.totalAudience || 0}</td>
                                                    <td className="px-4 py-3 font-mono text-emerald-600 font-semibold">{c.sentCount || 0}</td>
                                                    <td className="px-4 py-3 font-mono text-rose-500 font-semibold">{c.failedCount || 0}</td>
                                                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{rate.toFixed(1)}%</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Coupon Leaderboard (Right 1/3) */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-purple-500" />
                                    Coupon Redemption
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Discount code conversions</p>
                            </div>
                            <div className="relative group w-full sm:w-40">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search code..."
                                    value={couponSearch}
                                    onChange={e => setCouponSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
                                ))
                            ) : filteredCoupons.length === 0 ? (
                                <p className="text-center text-xs text-slate-400 py-10 font-semibold">No coupons found</p>
                            ) : (
                                filteredCoupons.map((c, i) => (
                                    <div key={c.id || i} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">{c.code}</span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Percent className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] text-slate-400 font-semibold">
                                                    {c.discountType === 'percentage' ? `${c.amount}% discount` : `${formatPrice(c.amount)} discount`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-xs font-black text-slate-900 dark:text-white block">{c.usedCount || 0} uses</span>
                                            <span className="text-[9px] font-black uppercase text-slate-400">
                                                Limit: {c.usageLimit || '∞'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
