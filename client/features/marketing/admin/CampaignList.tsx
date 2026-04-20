'use client';
import dayjs from 'dayjs';
import { AlertCircle, Calendar, CheckCircle2, Clock, Mail, MessageSquare, Pencil, Send, Trash2, XCircle } from 'lucide-react';
import { Campaign, CampaignStatus, CampaignType } from '../types';

interface CampaignListProps {
    campaigns: Campaign[];
    onEdit: (campaign: Campaign) => void;
    onSchedule: (campaign: Campaign) => void;
    onCancel: (campaign: Campaign) => void;
    onDelete: (id: string) => void;
}

export default function CampaignList({ campaigns, onEdit, onSchedule, onCancel, onDelete }: CampaignListProps) {
    const getStatusStyles = (status: CampaignStatus) => {
        switch (status) {
            case CampaignStatus.DRAFT:
                return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
            case CampaignStatus.SCHEDULED:
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case CampaignStatus.RUNNING:
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse';
            case CampaignStatus.COMPLETED:
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case CampaignStatus.FAILED:
                return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusIcon = (status: CampaignStatus) => {
        switch (status) {
            case CampaignStatus.DRAFT: return <Clock className="w-3 h-3" />;
            case CampaignStatus.SCHEDULED: return <Calendar className="w-3 h-3" />;
            case CampaignStatus.RUNNING: return <Send className="w-3 h-3" />;
            case CampaignStatus.COMPLETED: return <CheckCircle2 className="w-3 h-3" />;
            case CampaignStatus.FAILED: return <AlertCircle className="w-3 h-3" />;
            default: return null;
        }
    };

    const getChannelIcon = (type: CampaignType) => {
        switch (type) {
            case CampaignType.EMAIL: return <Mail className="w-4 h-4" />;
            case CampaignType.SMS: return <MessageSquare className="w-4 h-4" />;
            case CampaignType.PUSH: return <Send className="w-4 h-4 rotate-[-45deg]" />;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Campaign</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Channel</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Progress</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Schedule</th>
                        <th className="px-6 py-3 font-semibold text-right text-slate-500 dark:text-slate-400">Actions</th>
                    </tr>
                </thead>
                <tbody className="space-y-4">
                    {campaigns.map((campaign) => (
                        <tr
                            key={campaign.id}
                            className="bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all rounded-2xl group border border-slate-200 dark:border-slate-800"
                        >
                            <td className="px-6 py-4 rounded-l-2xl">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{campaign.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{campaign.id.substring(0, 8)}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        {getChannelIcon(campaign.type)}
                                    </div>
                                    <span className="text-xs font-medium capitalize">{campaign.type}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(campaign.status)}`}>
                                    {getStatusIcon(campaign.status)}
                                    {campaign.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1.5 min-w-[120px]">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-emerald-500">{campaign.sentCount} sent</span>
                                        <span className="text-rose-500">{campaign.failedCount} failed</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-500 transition-all duration-500"
                                            style={{ width: `${campaign.totalAudience > 0 ? (campaign.sentCount / campaign.totalAudience) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Created</span>
                                    <span style={{ whiteSpace: 'nowrap' }} className="font-bold text-slate-600 dark:text-slate-400">{dayjs(campaign.createdAt).format('MMM D, hh:mm A')}</span>

                                    {campaign.scheduleTime && (
                                        <>
                                            <span className="text-[10px] uppercase font-black text-brand-500 tracking-widest mt-1">Scheduled</span>
                                            <span style={{ whiteSpace: 'nowrap' }} className="font-black text-brand-600">{dayjs(campaign.scheduleTime).format('MMM D, hh:mm A')}</span>
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 rounded-r-2xl text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {campaign.status === CampaignStatus.DRAFT && (
                                        <button
                                            onClick={() => onSchedule(campaign)}
                                            className="p-2 text-brand-600 hover:bg-brand-100 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                                            title="Schedule"
                                        >
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                    )}
                                    {campaign.status === CampaignStatus.SCHEDULED && (
                                        <button
                                            onClick={() => onCancel(campaign)}
                                            className="p-2 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                            title="Cancel Schedule"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onEdit(campaign)}
                                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        title="Edit Campaign"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this campaign?')) {
                                                onDelete(campaign.id);
                                            }
                                        }}
                                        className="p-2 text-rose-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                        title="Delete Campaign"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
