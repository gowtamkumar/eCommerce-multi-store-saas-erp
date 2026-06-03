'use client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AlertCircle, Clock, Loader2, RefreshCw, ShieldCheck, Zap, HardDrive, Package, ShoppingCart, Users, MapPin, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { SubscriptionOverviewProps } from '../../type';
import { getFeatureDisplay } from '@/routes';

dayjs.extend(relativeTime);

// Icon resolver for addon catalog
const ICON_MAP: Record<string, React.ComponentType<any>> = {
    HardDrive,
    Package,
    ShoppingCart,
    Users,
    MapPin,
};
function getAddonIcon(iconName: string | undefined): React.ComponentType<any> {
    return (iconName && ICON_MAP[iconName]) ? ICON_MAP[iconName] : Package;
}

const SubscriptionOverview: React.FC<SubscriptionOverviewProps & { addonCatalog?: any[] }> = ({
    subInfo,
    plans,
    handleUpgrade,
    initiating,
    addonCatalog = [],
}) => {
    const activePlan = plans.find(p => p.name === subInfo?.planName) as any;

    // Use API-driven catalog, or fallback to empty for counting
    const catalogForCounting = addonCatalog.length > 0 ? addonCatalog : [];

    // Count active instances of each addon from catalog
    const productsAddonCount = catalogForCounting
        .filter((a: any) => a.boostUnit === 'products')
        .reduce((sum: number, a: any) => sum + (subInfo?.activeAddons?.filter((slug: string) => slug === a.slug || slug.startsWith(a.slug + '_')).length ?? 0), 0);
    const ordersAddonCount = catalogForCounting
        .filter((a: any) => a.boostUnit === 'orders')
        .reduce((sum: number, a: any) => sum + (subInfo?.activeAddons?.filter((slug: string) => slug === a.slug || slug.startsWith(a.slug + '_')).length ?? 0), 0);
    const staffAddonCount = catalogForCounting
        .filter((a: any) => a.boostUnit === 'staff')
        .reduce((sum: number, a: any) => sum + (subInfo?.activeAddons?.filter((slug: string) => slug === a.slug || slug.startsWith(a.slug + '_')).length ?? 0), 0);
    const locationsAddonCount = catalogForCounting
        .filter((a: any) => a.boostUnit === 'locations')
        .reduce((sum: number, a: any) => sum + (subInfo?.activeAddons?.filter((slug: string) => slug === a.slug || slug.startsWith(a.slug + '_')).length ?? 0), 0);
    const storageAddonBoostMb = catalogForCounting
        .filter((a: any) => a.boostUnit === 'mb')
        .reduce((sum: number, a: any) => sum + (subInfo?.activeAddons?.filter((slug: string) => slug === a.slug || slug.startsWith(a.slug + '_')).length ?? 0) * a.boostValue, 0);

    const hasProductsAddon = productsAddonCount > 0;
    const hasOrdersAddon = ordersAddonCount > 0;
    const hasStaffAddon = staffAddonCount > 0;
    const hasLocationsAddon = locationsAddonCount > 0;
    const hasStorageAddon = storageAddonBoostMb > 0;

    return (
        <section className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />

            <div className="relative flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
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

                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/30 flex-1 min-w-[140px] sm:w-44 sm:flex-none">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Billing Cycle</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center capitalize">{subInfo?.billingCycle}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/30 flex-1 min-w-[140px] sm:w-44 sm:flex-none">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Status</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center capitalize">{subInfo?.status}</p>
                        </div>

                        <button
                            onClick={() => {
                                const currentPlan = plans.find(p => p.name === subInfo?.planName);
                                if (currentPlan) handleUpgrade(currentPlan.id);
                            }}
                            disabled={initiating !== null}
                            className={`px-8 py-5 rounded-3xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 w-full sm:w-auto ${subInfo?.status === 'trial'
                                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-600/20'
                                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20'
                                }`}
                        >
                            {initiating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                            {subInfo?.status === 'trial' ? 'Upgrade Plan' : 'Renew Now'}
                        </button>
                    </div>
                </div>

                {activePlan && (
                    <>
                        <div className="w-full h-px bg-slate-100 dark:bg-slate-750 my-2" />

                        <div className="relative">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-left">Active Plan Quotas & Capacities</p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between text-left">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Products SKU Limit</span>
                                    <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            {activePlan.maxProducts === -1 ? (
                                                <span className="text-violet-500 dark:text-violet-400 font-black">∞ Unlimited</span>
                                            ) : (
                                                (activePlan.maxProducts + (productsAddonCount * 1000)).toLocaleString()
                                            )}
                                        </span>
                                        {hasProductsAddon && activePlan.maxProducts !== -1 && (
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-150 dark:border-emerald-900/30">
                                                +{productsAddonCount * 1000} SKU Boost
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between text-left">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Order Limit</span>
                                    <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            {activePlan.maxMonthlyOrders === -1 ? (
                                                <span className="text-violet-500 dark:text-violet-400 font-black">∞ Unlimited</span>
                                            ) : (
                                                (activePlan.maxMonthlyOrders + (ordersAddonCount * 5000)).toLocaleString()
                                            )}
                                        </span>
                                        {hasOrdersAddon && activePlan.maxMonthlyOrders !== -1 && (
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-150 dark:border-emerald-900/30">
                                                +{ordersAddonCount * 5000} Order Boost
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between text-left">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Accounts Limit</span>
                                    <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            {activePlan.maxStaffUsers === -1 ? (
                                                <span className="text-violet-500 dark:text-violet-400 font-black">∞ Unlimited</span>
                                            ) : (
                                                `${activePlan.maxStaffUsers + (staffAddonCount * 10)} Users`
                                            )}
                                        </span>
                                        {hasStaffAddon && activePlan.maxStaffUsers !== -1 && (
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-150 dark:border-emerald-900/30">
                                                +{staffAddonCount * 10} User Boost
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between text-left">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locations / WH</span>
                                    <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            {activePlan.maxBranches === -1 ? (
                                                <span className="text-violet-500 dark:text-violet-400 font-black">∞ Unlimited</span>
                                            ) : (
                                                `${activePlan.maxBranches + (locationsAddonCount * 3)} / ${activePlan.maxWarehouses + (locationsAddonCount * 3)}`
                                            )}
                                        </span>
                                        {hasLocationsAddon && activePlan.maxBranches !== -1 && (
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-150 dark:border-emerald-900/30">
                                                +{locationsAddonCount * 3} WH/Loc Boost
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between text-left">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Space</span>
                                    <div className="mt-1 flex flex-col justify-between h-full w-full">
                                        <div className="flex items-baseline gap-1.5 flex-wrap">
                                            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                {Math.round((subInfo?.storageUsage || 0) / (1024 * 1024))} MB /{' '}
                                                {subInfo?.storageLimit === -1 ? (
                                                    <span className="text-violet-500 dark:text-violet-400 font-black">∞ Unlimited</span>
                                                ) : (
                                                    subInfo?.storageLimit && subInfo.storageLimit >= 1024 ? `${(subInfo.storageLimit / 1024).toFixed(1)} GB` : `${subInfo?.storageLimit} MB`
                                                )}
                                            </span>
                                            {hasStorageAddon && subInfo?.storageLimit !== -1 && (
                                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-150 dark:border-emerald-900/30">
                                                    +{storageAddonBoostMb >= 1024 ? `${(storageAddonBoostMb / 1024).toFixed(1)} GB` : `${storageAddonBoostMb} MB`} Boost
                                                </span>
                                            )}
                                        </div>
                                        {subInfo?.storageLimit !== undefined && subInfo?.storageLimit !== -1 && (() => {
                                            const usedMb = (subInfo.storageUsage || 0) / (1024 * 1024);
                                            const limitMb = subInfo.storageLimit || 1024;
                                            const pct = Math.min(100, Math.round((usedMb / limitMb) * 105) / 105 * 100);
                                            const barColor = pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-brand-600';
                                            return (
                                                <div className="w-full h-1.5 bg-slate-250 dark:bg-slate-700/50 rounded-full overflow-hidden mt-1.5">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Plan and Addons active details list */}
                        <div className="w-full h-px bg-slate-100 dark:bg-slate-750 my-4" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                            {/* Active Plan Features */}
                            <div className="bg-slate-50/30 dark:bg-slate-900/10 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col">
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Active Plan Inclusions
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                                    {activePlan.features && activePlan.features.length > 0 ? (
                                        activePlan.features
                                            .filter((f: string) => !['settings', 'header', 'footer', 'navbar'].includes(f.toLowerCase().trim()))
                                            .map((feature: string, fIdx: number) => {
                                                const display = getFeatureDisplay(feature);
                                                const FeatureIcon = display.icon || CheckCircle2;
                                                return (
                                                    <div key={fIdx} className="flex items-center gap-2.5 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                                                            <FeatureIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{display.label}</span>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <p className="text-xs text-slate-400 font-medium italic col-span-2 text-center my-auto">No features specified for this plan</p>
                                    )}
                                </div>
                            </div>

                            {/* Active Addons & Boosts list */}
                            <div className="bg-slate-50/30 dark:bg-slate-900/10 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col">
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    Active Addon Boosts
                                </h3>
                                <div className="space-y-3 flex-1 flex flex-col justify-start">
                                    {(() => {
                                        // Compute counts of active addons based on slug matching using DB catalog
                                        const addonCounts = catalogForCounting.map((addon: any) => {
                                            const count = subInfo?.activeAddons?.filter((slug: string) => slug === addon.slug || slug.startsWith(addon.slug + '_')).length ?? 0;
                                            return { ...addon, count };
                                        }).filter((a: any) => a.count > 0);

                                        if (addonCounts.length > 0) {
                                            return addonCounts.map((addon: any) => {
                                                const IconComponent = getAddonIcon(addon.icon);
                                                return (
                                                    <div key={addon.slug} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-150 dark:border-emerald-950/30 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                                                                <IconComponent className="w-4 h-4" />
                                                            </div>
                                                            <div className="text-left">
                                                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{addon.name}</h4>
                                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight mt-0.5">{addon.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end shrink-0 pl-2">
                                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/20">
                                                                {addon.boostLabel || addon.boost}
                                                            </span>
                                                            {addon.count > 1 && (
                                                                <span className="text-[9px] font-black text-brand-600 dark:text-brand-400 mt-1 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full">
                                                                    x{addon.count} Active
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        }

                                        return (
                                            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 my-auto text-center">
                                                <Zap className="w-5 h-5 text-slate-350 dark:text-slate-600 mb-2" />
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300">No Addon Boosts Active</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[280px]">
                                                    Purchase one-off boosts below to increase products, storage, orders, staff, or branches individually.
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default React.memo(SubscriptionOverview);
