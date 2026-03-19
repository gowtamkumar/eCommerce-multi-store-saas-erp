'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShoppingBag, Tag, Zap, Percent, BadgePercent, Crown, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/CartContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
    promotionType: string;
}

interface Promotion {
    id: string;
    name: string;
    slug: string;
    description?: string;
    promotionType: string;
    value?: number;
    targetType: string;
    minOrderValue?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}

interface PromotionDetailsProps {
    promotion: Promotion;
    products: Product[];
}

// Countdown timer hook (reused from OffersPage)
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
            whileHover={{ y: -4 }}
            className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        >
            <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
                            <span className="text-6xl">📦</span>
                        </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {product.stock <= 0 ? (
                            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow">Out of Stock</span>
                        ) : (
                            discountPct > 0 && (
                                <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow animate-pulse">
                                    🏷️ -{discountPct}% OFF
                                </span>
                            )
                        )}
                    </div>
                </div>

                <div className="flex flex-col flex-grow p-4">
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
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-400'
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

export default function PromotionDetails({ promotion, products }: PromotionDetailsProps) {
    const timeLeft = useCountdown(promotion.endDate);
    const hasEndDate = !!promotion.endDate;
    const isExpiringSoon = hasEndDate && timeLeft.days < 2;

    return (
        <div className="pt-32 pb-24">
            <div className="container mx-auto px-4">
                <Link href="/offers" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to all offers
                </Link>

                {/* Hero Header */}
                <div className={`relative overflow-hidden rounded-3xl mb-12 p-8 md:p-12 ${isExpiringSoon
                    ? 'bg-gradient-to-br from-rose-900 via-orange-800 to-amber-900'
                    : 'bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900'
                    }`}>
                    {/* Glowing background blobs */}
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <PromotionTypeBadge type={promotion.targetType} />
                                {promotion.isActive ? (
                                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/30">
                                        Active Now
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 bg-slate-500/20 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-500/30">
                                        Ended
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                {promotion.name}
                            </h1>
                            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                                {promotion.description || "Grab these limited time deals while they last! Our best prices on premium products."}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {promotion.promotionType === 'percentage' && promotion.value && (
                                    <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px]">
                                        <span className="text-white/60 text-xs font-medium mb-1">Discount</span>
                                        <span className="text-2xl font-bold text-white uppercase">{promotion.value}% OFF</span>
                                    </div>
                                )}
                                {promotion.promotionType === 'fixed_amount' && promotion.value && (
                                    <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px]">
                                        <span className="text-white/60 text-xs font-medium mb-1">Flat Discount</span>
                                        <span className="text-2xl font-bold text-white">{promotion.value} OFF</span>
                                    </div>
                                )}
                                {promotion.minOrderValue && (
                                    <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px]">
                                        <span className="text-white/60 text-xs font-medium mb-1">Min. Purchase</span>
                                        <span className="text-2xl font-bold text-white">{promotion.minOrderValue}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Countdown Timer */}
                        {hasEndDate && (
                            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 flex flex-col items-center">
                                <p className="text-white/60 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    {isExpiringSoon ? 'Hurry! Expiring Soon' : 'Promotion Ends In'}
                                </p>
                                <div className="flex items-center gap-4">
                                    {[
                                        { v: timeLeft.days, l: 'Days' },
                                        { v: timeLeft.hours, l: 'Hrs' },
                                        { v: timeLeft.minutes, l: 'Min' },
                                        { v: timeLeft.seconds, l: 'Sec' },
                                    ].map(({ v, l }) => (
                                        <div key={l} className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                                <span className="text-2xl font-black text-white tabular-nums">
                                                    {String(v).padStart(2, '0')}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest">{l}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-brand-600" />
                        Explore Special Deals ({products.length})
                    </h2>
                </div>

                {products.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Products Available</h3>
                        <p className="text-slate-500">There are currently no active products in this promotion.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {products.map((product) => (
                            <OfferProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
