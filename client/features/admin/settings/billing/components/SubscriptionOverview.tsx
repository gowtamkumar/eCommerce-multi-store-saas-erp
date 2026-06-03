'use client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AlertCircle, Clock, Loader2, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import React from 'react';
import { SubscriptionOverviewProps } from '../../type';

dayjs.extend(relativeTime);



const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = ({
    subInfo,
    plans,
    handleUpgrade,
    initiating
}) => {
    return (
        <section className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-full">
                        {subInfo?.status === 'trial' ? (
                            <>
                                <Clock className="w-4 h-4 text-brand-600" />
                                <span className="text-xs font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest">Free Trial Mode</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 text-brand-600" />
                                <span className="text-xs font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest">Current Subscription</span>
                            </>
                        )}
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {subInfo?.planName} Plan
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                            {subInfo?.isExpired ? (
                                <span className="flex items-center gap-1.5 text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Expired on {subInfo?.endsAt ? dayjs(subInfo.endsAt).format('MMMM DD, YYYY') : 'N/A'}
                                </span>
                            ) : subInfo?.status === 'trial' ? (
                                <span className="flex items-center gap-1.5 text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border border-brand-100 dark:border-brand-800 animate-pulse">
                                    <Clock className="w-4 h-4" />
                                    Trial Period: {subInfo?.endsAt ? dayjs(subInfo.endsAt).fromNow(true) : 'N/A'} remaining
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                                    <ShieldCheck className="w-4 h-4" />
                                    Active until {subInfo?.endsAt ? dayjs(subInfo.endsAt).format('MMMM DD, YYYY') : 'N/A'}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/30 w-44">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Billing Cycle</p>
                        <p className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center capitalize">{subInfo?.billingCycle}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/30 w-44">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Status</p>
                        <p className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center capitalize">{subInfo?.status}</p>
                    </div>

                    {subInfo?.storageLimit !== undefined && subInfo?.storageLimit !== -1 && (
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/30 min-w-[240px] flex-1">
                            <div className="flex justify-between items-center mb-1.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Used</p>
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
                                    {Math.round((subInfo.storageUsage || 0) / (1024 * 1024))} MB / {subInfo.storageLimit >= 1024 ? `${(subInfo.storageLimit / 1024).toFixed(1)} GB` : `${subInfo.storageLimit} MB`}
                                </span>
                            </div>
                            {(() => {
                                const usedMb = (subInfo.storageUsage || 0) / (1024 * 1024);
                                const limitMb = subInfo.storageLimit || 1024;
                                const pct = Math.min(100, Math.round((usedMb / limitMb) * 100));
                                const barColor = pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-brand-600';
                                const textColor = pct > 90 ? 'text-rose-600 dark:text-rose-400' : pct > 75 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200';
                                return (
                                    <div className="space-y-2">
                                        <div className="w-full h-2.5 bg-slate-250 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-left">
                                            <span className={`${textColor} font-black`}>{pct}%</span> of total storage space utilized
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {subInfo?.storageLimit === -1 && (
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/30 w-44">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Storage Used</p>
                            <p className="text-xl font-bold text-violet-500 dark:text-violet-400 text-center font-black">∞ Unlimited</p>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            const currentPlan = plans.find(p => p.name === subInfo?.planName);
                            if (currentPlan) handleUpgrade(currentPlan.id);
                        }}
                        disabled={initiating !== null}
                        className={`px-8 py-5 rounded-3xl font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 ${subInfo?.status === 'trial'
                            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-600/20'
                            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20'
                            }`}
                    >
                        {initiating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                        {subInfo?.status === 'trial' ? 'Upgrade Plan' : 'Renew Now'}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default React.memo(SubscriptionOverview);
