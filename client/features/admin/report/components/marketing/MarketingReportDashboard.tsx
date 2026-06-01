'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { 
    Megaphone, Search, Download, Mail, MessageSquare, Bell,
    CheckCircle2, XCircle, AlertCircle, Calendar, Users, BarChart3,
    Tag, Percent, Activity, Sparkles, RefreshCcw, Coins, ShieldAlert, Award
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
    const [orders, setOrders] = useState<any[]>([]);
    const [loyaltyConfig, setLoyaltyConfig] = useState<any | null>(null);
    const [loyaltyRules, setLoyaltyRules] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [subscribersCount, setSubscribersCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const [campaignSearch, setCampaignSearch] = useState('');
    const [couponSearch, setCouponSearch] = useState('');

    // Server caps `limit` at 100 — walk pages until we have everything (capped at
    // 10k orders / 100 pages so a runaway tenant doesn't freeze the page).
    const fetchAllOrders = async (): Promise<any[]> => {
        const PAGE_SIZE = 100;
        const PAGE_HARD_CAP = 100;
        const collected: any[] = [];
        let page = 1;
        let totalPages = 1;
        do {
            try {
                const res = await fetchAPI(`/orders?page=${page}&limit=${PAGE_SIZE}`);
                if (!res?.success) break;
                const chunk = res.data?.orders || res.data || [];
                collected.push(...chunk);
                totalPages = res.data?.totalPages ?? 1;
            } catch {
                break;
            }
            page += 1;
        } while (page <= totalPages && page <= PAGE_HARD_CAP);
        return collected;
    };

    // Fetch unified marketing statistics
    const loadMarketingData = async () => {
        setLoading(true);
        try {
            const [
                campaignsRes,
                couponsRes,
                subscribersRes,
                orders,
                loyaltyConfigRes,
                loyaltyRulesRes,
                customersRes
            ] = await Promise.all([
                fetchAPI('/campaigns').catch(() => ({ success: false, data: [] })),
                fetchAPI('/coupons').catch(() => ({ success: false, data: { coupons: [] } })),
                fetchAPI('/subscribers?limit=1').catch(() => ({ success: false, meta: { total: 0 } })),
                fetchAllOrders().catch(() => [] as any[]),
                fetchAPI('/marketing/loyalty/config').catch(() => ({ success: false, data: null })),
                fetchAPI('/marketing/loyalty/rules').catch(() => ({ success: false, data: [] })),
                fetchAPI('/customer?limit=100').catch(() => ({ success: false, data: { items: [] } }))
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
            setOrders(orders);
            if (loyaltyConfigRes.success) {
                setLoyaltyConfig(loyaltyConfigRes.data);
            }
            if (loyaltyRulesRes.success) {
                setLoyaltyRules(loyaltyRulesRes.data || []);
            }
            if (customersRes.success) {
                setCustomers(customersRes.data?.items || []);
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

    // Filter and search logic
    const filteredCampaigns = useMemo(() => {
        const query = campaignSearch.toLowerCase();
        return campaigns.filter(c => c.name.toLowerCase().includes(query));
    }, [campaigns, campaignSearch]);

    const filteredCoupons = useMemo(() => {
        const query = couponSearch.toLowerCase();
        return coupons.filter(c => c.code.toLowerCase().includes(query));
    }, [coupons, couponSearch]);

    // Financial calculations (Discounts given)
    const financialDiscounts = useMemo(() => {
        let couponDiscountTotal = 0;
        let promoDiscountTotal = 0;

        orders.forEach(order => {
            // 1. Coupon Discount (Sum of couponDiscountAmount on the order)
            const couponVal = parseFloat(order.couponDiscountAmount) || 0;
            couponDiscountTotal += couponVal;

            // 2. Promotion/Offer Discount (Sum of discountAmount on order items)
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const itemPromoDiscount = parseFloat(item.discountAmount) || 0;
                    promoDiscountTotal += itemPromoDiscount * (item.quantity || 1);
                });
            }
        });

        return {
            couponDiscountTotal,
            promoDiscountTotal,
            totalSaved: couponDiscountTotal + promoDiscountTotal
        };
    }, [orders]);

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

        // Loyalty
        const totalPointsHeld = customers.reduce((sum, cust) => sum + (cust.loyaltyPointsBalance || 0), 0);

        return {
            totalCampaigns,
            totalReach,
            deliverySuccessRate,
            totalCoupons,
            activeCoupons,
            totalRedemptions,
            totalPointsHeld
        };
    }, [campaigns, coupons, customers]);

    // Top Loyalty point holders list
    const topLoyalCustomers = useMemo(() => {
        return [...customers]
            .sort((a, b) => (b.loyaltyPointsBalance || 0) - (a.loyaltyPointsBalance || 0))
            .slice(0, 5);
    }, [customers]);

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
                        Marketing & Loyalty Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Unified marketing overview including campaign dispatch rates, coupon conversions, promotion discounts, and customer loyalty.
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

            {/* Overall Discount Performance Cards */}
            <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-[2rem] text-white">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                    <Percent className="w-6 h-6 text-brand-500" />
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-wider font-display">Discount Sales Analysis</h2>
                        <p className="text-xs text-slate-400">Total overall money saved by customers via coupons and promotion campaigns</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Discount Savings Given</span>
                        <p className="text-3xl font-black text-brand-500">{formatPrice(financialDiscounts.totalSaved)}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-semibold">Total deductions applied to checkout subtotals</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Coupon Discounts Given</span>
                        <p className="text-3xl font-black text-blue-400">{formatPrice(financialDiscounts.couponDiscountTotal)}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-semibold">Saved using unique coupon code redemptions</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Promotion / Offer Discounts Given</span>
                        <p className="text-3xl font-black text-purple-400">{formatPrice(financialDiscounts.promoDiscountTotal)}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-semibold">Savings applied via line item campaign discounts</p>
                    </div>
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
                    title="Loyalty Points Balance"
                    value={metrics.totalPointsHeld}
                    subtext={`${metrics.totalRedemptions} redemptions`}
                    icon={Coins}
                    colorClass="bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400"
                />
            </div>

            {/* Loyalty Report Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Loyalty Rules & Configuration */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Award className="w-4.5 h-4.5 text-brand-600" />
                            Loyalty Point Rules
                        </h3>
                        <div className="space-y-4">
                            {loyaltyConfig && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl space-y-1">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Base Exchange Rules</p>
                                    <p className="text-[11px] text-slate-500">
                                        Earn: {loyaltyConfig.pointsPerCurrencySpent || 1} pt per {formatPrice(1)} spent
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        Redeem: {loyaltyConfig.pointsRequiredPerCurrencyDiscount || 100} pts for {formatPrice(1)} off
                                    </p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Special Rules</p>
                                {loyaltyRules.length === 0 ? (
                                    <p className="text-xs text-slate-500 font-semibold italic">No custom rules active</p>
                                ) : (
                                    loyaltyRules.map((rule, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{rule.name || rule.ruleType}</span>
                                            <span className="font-mono font-bold text-brand-600">+{rule.pointsAwarded || rule.rewardPoints} pts</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loyalty Tier Rankings Leaderboard */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Users className="w-4.5 h-4.5 text-blue-500" />
                        Top Customer Loyalty Rankings
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">Customer Name</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">Email</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">Membership Tier</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400">Points Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i}><td colSpan={4} className="px-4 py-4"><div className="h-5 bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse" /></td></tr>
                                    ))
                                ) : topLoyalCustomers.length === 0 ? (
                                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">No customer point balance records found</td></tr>
                                ) : (
                                    topLoyalCustomers.map((cust, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{cust.customerName || cust.name}</td>
                                            <td className="px-4 py-3 text-slate-500">{cust.customerEmail || cust.email}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold uppercase text-[9px] tracking-wider rounded">
                                                    {cust.membershipTier || 'BRONZE'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                                                {cust.loyaltyPointsBalance || 0} pts
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
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
