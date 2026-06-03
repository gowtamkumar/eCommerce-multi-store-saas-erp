'use client';

import React, { useState } from 'react';
import { HardDrive, CheckCircle2, PlusCircle, Loader2, Package, ShoppingCart, Users, MapPin } from 'lucide-react';
import { SubscriptionInfo } from '../../type';

interface StorageAddonsProps {
    subInfo: SubscriptionInfo | null;
    onPurchaseAddon: (addonSlug: string) => Promise<void>;
}

interface AddonItem {
    slug: string;
    name: string;
    size: string;
    price: number;
    description: string;
    features: string[];
    icon?: any;
}

const STORAGE_ADDONS: AddonItem[] = [
    {
        slug: 'addon_storage_5gb',
        name: 'Lite Storage Boost',
        size: '+5 GB',
        price: 5,
        description: 'Perfect for small stores uploading standard product photos and documents.',
        features: ['5,120 MB Storage Space', 'High-speed MinIO hosting', 'Instant activation', 'Cancel anytime'],
        icon: HardDrive
    },
    {
        slug: 'addon_storage_10gb',
        name: 'Growth Storage Boost',
        size: '+10 GB',
        price: 9,
        description: 'Ideal for growing businesses with rich catalogs and product collections.',
        features: ['10,240 MB Storage Space', 'High-speed MinIO hosting', 'Instant activation', 'Cancel anytime'],
        icon: HardDrive
    },
    {
        slug: 'addon_storage_20gb',
        name: 'Pro Storage Boost',
        size: '+20 GB',
        price: 15,
        description: 'Designed for large retailers with thousands of high-res photos and receipts.',
        features: ['20,480 MB Storage Space', 'High-speed MinIO hosting', 'Instant activation', 'Cancel anytime'],
        icon: HardDrive
    }
];

const RESOURCE_ADDONS: AddonItem[] = [
    {
        slug: 'addon_products_1000',
        name: 'Catalog Boost',
        size: '+1,000 SKUs',
        price: 15,
        description: 'Expand your catalog capacity by adding 1,000 more products and variations.',
        features: ['1,000 product capability', 'Immediate synchronization', 'Plan-independent override', 'One-off activation'],
        icon: Package
    },
    {
        slug: 'addon_orders_5000',
        name: 'Transactions Boost',
        size: '+5,000 Orders',
        price: 25,
        description: 'Increase monthly order limits by 5,000/mo to handle sales spikes and campaigns.',
        features: ['5,000 extra monthly orders', 'Dynamic threshold update', 'Prevents checkout locks', 'One-off activation'],
        icon: ShoppingCart
    },
    {
        slug: 'addon_staff_10',
        name: 'Collaborators Boost',
        size: '+10 Staff',
        price: 20,
        description: 'Invite up to 10 additional staff members, managers, or warehouse assistants.',
        features: ['10 team accounts', 'Granular role assignments', 'Global branch scoping', 'One-off activation'],
        icon: Users
    },
    {
        slug: 'addon_locations_3',
        name: 'Logistics Expansion Boost',
        size: '+3 Loc / WH',
        price: 35,
        description: 'Add 3 branches and 3 warehouses to expand physical operations and supply chain.',
        features: ['3 physical branches', '3 warehouse inventories', 'Multi-source stock routing', 'One-off activation'],
        icon: MapPin
    }
];

const StorageAddons: React.FC<StorageAddonsProps> = ({ subInfo, onPurchaseAddon }) => {
    const [purchasingSlug, setPurchasingSlug] = useState<string | null>(null);

    const handleBuy = async (slug: string) => {
        try {
            setPurchasingSlug(slug);
            await onPurchaseAddon(slug);
        } finally {
            setPurchasingSlug(null);
        }
    };

    const renderAddonCard = (addon: AddonItem) => {
        const isActive = subInfo?.activeAddons?.includes(addon.slug) ?? false;
        const isLoading = purchasingSlug === addon.slug;
        const IconComponent = addon.icon || HardDrive;

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
                        Active Boost
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

                <div className="flex items-baseline gap-1 mb-6 font-display text-left">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{addon.size}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold ml-2">/ ${addon.price} one-off</span>
                </div>

                <ul className="text-left space-y-3 mb-8 flex-1">
                    {addon.features.map((feature, fIdx) => (
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
                    disabled={purchasingSlug !== null || isActive}
                    className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest transition-all text-xs flex items-center justify-center gap-2 ${
                        isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 cursor-default'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white shadow-md'
                    }`}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isActive ? (
                        <CheckCircle2 className="w-4 h-4" />
                    ) : (
                        <PlusCircle className="w-4 h-4" />
                    )}
                    {isActive ? 'Activated' : 'Add to Plan'}
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
                    {STORAGE_ADDONS.map(renderAddonCard)}
                </div>
            </section>

            {/* Section 2: Resource Quota Addons */}
            <section className="space-y-8">
                <div className="flex flex-col gap-1 px-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Expand Plan Quotas</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">Upgrade limits on products, monthly orders, users, and branches</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
                    {RESOURCE_ADDONS.map(renderAddonCard)}
                </div>
            </section>
        </div>
    );
};

export default React.memo(StorageAddons);
