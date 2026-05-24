'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { 
    Megaphone, Search, Download, Mail, MessageSquare, Bell,
    CheckCircle2, XCircle, AlertCircle, Calendar, Users, BarChart3, TrendingUp
} from 'lucide-react';

// Memoized Summary Card component
const SummaryCard = memo(({ title, value, subtext, icon: Icon, colorClass, borderClass }: any) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${borderClass || 'border-slate-100 dark:border-slate-700'} shadow-sm transition-all hover:shadow-md group`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 ${colorClass} rounded-xl transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        </div>
        <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1 font-semibold">{subtext}</p>}
    </div>
));
SummaryCard.displayName = 'SummaryCard';

export default function CampaignReportDashboard() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'sms' | 'push'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'running' | 'completed'>('all');

    // Fetch all campaigns
    useEffect(() => {
        const loadCampaigns = async () => {
            setLoading(true);
            try {
                const res = await fetchAPI('/campaigns');
                if (res.success) {
                    setCampaigns(res.data || []);
                }
            } catch (error) {
                console.error('Failed to load campaigns for report', error);
                toast.error('Failed to load campaign performance data');
            } finally {
                setLoading(false);
            }
        };
        loadCampaigns();
    }, []);

    // Filter and search logic
    const filteredCampaigns = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return campaigns.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(query);
            const matchesChannel = channelFilter === 'all' || c.type === channelFilter;
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            return matchesSearch && matchesChannel && matchesStatus;
        });
    }, [campaigns, searchQuery, channelFilter, statusFilter]);

    // Statistics Calculation
    const stats = useMemo(() => {
        const totalCount = filteredCampaigns.length;
        const totalSent = filteredCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
        const totalFailed = filteredCampaigns.reduce((sum, c) => sum + (c.failedCount || 0), 0);
        const totalAudience = filteredCampaigns.reduce((sum, c) => sum + (c.totalAudience || 0), 0);

        const totalAttempts = totalSent + totalFailed;
        const deliveryRate = totalAttempts > 0 ? (totalSent / totalAttempts) * 100 : 100;

        // Channel breakdowns
        const emailCount = filteredCampaigns.filter(c => c.type === 'email').length;
        const smsCount = filteredCampaigns.filter(c => c.type === 'sms').length;
        const pushCount = filteredCampaigns.filter(c => c.type === 'push').length;

        // Status counts
        const completedCount = filteredCampaigns.filter(c => c.status === 'completed').length;
        const runningCount = filteredCampaigns.filter(c => c.status === 'running').length;
        const scheduledCount = filteredCampaigns.filter(c => c.status === 'scheduled').length;

        return {
            totalCount,
            totalSent,
            totalFailed,
            totalAudience,
            deliveryRate,
            emailCount,
            smsCount,
            pushCount,
            completedCount,
            runningCount,
            scheduledCount
        };
    }, [filteredCampaigns]);

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'email': return <Mail className="w-4 h-4 text-blue-500" />;
            case 'sms': return <MessageSquare className="w-4 h-4 text-purple-500" />;
            case 'push': return <Bell className="w-4 h-4 text-amber-500" />;
            default: return <Megaphone className="w-4 h-4 text-slate-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                );
            case 'running':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue-100 dark:border-blue-900/30 animate-pulse">
                        <TrendingUp className="w-3 h-3" /> Running
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-purple-100 dark:border-purple-900/30">
                        <Calendar className="w-3 h-3" /> Scheduled
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200 dark:border-slate-700">
                        <AlertCircle className="w-3 h-3" /> Draft
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-red-100 dark:border-red-900/30">
                        <XCircle className="w-3 h-3" /> Failed
                    </span>
                );
        }
    };

    // CSV Export
    const handleExportCSV = () => {
        try {
            let csvContent = 'Campaign Name,Type,Status,Target Audience,Sent successfully,Failed,Success Rate,Scheduled/Created Date\n';
            filteredCampaigns.forEach(c => {
                const attempts = (c.sentCount || 0) + (c.failedCount || 0);
                const rate = attempts > 0 ? ((c.sentCount || 0) / attempts) * 100 : 100;
                csvContent += `"${c.name}","${c.type}","${c.status}",${c.totalAudience || 0},${c.sentCount || 0},${c.failedCount || 0},"${rate.toFixed(1)}%",${c.scheduleTime || c.createdAt}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'marketing-campaigns-performance-report.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Failed to export CSV', error);
            toast.error('Failed to export CSV');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-brand-600" />
                        Campaign Performance Report
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Analyze delivery rates, audience reach, and channel performance metrics.
                    </p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={loading || filteredCampaigns.length === 0}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl transition-all font-semibold border border-transparent disabled:opacity-50 text-sm shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Export CSV Report
                </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Campaigns Run"
                    value={stats.totalCount}
                    subtext={`${stats.completedCount} completed, ${stats.runningCount} active`}
                    icon={Megaphone}
                    colorClass="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                />
                <SummaryCard
                    title="Total Reach"
                    value={stats.totalAudience}
                    subtext="Total target audience size"
                    icon={Users}
                    colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                />
                <SummaryCard
                    title="Messages Sent"
                    value={stats.totalSent}
                    subtext={`${stats.totalFailed} delivery failures`}
                    icon={CheckCircle2}
                    colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    borderClass={stats.totalFailed > 0 ? 'border-amber-100 dark:border-amber-950/20' : ''}
                />
                <SummaryCard
                    title="Delivery Rate"
                    value={`${stats.deliveryRate.toFixed(1)}%`}
                    subtext="Overall dispatch success rate"
                    icon={BarChart3}
                    colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                />
            </div>

            {/* Distribution and Filter Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Channel Breakdown */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider mb-4">Channel Distribution</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Email Campaigns', count: stats.emailCount, icon: Mail, color: 'bg-blue-500', percentage: stats.totalCount > 0 ? (stats.emailCount / stats.totalCount) * 100 : 0 },
                            { label: 'SMS Campaigns', count: stats.smsCount, icon: MessageSquare, color: 'bg-purple-500', percentage: stats.totalCount > 0 ? (stats.smsCount / stats.totalCount) * 100 : 0 },
                            { label: 'Push Notifications', count: stats.pushCount, icon: Bell, color: 'bg-amber-500', percentage: stats.totalCount > 0 ? (stats.pushCount / stats.totalCount) * 100 : 0 }
                        ].map((c, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5"><c.icon className="w-3.5 h-3.5" />{c.label}</span>
                                    <span>{c.count} ({c.percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.percentage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Report Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Marketing Channel</label>
                                <select
                                    value={channelFilter}
                                    onChange={(e: any) => setChannelFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none font-semibold text-slate-800 dark:text-slate-200"
                                >
                                    <option value="all">All Channels</option>
                                    <option value="email">Email</option>
                                    <option value="sms">SMS</option>
                                    <option value="push">Push Notification</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Campaign Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e: any) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none font-semibold text-slate-800 dark:text-slate-200"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="running">Running</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search campaign name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Campaign Report List Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Campaign Name</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Channel</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reach</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Success</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Failures</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deliverability</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={8} className="px-6 py-8 animate-pulse">
                                            <div className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredCampaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-1">
                                                <Megaphone className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                                            </div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No campaign data</p>
                                            <p className="text-xs text-slate-500 font-medium">No campaign records match the specified filters or search query.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCampaigns.map(c => {
                                    const attempts = (c.sentCount || 0) + (c.failedCount || 0);
                                    const rate = attempts > 0 ? ((c.sentCount || 0) / attempts) * 100 : 100;
                                    const rateClass = rate >= 95 ? 'text-emerald-500' : rate >= 80 ? 'text-amber-500' : 'text-red-500';

                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[200px]" title={c.name}>
                                                    {c.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 capitalize text-xs">
                                                    {getChannelIcon(c.type)}
                                                    {c.type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{c.totalAudience || 0}</td>
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{c.sentCount || 0}</td>
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-rose-500">{c.failedCount || 0}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-mono text-xs font-bold ${rateClass}`}>{rate.toFixed(1)}%</span>
                                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={`h-full ${rate >= 95 ? 'bg-emerald-500' : rate >= 80 ? 'bg-amber-500' : 'bg-rose-500'} rounded-full`} style={{ width: `${rate}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                                {new Date(c.scheduleTime || c.createdAt).toLocaleDateString()}
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
    );
}
