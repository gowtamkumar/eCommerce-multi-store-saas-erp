'use client';

import React, { useState } from 'react';
import { HardDrive, CheckCircle2, PlusCircle, Loader2, Package, ShoppingCart, Users, MapPin } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import { SubscriptionInfo } from '../../type';
import { convertAmountToBaseCurrency } from '../lib/formatBillingCurrency';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
    HardDrive, Package, ShoppingCart, Users, MapPin,
};
function resolveIcon(name?: string): React.ComponentType<any> {
    return (name && ICON_MAP[name]) ? ICON_MAP[name] : Package;
}

interface StorageAddonsProps {
    subInfo: SubscriptionInfo | null;
    onPurchaseAddon: (addonSlug: string) => Promise<void>;
    addonCatalog?: any[];
}


const StorageAddons: React.FC<StorageAddonsProps> = ({ subInfo, onPurchaseAddon, addonCatalog = [] }) => {
    const { formatPrice, settings } = useSettings();
    const [purchasingSlug, setPurchasingSlug] = useState<string | null>(null);

    // Split catalog into storage and resource groups from API data
    const storageAddons = addonCatalog.filter((a: any) => a.category === 'storage' || a.boostUnit === 'mb');
    const resourceAddons = addonCatalog.filter((a: any) => a.category !== 'storage' && a.boostUnit !== 'mb');

    const handleBuy = async (slug: string) => {
        try {
            setPurchasingSlug(slug);
            await onPurchaseAddon(slug);
        } finally {
            setPurchasingSlug(null);
        }
    };

    const renderAddonCard = (addon: any) => {
        const activeCount = subInfo?.activeAddons?.filter((slug: string) => slug === addon.slug || slug.startsWith(addon.slug + '_')).length ?? 0;
        const isActive = activeCount > 0;
        const isLoading = purchasingSlug === addon.slug;
        const IconComponent = resolveIcon(addon.icon);

        return (
            <div
                key={addon.slug}
                className={`group p-8 rounded-[2rem] border transition-all duration-300 flex flex-col relative ${
                    isActive
                        ? 'bg-brand-50/20 dark:bg-brand-950/20 border-brand-300 dark:border-brand-800 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.06)]'
                        : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 hover:border-slate-350 dark:hover:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1'
                }`}
            >
                {isActive && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md z-10">
                        {activeCount > 1 ? `Active Boost (x${activeCount})` : 'Active Boost'}
                    </div>
                )}

                <div className="mb-6 text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2.5 rounded-2xl ${
                            isActive 
                                ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                            <IconComponent className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{addon.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[40px]">
                        {addon.description}
                    </p>
                </div>

                <div className="flex items-baseline gap-1 mb-6 font-display text-left flex-wrap">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{addon.boostLabel || addon.size}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold ml-2">
                        / {formatPrice(convertAmountToBaseCurrency(addon.price, addon.currency || 'USD', settings))} one-off
                    </span>
                </div>

                <ul className="text-left space-y-3 mb-8 flex-1">
                    {(addon.features || []).map((feature: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-center gap-2.5 text-xs">
                            <div className="text-emerald-500 shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="text-slate-600 dark:text-slate-300 font-bold">{feature}</span>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => handleBuy(addon.slug)}
                    disabled={purchasingSlug !== null}
                    className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest transition-all text-xs flex items-center justify-center gap-2 ${
                        isActive
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white shadow-md'
                    }`}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <PlusCircle className="w-4 h-4" />
                    )}
                    {isActive ? 'Buy Again' : 'Add to Plan'}
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-16 mt-12">
            {/* Section 1: Storage Addons */}
            <section className="space-y-8">
                <div className="flex flex-col gap-1 px-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Need More Storage?</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">Instantly expand your store capacity with storage addons</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {storageAddons.length > 0 ? storageAddons.map(renderAddonCard) : (
                        <p className="col-span-3 text-center text-slate-400 font-medium italic py-8">No storage addons available.</p>
                    )}
                </div>
            </section>

            {/* Section 2: Resource Quota Addons */}
            <section className="space-y-8">
                <div className="flex flex-col gap-1 px-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Expand Plan Quotas</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">Upgrade limits on products, monthly orders, users, and branches</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
                    {resourceAddons.length > 0 ? resourceAddons.map(renderAddonCard) : (
                        <p className="col-span-4 text-center text-slate-400 font-medium italic py-8">No resource addons available.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default React.memo(StorageAddons);
