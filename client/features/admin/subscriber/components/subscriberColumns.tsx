'use client';

import type { DataTableColumn } from '@/components/shared/DataTable';
import { Calendar, CheckCircle, Mail, XCircle } from 'lucide-react';
import type { Subscriber, SubscriberStatus } from '../type';

const statusStyles: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50',
    pending: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50',
    unsubscribed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
    suppressed: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50',
};

function resolveStatus(subscriber: Subscriber): SubscriberStatus {
    return subscriber.status || (subscriber.isActive ? 'confirmed' : 'unsubscribed');
}

function resolveStatusNote(subscriber: Subscriber) {
    if (subscriber.confirmedAt) return `Confirmed ${new Date(subscriber.confirmedAt).toLocaleDateString()}`;
    if (subscriber.unsubscribedAt) return `Left ${new Date(subscriber.unsubscribedAt).toLocaleDateString()}`;
    return 'Awaiting opt-in';
}

export function buildSubscriberColumns(): DataTableColumn<Subscriber>[] {
    return [
        {
            key: 'createdAt',
            header: 'Timestamp',
            className: 'px-6 py-5',
            cell: (subscriber) => (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {new Date(subscriber.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            ),
        },
        {
            key: 'email',
            header: 'Identity Mail',
            className: 'px-6 py-5',
            cell: (subscriber) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
                        <Mail className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{subscriber.email}</span>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {subscriber.source || 'storefront'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Pulse State',
            className: 'px-6 py-5',
            cell: (subscriber) => {
                const status = resolveStatus(subscriber);
                return (
                    <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyles[status] || statusStyles.unsubscribed}`}>
                            {status === 'confirmed' ? (
                                <>
                                    <CheckCircle className="w-3 h-3" />
                                    Confirmed
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-3 h-3" />
                                    {status}
                                </>
                            )}
                        </span>
                        <p className="mt-1 text-[10px] text-slate-400 font-semibold">
                            {resolveStatusNote(subscriber)}
                        </p>
                    </div>
                );
            },
        },
    ];
}
