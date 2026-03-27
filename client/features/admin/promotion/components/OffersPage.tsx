'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShoppingBag, Tag, Zap, Percent, BadgePercent, Crown, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/CartContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { PromotionType } from '@/lib/enums/promotion-type.enum';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountAmount: number;
    images: string[];
    shortDescription?: string;
    stock: number;
    category?: { id: string; name: string; slug: string };
    brand?: { id: string; name: string };
    promoDiscount: number;
    promoDiscountPercentage: number;
    finalPrice: number;
    promotionId: string;
    promotionName: string;
    promotionType: PromotionType;
}

interface Promotion {
    id: string;
    name: string;
    slug: string;
    description?: string;
    promotionType: PromotionType;
    value?: number;
    targetType: string;
    minOrderValue?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}

interface OfferGroup {
    promotion: Promotion;
    products: Product[];
}

interface OffersPageProps {
    offerGroups: OfferGroup[];
    promotions: Promotion[];
}

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

function PromotionTypeBadge({ type }: { type: string }) {
    const configs: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
        specific_product: { label: 'Product Deal', icon: <Package className="w-3 h-3" />, color: 'bg-violet-500' },
        specific_category: { label: 'Category Sale', icon: <Tag className="w-3 h-3" />, color: 'bg-blue-500' },
        specific_brand: { label: 'Brand Offer', icon: <Crown className="w-3 h-3" />, color: 'bg-amber-500' },
        entire_order: { label: 'Sitewide Deal', icon: <Zap className="w-3 h-3" />, color: 'bg-rose-500' },
        minimum_cart_value: { label: 'Cart Bonus', icon: <ShoppingBag className="w-3 h-3" />, color: 'bg-emerald-500' },
    };
    const cfg = configs[type] || { label: 'Offer', icon: <Percent className="w-3 h-3" />, color: 'bg-slate-500' };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${cfg.color} shadow-sm`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

function OfferProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const { settings } = useSettings();
    const currency = settings?.currency || 'BDT';

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock <= 0) return;
        setAdding(true);
        await addToCart(product.id, 1);
        setAdding(false);
    };

    const hasPromoDiscount = product.promoDiscount > 0;
    const displayPrice = hasPromoDiscount ? product.finalPrice : (Number(product.price) - Number(product.discountAmount || 0));
    const originalPrice = Number(product.price);
    const discountPct = product.promoDiscountPercentage || (
        product.discountAmount > 0
            ? Math.round((Number(product.discountAmount) / originalPrice) * 100)
            : 0
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        >
            <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {product.images?.[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
                            <span className="text-6xl">📦</span>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {product.stock <= 0 ? (
                            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow">
                                Out of Stock
                            </span>
                        ) : (
                            <>
                                {discountPct > 0 && (
                                    <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow animate-pulse">
                                        🏷️ -{discountPct}% OFF
                                    </span>
                                )}
                                <PromotionTypeBadge type={product.promotionType} />
                            </>
                        )}
                    </div>

                    {/* Free Shipping Badge */}
                    {product.promotionType === PromotionType.FREE_SHIPPING && (
                        <div className="absolute bottom-3 left-3 right-3 z-10">
                            <span className="w-full inline-block text-center px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow">
                                🚚 FREE SHIPPING
                            </span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col flex-grow p-4">
                    <div className="mb-1 flex items-center gap-2">
                        {product.category && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {product.category.name}
                            </span>
                        )}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {product.name}
                    </h3>

                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                                    {currency} {Number(displayPrice).toLocaleString()}
                                </span>
                                {(hasPromoDiscount || Number(product.discountAmount) > 0) && (
                                    <span className="ml-2 text-xs text-slate-400 line-through">
                                        {currency} {originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {product.stock > 0 && (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleAddToCart}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all shadow-sm ${adding
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-400 hover:text-white dark:hover:text-white'
                                        }`}
                                >
                                    {adding ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <ShoppingBag className="w-4 h-4" />
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function PromotionSection({ group }: { group: OfferGroup }) {
    const timeLeft = useCountdown(group.promotion.endDate);
    const hasEndDate = !!group.promotion.endDate;
    const isExpiringSoon = hasEndDate && timeLeft.days < 2;

    return (
        <section className="mb-16">
            {/* Promotion Header Card */}
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
                    {hasEndDate && (
                        <div className="shrink-0">
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
                        </div>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <AnimatePresence>
                    {group.products.map((product) => (
                        <OfferProductCard key={`${group.promotion.id}-${product.id}`} product={product} />
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}

export default function OffersPage({ offerGroups, promotions }: OffersPageProps) {
    const { settings } = useSettings();
    const offersSettings = settings?.offersPage || {
        bannerShow: true,
        bannerHeadline: "Special Deals & Offers",
        bannerSubheadline: "Save big on our hottest promotions — grab these deals before they're gone!",
        showFilters: true,
        productsPerRow: 5
    };

    const [activeTab, setActiveTab] = useState<string>('all');

    const filteredGroups = activeTab === 'all'
        ? offerGroups
        : offerGroups.filter(g => g.promotion.id === activeTab);

    const totalProducts = offerGroups.reduce((sum, g) => sum + g.products.length, 0);

    const gridCols = {
        2: 'grid-cols-2 lg:grid-cols-2',
        3: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
    }[offersSettings.productsPerRow || 5] || 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

    const bannerStyle = {
        height: offersSettings.bannerShow ? `${offersSettings.bannerHeight || 400}px` : '0px',
        backgroundColor: offersSettings.bannerBackgroundColor || undefined,
        backgroundImage: offersSettings.bannerImage ? `url(${offersSettings.bannerImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: offersSettings.bannerTextColor || '#ffffff'
    };

    return (
        <div className="pt-32 pb-24">
            <div className={`${offersSettings.bannerFullWidth ? 'w-full' : 'container mx-auto px-4'}`}>
                {/* Hero Banner */}
                {offersSettings.bannerShow && (
                    <div
                        style={bannerStyle}
                        className={`relative overflow-hidden ${offersSettings.bannerFullWidth ? '' : 'rounded-3xl'} mb-12 flex flex-col items-center justify-center p-8 md:p-12 text-center ${!offersSettings.bannerBackgroundColor && !offersSettings.bannerImage ? 'bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900' : ''}`}
                    >
                        {/* Glowing background blobs - only show if no image */}
                        {!offersSettings.bannerImage && (
                            <>
                                <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
                            </>
                        )}

                        {/* Overlay for better text readability if there's an image */}
                        {offersSettings.bannerImage && (
                            <div className="absolute inset-0 bg-black/40 z-0" />
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
                                className="text-4xl md:text-6xl font-bold mb-4"
                                style={{ color: 'inherit' }}
                            >
                                {(offersSettings.bannerHeadline || '').includes('🔥') ? (offersSettings.bannerHeadline || '').split(' ')[0] : '🔥'} {(offersSettings.bannerHeadline || '').replace(/🔥/g, '')}
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
                            onClick={() => setActiveTab('all')}
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
                                onClick={() => setActiveTab(group.promotion.id)}
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
                                    {/* Promotion Header Card from PromotionSection (simplified for grid layout adjustment) */}
                                    <PromotionSectionHeader group={group} />

                                    {/* Products Grid */}
                                    <div className={`grid ${gridCols} gap-4`}>
                                        <AnimatePresence>
                                            {group.products.map((product) => (
                                                <OfferProductCard key={`${group.promotion.id}-${product.id}`} product={product} />
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
function PromotionSectionHeader({ group }: { group: OfferGroup }) {
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
                {hasEndDate && (
                    <div className="shrink-0">
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
                    </div>
                )}
            </div>
        </div>
    );
}
