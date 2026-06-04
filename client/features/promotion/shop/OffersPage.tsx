'use client';

import ProductCard, { PromotionTypeBadge } from '@/features/product/components/ProductCard';
import { useSettings } from '@/hooks/SettingsContext';
import { PromotionType } from '@/lib/enums/promotion-type.enum';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BadgePercent, Clock, Package, Percent, Tag, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OfferGroup, OffersPageProps } from '../types';


// Countdown timer hook
function useCountdown(endDate?: string) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!endDate) return;
        const interval = setInterval(() => {
            const end = new Date(endDate).getTime();
            const now = Date.now();
            const diff = end - now;
            if (diff <= 0) {
                clearInterval(interval);
                return;
            }
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    return timeLeft;
}


function PromotionSection({ group }: { group: OfferGroup }) {
    const timeLeft = useCountdown(group.promotion.endDate);
    const hasEndDate = !!group.promotion.endDate;
    const isExpiringSoon = hasEndDate && timeLeft.days < 2;

    return (
        <section className="mb-16">
            {/* Promotion Header Card */}
            <div className={`relative overflow-hidden rounded-[2.5rem] mb-8 p-10 md:p-12 ${isExpiringSoon
                ? 'bg-gradient-to-br from-rose-900 via-orange-800 to-amber-900 text-white'
                : 'bg-slate-50 dark:bg-slate-800/20 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800'
                }`}>
                {/* Glowing background blobs */}
                {!isExpiringSoon && (
                    <>
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl z-0" />
                        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl z-0" />
                    </>
                )}

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <PromotionTypeBadge type={group.promotion.targetType} />
                        </div>
                        <Link href={`/offers/${group.promotion.slug}`} className="group/title inline-block">
                            <h2 className="text-2xl md:text-3xl font-black mb-3 flex items-center gap-2 group-hover/title:text-brand-600 dark:group-hover/title:text-brand-400 transition-colors">
                                {group.promotion.name}
                                <ArrowRight className="w-6 h-6 opacity-0 group-hover/title:opacity-100 group-hover/title:translate-x-1 transition-all" />
                            </h2>
                        </Link>
                        {group.promotion.description && (
                            <p className="opacity-70 text-base font-medium mb-6 max-w-2xl">{group.promotion.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3">
                            {group.promotion.promotionType === PromotionType.PERCENTAGE && group.promotion.value && (
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black border ${isExpiringSoon ? 'bg-white/20 border-white/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                                    <Percent className="w-4 h-4" />
                                    {group.promotion.value}% OFF
                                </span>
                            )}
                            {group.promotion.promotionType === PromotionType.FIXED && group.promotion.value && (
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black border ${isExpiringSoon ? 'bg-white/20 border-white/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                                    <Tag className="w-4 h-4" />
                                    Flat Discount — {group.promotion.value} OFF
                                </span>
                            )}
                            {group.promotion.minOrderValue && (
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black border ${isExpiringSoon ? 'bg-white/20 border-white/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                                    Min. Order: {group.promotion.minOrderValue}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    {hasEndDate && (
                        <div className={`rounded-3xl p-6 border flex flex-col items-center ${isExpiringSoon ? 'bg-white/10 border-white/10 backdrop-blur-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl'}`}>
                            <p className={`text-[10px] font-black mb-4 uppercase tracking-[0.2em] flex items-center gap-2 ${isExpiringSoon ? 'text-white' : 'text-slate-400'}`}>
                                <Clock className={`w-3.5 h-3.5 ${isExpiringSoon ? 'text-amber-400' : 'text-brand-500'}`} />
                                {isExpiringSoon ? 'FLASH DEAL' : 'Time Left'}
                            </p>
                            <div className="flex items-center gap-3">
                                {[
                                    { v: timeLeft.days, l: 'D' },
                                    { v: timeLeft.hours, l: 'H' },
                                    { v: timeLeft.minutes, l: 'M' },
                                    { v: timeLeft.seconds, l: 'S' },
                                ].map(({ v, l }) => (
                                    <div key={l} className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isExpiringSoon ? 'bg-white/10 border-white/10' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-inner'}`}>
                                            <span className="text-lg font-black tabular-nums">
                                                {String(v).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <span className={`text-[9px] mt-2 font-black uppercase opacity-40`}>{l}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                <AnimatePresence>
                    {group.products.map((product) => (
                        <ProductCard key={`${group.promotion.id}-${product.id}`} product={product} />
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}

export default function OffersPage({ offerGroups, promotions, offersSettings: propSettings }: OffersPageProps) {
    const { settings } = useSettings();
    
    // Resolve all settings with fallback values
    const offersSettings = useMemo(() => {
        const base = propSettings ?? settings?.offersPage ?? {};
        return {
            bannerShow: base.bannerShow !== false,
            bannerHeadline: base.bannerHeadline || "Special Deals & Offers",
            bannerSubheadline: base.bannerSubheadline || "Save big on our hottest promotions — grab these deals before they're gone!",
            showFilters: base.showFilters !== false,
            productsPerRow: base.productsPerRow || 5,
            bannerAlignment: base.bannerAlignment || "center",
            bannerOverlayOpacity: base.bannerOverlayOpacity !== undefined ? base.bannerOverlayOpacity : 40,
            bannerHeight: base.bannerHeight || 400,
            bannerFullWidth: !!base.fullWidth || !!base.bannerFullWidth,
            bannerImage: base.bannerImage || "",
            bannerBackgroundColor: base.bannerBackgroundColor || "",
            bannerTextColor: base.bannerTextColor || "",
            countdownStyle: base.countdownStyle || "classic",
            showCartButton: !!base.showCartButton,
            showOriginalPrice: base.showOriginalPrice !== false,
            sortBy: base.sortBy || "ending_soon",
        };
    }, [propSettings, settings?.offersPage]);

    const [activeTab, setActiveTab] = useState<string>('all');

    const handleTabChange = useCallback((id: string) => setActiveTab(id), []);

    // Sort promotions according to administrative preference
    const sortedOfferGroups = useMemo(() => {
        const sorted = [...offerGroups];
        const sortMode = offersSettings.sortBy;
        
        sorted.sort((a, b) => {
            if (sortMode === 'ending_soon') {
                const aEnd = a.promotion.endDate ? new Date(a.promotion.endDate).getTime() : Infinity;
                const bEnd = b.promotion.endDate ? new Date(b.promotion.endDate).getTime() : Infinity;
                return aEnd - bEnd;
            }
            if (sortMode === 'newest') {
                const aTime = a.promotion.createdAt ? new Date(a.promotion.createdAt).getTime() : 0;
                const bTime = b.promotion.createdAt ? new Date(b.promotion.createdAt).getTime() : 0;
                return bTime - aTime;
            }
            if (sortMode === 'discount_desc') {
                const aVal = a.promotion.value || 0;
                const bVal = b.promotion.value || 0;
                return bVal - aVal;
            }
            return 0;
        });
        
        return sorted;
    }, [offerGroups, offersSettings.sortBy]);

    // Apply active filter
    const filteredGroups = useMemo(
        () => activeTab === 'all' ? sortedOfferGroups : sortedOfferGroups.filter(g => g.promotion.id === activeTab),
        [activeTab, sortedOfferGroups]
    );

    const totalProducts = useMemo(
        () => offerGroups.reduce((sum, g) => sum + g.products.length, 0),
        [offerGroups]
    );

    const gridCols = useMemo(() => {
        const colMap: Record<number, string> = {
            2: 'grid-cols-2 lg:grid-cols-2',
            3: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
            5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
            6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
        };
        return colMap[offersSettings.productsPerRow || 5] ?? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    }, [offersSettings.productsPerRow]);

    const bannerAlignClass = useMemo(() => {
        const align = offersSettings.bannerAlignment;
        if (align === 'left') return 'items-start text-left';
        if (align === 'right') return 'items-end text-right';
        return 'items-center text-center';
    }, [offersSettings.bannerAlignment]);

    const bannerStyle = useMemo(() => ({
        height: offersSettings.bannerShow ? `${offersSettings.bannerHeight || 400}px` : '0px',
        backgroundColor: offersSettings.bannerBackgroundColor || undefined,
        backgroundImage: offersSettings.bannerImage ? `url(${offersSettings.bannerImage})` : undefined,
        backgroundSize: 'cover' as const,
        backgroundPosition: 'center',
        color: offersSettings.bannerTextColor || '#ffffff',
    }), [offersSettings]);

    return (
        <div className="pt-32 pb-24">
            <div className={`${offersSettings.bannerFullWidth ? 'w-full' : 'container mx-auto px-4'}`}>
                {/* Hero Banner */}
                {offersSettings.bannerShow && (
                    <div
                        style={bannerStyle}
                        className={`relative overflow-hidden ${offersSettings.bannerFullWidth ? '' : 'rounded-[3rem]'} mb-16 flex flex-col justify-center p-12 md:p-24 ${bannerAlignClass} ${!offersSettings.bannerBackgroundColor && !offersSettings.bannerImage ? 'bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800' : ''}`}
                    >
                        {/* Glowing background blobs - only show if no image */}
                        {!offersSettings.bannerImage && (
                            <>
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl z-0" />
                                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl z-0" />
                            </>
                        )}

                        {/* Overlay with custom opacity support */}
                        {offersSettings.bannerImage && (
                            <div
                                className="absolute inset-0 bg-black z-0 transition-opacity"
                                style={{ opacity: offersSettings.bannerOverlayOpacity / 100 }}
                            />
                        )}

                        <div className="relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-current opacity-80 text-sm font-semibold mb-4"
                            >
                                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                                Limited Time Offers
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight"
                                style={{ color: 'inherit' }}
                            >
                                {(offersSettings.bannerHeadline || '').includes('🔥') ? (offersSettings.bannerHeadline || '').split(' ')[0] : '🔥'} {(offersSettings.bannerHeadline || '').replace(/🔥/g, '') || "Special Offers"}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg max-w-xl mx-auto mb-6 opacity-80"
                                style={{ color: 'inherit' }}
                            >
                                {offersSettings.bannerSubheadline || ''}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center justify-center gap-6 text-sm opacity-60"
                                style={{ color: 'inherit' }}
                            >
                                <span className="flex items-center gap-1.5">
                                    <BadgePercent className="w-4 h-4" />
                                    {promotions.length} Active Promotions
                                </span>
                                <span className="w-px h-4 bg-current opacity-20" />
                                <span className="flex items-center gap-1.5">
                                    <Package className="w-4 h-4" />
                                    {totalProducts} Offer Products
                                </span>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4">
                {/* Promotion Filter Tabs */}
                {offersSettings.showFilters && offerGroups.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        <button
                            onClick={() => handleTabChange('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'all'
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                        >
                            All Offers
                        </button>
                        {offerGroups.map((group) => (
                            <button
                                key={group.promotion.id}
                                onClick={() => handleTabChange(group.promotion.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === group.promotion.id
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-400'
                                    }`}
                            >
                                <Tag className="w-3.5 h-3.5" />
                                {group.promotion.name}
                                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                                    {group.products.length}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Offer Groups */}
                {filteredGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Offers Right Now</h2>
                        <p className="text-slate-500 max-w-sm mb-8">
                            Check back soon! We update our promotional offers regularly.
                        </p>
                        <Link
                            href="/products"
                            className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
                        >
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {filteredGroups.map((group) => (
                                <section key={group.promotion.id} className="mb-16">
                                    {/* Promotion Header Card */}
                                    <PromotionSectionHeader group={group} offersSettings={offersSettings} />

                                    {/* Products Grid */}
                                    <div className={`grid ${gridCols} gap-8`}>
                                        <AnimatePresence>
                                            {group.products.map((product) => (
                                                <ProductCard
                                                    key={`${group.promotion.id}-${product.id}`}
                                                    product={product}
                                                    hideCartButton={!offersSettings.showCartButton}
                                                    hideOriginalPrice={offersSettings.showOriginalPrice === false}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </section>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

// Separate helper for promotion header to keep OffersPage clean
function PromotionSectionHeader({ group, offersSettings }: { group: OfferGroup; offersSettings: any }) {
    const timeLeft = useCountdown(group.promotion.endDate);
    const hasEndDate = !!group.promotion.endDate;
    const isExpiringSoon = hasEndDate && timeLeft.days < 2;

    return (
        <div className={`relative overflow-hidden rounded-2xl mb-6 p-6 ${isExpiringSoon
            ? 'bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500'
            : 'bg-gradient-to-r from-brand-600 via-violet-600 to-purple-700'
            }`}>
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-6 w-48 h-48 rounded-full bg-white/5" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BadgePercent className="w-5 h-5 text-white/80" />
                        <PromotionTypeBadge type={group.promotion.targetType} />
                    </div>
                    <Link href={`/offers/${group.promotion.slug}`} className="group/title">
                        <h2 className="text-xl md:text-2xl font-bold text-white mt-1 flex items-center gap-2 group-hover/title:translate-x-1 transition-transform">
                            {group.promotion.name}
                            <ArrowRight className="w-5 h-5 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                        </h2>
                    </Link>
                    {group.promotion.description && (
                        <p className="text-white/70 text-sm mt-1">{group.promotion.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3">
                        {group.promotion.promotionType === PromotionType.PERCENTAGE && group.promotion.value && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-bold">
                                <Percent className="w-4 h-4" />
                                {group.promotion.value}% OFF
                            </span>
                        )}
                        {group.promotion.promotionType === PromotionType.FIXED && group.promotion.value && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-bold">
                                <Tag className="w-4 h-4" />
                                Flat Discount — {group.promotion.value} OFF
                            </span>
                        )}
                        {group.promotion.promotionType === PromotionType.FREE_SHIPPING && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-bold">
                                🚚 Free Shipping
                            </span>
                        )}
                        {group.promotion.minOrderValue && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-bold">
                                Min. Order: {group.promotion.minOrderValue}
                            </span>
                        )}
                    </div>
                </div>

                {/* Countdown Timer */}
                {hasEndDate && offersSettings.countdownStyle !== 'hidden' && (
                    <div className="shrink-0">
                        {offersSettings.countdownStyle === 'compact' ? (
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-2xl text-white">
                                <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-wider">
                                    Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                                </span>
                            </div>
                        ) : (
                            <>
                                <p className="text-white/60 text-xs font-medium mb-2 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {isExpiringSoon ? '⚡ Expiring Soon!' : 'Ends In'}
                                </p>
                                <div className="flex items-center gap-2">
                                    {[
                                        { v: timeLeft.days, l: 'Days' },
                                        { v: timeLeft.hours, l: 'Hrs' },
                                        { v: timeLeft.minutes, l: 'Min' },
                                        { v: timeLeft.seconds, l: 'Sec' },
                                    ].map(({ v, l }) => (
                                        <div key={l} className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                                <span className="text-xl font-bold text-white tabular-nums">
                                                    {String(v).padStart(2, '0')}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-white/60 mt-1 font-medium">{l}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
