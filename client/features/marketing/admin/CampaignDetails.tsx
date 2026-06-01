'use client';
import { CampaignKpis, fetchCampaignById, fetchCampaignKpis, fetchCampaignLogs } from '@/services/campaign';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Info, Loader2, Mail, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Campaign, CampaignStatus, CampaignType } from '../types';

interface CampaignDetailsProps {
    campaign: Campaign;
    onClose: () => void;
}

export default function CampaignDetails({ campaign: initialCampaign, onClose }: CampaignDetailsProps) {
    const [currentCampaign, setCurrentCampaign] = useState<Campaign>(initialCampaign);
    const [logs, setLogs] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [kpis, setKpis] = useState<CampaignKpis | null>(null);

    const message = currentCampaign.messages?.[0];

    // Polling for campaign status and stats updates
    useEffect(() => {
        if (currentCampaign.status !== CampaignStatus.RUNNING && currentCampaign.status !== CampaignStatus.SCHEDULED) {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const res = await fetchCampaignById(currentCampaign.id);
                if (res.success) {
                    setCurrentCampaign(res.data);
                }
            } catch (error) {
                console.error('Failed to poll campaign status', error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [currentCampaign.id, currentCampaign.status]);

    useEffect(() => {
        const loadKpis = async () => {
            try {
                const data = await fetchCampaignKpis(currentCampaign.id);
                if (data) setKpis(data);
            } catch (error) {
                console.error('Failed to load campaign KPIs', error);
            }
        };

        loadKpis();
        const interval = currentCampaign.status === CampaignStatus.RUNNING ? setInterval(loadKpis, 5000) : null;
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [currentCampaign.id, currentCampaign.status]);

    // Fetch logs (refetched on page change or if campaign ID changes)
    useEffect(() => {
        const loadLogs = async () => {
            setLoadingLogs(true);
            try {
                const res = await fetchCampaignLogs(initialCampaign.id, page, limit);
                if (res.success) {
                    setLogs(res.data.data);
                    setTotal(res.data.total);
                }
            } catch (error) {
                console.error('Failed to load logs', error);
            } finally {
                setLoadingLogs(false);
            }
        };

        loadLogs();
    }, [initialCampaign.id, page, limit]);

    const totalPages = Math.ceil(total / limit);

    const getStatusStyles = (status: CampaignStatus) => {
        switch (status) {
            case CampaignStatus.DRAFT: return 'bg-slate-100 text-slate-600';
            case CampaignStatus.SCHEDULED: return 'bg-blue-100 text-blue-600';
            case CampaignStatus.RUNNING: return 'bg-amber-100 text-amber-600';
            case CampaignStatus.COMPLETED: return 'bg-emerald-100 text-emerald-600';
            case CampaignStatus.FAILED: return 'bg-rose-100 text-rose-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20"
            >
                {/* Header */}
                <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black tracking-tighter uppercase">{currentCampaign.name}</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyles(currentCampaign.status)}`}>
                                {currentCampaign.status}
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-3 h-3" /> Campaign ID: {currentCampaign.id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Audience', value: currentCampaign.totalAudience, icon: Users, color: 'text-brand-600' },
                            { label: 'Delivery Rate', value: `${kpis?.deliveryRate ?? 0}%`, icon: CheckCircle2, color: 'text-emerald-600' },
                            { label: 'Open Rate', value: `${kpis?.openRate ?? 0}%`, icon: Mail, color: 'text-blue-600' },
                            { label: 'Click Rate', value: `${kpis?.clickRate ?? 0}%`, icon: Info, color: 'text-amber-600' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                </div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            ['Sent', kpis?.sent ?? currentCampaign.sentCount],
                            ['Failed', kpis?.failed ?? currentCampaign.failedCount],
                            ['Opened', kpis?.opened ?? 0],
                            ['Clicked', kpis?.clicked ?? 0],
                        ].map(([label, value]) => (
                            <div key={label} className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Content Preview */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Content Preview
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-brand-100 text-brand-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            {currentCampaign.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    {currentCampaign.type === CampaignType.EMAIL && (
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject Line</p>
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">{message?.subject || 'No Subject'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Body</p>
                                                <div
                                                    className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 prose prose-slate dark:prose-invert max-w-none max-h-[300px] overflow-y-auto"
                                                    dangerouslySetInnerHTML={{ __html: message?.htmlContent || 'No Content' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentCampaign.type === CampaignType.SMS && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SMS Text</p>
                                            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                                {message?.text || 'No Text Content'}
                                            </div>
                                        </div>
                                    )}

                                    {(currentCampaign.type === CampaignType.PUSH) && (
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notification Title</p>
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">{message?.title || 'No Title'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Body Text</p>
                                                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm leading-relaxed">
                                                    {message?.body || 'No Body Content'}
                                                </div>
                                            </div>
                                            {message?.imageUrl && (
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attached Image</p>
                                                    <img src={message.imageUrl} alt="Campaign" className="rounded-2xl border border-slate-100 dark:border-slate-800 max-h-[200px] object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Audience & Schedule Details */}
                        <div className="space-y-6">
                            {/* Targeting */}
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Audience Targeting
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Registered Users', active: currentCampaign.targetUsers },
                                        { label: 'Newsletter Subscribers', active: currentCampaign.targetSubscribers },
                                        { label: 'Marketing Leads', active: currentCampaign.targetLeads },
                                    ].map((target, i) => (
                                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${target.active ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-600' : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 text-slate-400 opacity-50'}`}>
                                            <span className="text-xs font-bold">{target.label}</span>
                                            {target.active ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="bg-slate-900 text-white p-8 rounded-4xl space-y-6">
                                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Timeframe & History
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Created At</p>
                                        <p className="text-sm font-bold">{dayjs(currentCampaign.createdAt).format('MMM D, YYYY hh:mm A')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last Schedule Run</p>
                                        <p className="text-sm font-bold">
                                            {currentCampaign.scheduleTime
                                                ? dayjs(currentCampaign.scheduleTime).format('MMM D, YYYY hh:mm A')
                                                : 'Manual Execution'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Logs Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Delivery Logs ({total})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left bg-white dark:bg-slate-800">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent At</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Error</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {loadingLogs ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                                            </td>
                                        </tr>
                                    ) : logs.length > 0 ? (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-8 py-4">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {log.recipient?.name || log.metadata?.name || 'Recipient'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                        {log.recipient?.email || log.metadata?.email || 'No Email'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${['sent', 'opened', 'clicked'].includes(log.status) ? 'bg-emerald-100 text-emerald-600' :
                                                        log.status === 'failed' ? 'bg-rose-100 text-rose-600' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    {log.sentAt ? dayjs(log.sentAt).format('MMM D, hh:mm A') : '-'}
                                                </td>
                                                <td className="px-8 py-4 text-xs font-medium text-rose-500 max-w-xs truncate" title={log.error}>
                                                    {log.error || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-10 text-center text-slate-400 text-xs font-bold italic">
                                                No delivery logs found for this campaign.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={page === 1 || loadingLogs}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 transition-all hover:border-brand-500"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={page === totalPages || loadingLogs}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 transition-all hover:border-brand-500"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
