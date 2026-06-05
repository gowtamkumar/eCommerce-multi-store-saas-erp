'use client';

import { Bell, Mail, Megaphone, MessageSquare } from 'lucide-react';
import type { CampaignChannel } from '../../types';

export function ChannelIcon({ type }: { type: CampaignChannel }) {
    switch (type) {
        case 'email':
            return <Mail className="w-3.5 h-3.5 text-blue-500" />;
        case 'sms':
            return <MessageSquare className="w-3.5 h-3.5 text-purple-500" />;
        case 'push':
            return <Bell className="w-3.5 h-3.5 text-amber-500" />;
        default:
            return <Megaphone className="w-3.5 h-3.5 text-slate-500" />;
    }
}

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
    completed: {
        className: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
        label: 'Completed',
    },
    running: {
        className: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 animate-pulse',
        label: 'Running',
    },
    scheduled: {
        className: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
        label: 'Scheduled',
    },
};

const DEFAULT_BADGE = {
    className: 'bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400',
    label: 'Draft',
};

export function CampaignStatusBadge({ status }: { status: string }) {
    const badge = STATUS_BADGE[status] || DEFAULT_BADGE;
    return (
        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${badge.className}`}>
            {badge.label}
        </span>
    );
}
