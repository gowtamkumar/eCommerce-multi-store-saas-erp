'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { ReviewStatus } from '@/lib/enums/review-status.enum';
import { fetchAPI } from '@/services/api';
import { Product, Review } from '@/types/product';
import {
    ArrowLeft,
    Calendar,
    Coins,
    Edit,
    Package,
    Tag,
    Star,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Layers,
    Eye,
    Image as ImageIcon,
    ChevronRight,
    ShieldCheck,
    TrendingDown,
    Info
} from 'lucide-react';
import { calculatePricing } from '@/lib/utils';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DiscountType } from '@/lib/enums/discount-type.enum';

export default function ProductReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product>({} as Product);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const { formatPrice } = useSettings();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const [productRes, reviewsRes] = await Promise.all([
                    fetchAPI(`/products/${id}`),
                    fetchAPI(`/products/${id}/reviews`)
                ]);


                if (productRes.success && productRes.data) {
                    setProduct(productRes.data);
                }
                if (reviewsRes.success && reviewsRes.data) {
                    setReviews(reviewsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch product data:', error);
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleReviewAction = async (reviewId: string, action: ReviewStatus | 'delete') => {
        try {
            if (action === 'delete') {
                const res = await fetchAPI(`/reviews/${reviewId}`, { method: 'DELETE' });
                if (res.success) {
                    setReviews(reviews.filter(r => r.id !== reviewId));
                    toast.success('Review deleted');
                }
            } else {
                const res = await fetchAPI(`/reviews/${reviewId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: action }),
                });
                if (res.success) {
                    setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: action } : r));
                    toast.success(`Review ${action}`);
                }
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!product || !product.id) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-4 text-center">Product not found.</p>
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    const mainPricing = calculatePricing(
        Number(product.price || 0),
        Number(product.discountAmount || 0),
        product.discountType || DiscountType.FIXED,
        Number(product.taxRate || 0)
    );

    const netPrice = mainPricing.finalPrice;

    const discountPercentage = product.discountType === DiscountType.PERCENTAGE
        ? Number(product.discountAmount)
        : (product.price > 0 ? Math.round((Number(product.discountAmount) / product.price) * 100) : 0);

    const totalStock = product.variants && product.variants.length > 0
        ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
        : (product.stock || 0);

    const isLowStock = totalStock <= (product.lowStockThreshold || 5) && totalStock > 0;
    const isOutOfStock = totalStock === 0;

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4">
            {/* Header Sticky Bar */}
            <div className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 py-4 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/products"
                            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 hover:text-brand-600 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                                <Link href="/admin/products" className="hover:text-brand-600">Products</Link>
                                <ChevronRight className="w-3 h-3" />
                                <span>Detail View</span>
                            </div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {product.name}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:shadow-md transition-all"
                        >
                            <Eye className="w-4 h-4" />
                            View Site
                        </Link>
                        <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Product
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Coins className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pricing</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{formatPrice(netPrice)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory</p>
                        <div className="flex items-center gap-2">
                            <p className="text-xl font-black text-slate-900 dark:text-white">{totalStock} Units</p>
                            {isOutOfStock ? (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black uppercase rounded-lg">Out of Stock</span>
                            ) : isLowStock ? (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black uppercase rounded-lg">Low Stock</span>
                            ) : (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase rounded-lg">Healthy</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reviews</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{reviews.length} Feedbacks</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${product.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                        {product.status === 'active' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visibility</p>
                        <p className={`text-xl font-black uppercase ${product.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>{product.status}</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 mb-12">
                {/* Left Side - Visuals and Relations (5 columns) */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Media Gallery */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-4">
                        <div className="aspect-square relative bg-slate-50 dark:bg-slate-900 rounded-[2rem] overflow-hidden mb-4 group">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                    <ImageIcon className="w-16 h-16 mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">No Images</p>
                                </div>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-20 h-20 relative rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === index
                                            ? 'border-brand-600 shadow-lg scale-105'
                                            : 'border-transparent opacity-40 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={image} alt={`thumb ${index}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Promotions */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                            <TrendingDown className="w-5 h-5 text-rose-500" />
                            Active Promotions
                        </h3>
                        {product.applicablePromotions && product.applicablePromotions.length > 0 ? (
                            <div className="space-y-4">
                                {product.applicablePromotions.map((promo: any) => (
                                    <div key={promo.id} className="p-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-50">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{promo.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{promo.promotionType} Benefit</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-rose-600">{promo.value}{promo.promotionType === 'percentage' ? '%' : ''} OFF</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400">
                                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-bold tracking-widest uppercase">No active campaigns</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Information and Variants (7 columns) */}
                <div className="lg:col-span-7 space-y-8">
                    {/* General Info & Pricing Detail */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <Info className="w-5 h-5 text-blue-500" />
                                Core Information
                            </h3>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-black uppercase text-slate-500">{product.category?.name || 'Uncategorized'}</span>
                                {product.brand && <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-[10px] font-black uppercase text-brand-600">{product.brand.name}</span>}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">


                                {product.supplier && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Supplier / Vendor</p>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{product.supplier.name}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Analytics</p>
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Tax Rate:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{product.taxRate || 0}% (Involved)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Stock Threshold:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{product.lowStockThreshold || 5} Units</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pricing Breakdown</p>
                                <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center opacity-60">
                                            <span className="text-xs font-bold uppercase tracking-wider">Base Price</span>
                                            <span className="text-sm font-black">{formatPrice(product.price || 0)}</span>
                                        </div>

                                        {mainPricing.discountAmount > 0 && (
                                            <div className="flex justify-between items-center text-rose-400">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold uppercase tracking-wider">Discount</span>
                                                    <span className="text-[10px] opacity-70">
                                                        {product.discountType === DiscountType.PERCENTAGE ? `${product.discountAmount}%` : 'Fixed Amount'}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-black">-{formatPrice(Number(product.price || 0) - mainPricing.discountedPrice)}</span>
                                            </div>
                                        )}

                                        {mainPricing.taxAmount > 0 && (
                                            <div className="flex justify-between items-center text-blue-300">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold uppercase tracking-wider">Total Tax</span>
                                                    <span className="text-[10px] opacity-70">Rate: {product.taxRate || 0}%</span>
                                                </div>
                                                <span className="text-sm font-black">+{formatPrice(mainPricing.taxAmount)}</span>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-1">Final Market Price</p>
                                                <p className="text-3xl font-black text-brand-400">{formatPrice(netPrice)}</p>
                                            </div>
                                            {discountPercentage > 0 && (
                                                <div className="px-3 py-1 bg-brand-500/20 text-brand-400 text-[10px] font-black rounded-full border border-brand-500/30">
                                                    {discountPercentage}% OFF
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {product.description && (
                            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Content Preview</p>
                                <div
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                    className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-h-48 overflow-y-auto pr-4"
                                />
                            </div>
                        )}
                    </div>

                    {/* Variants Section */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                                <Layers className="w-5 h-5 text-indigo-500" />
                                Inventory Variants ({product.variants.length})
                            </h3>
                            <div className="overflow-x-auto -mx-8 px-8">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <th className="pb-4 pl-4 pr-4">Identity</th>
                                            <th className="pb-4 pr-4">Configuration</th>
                                            <th className="pb-4 pr-4">Available</th>
                                            <th className="pb-4 pr-4">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="space-y-4">
                                        {product.variants.map((variant, idx) => (
                                            <tr key={variant.id || idx} className="group bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                                                <td className="py-4 pl-4 rounded-l-2xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
                                                            {variant.images?.[0] ? <img src={variant.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon className="w-4 h-4" /></div>}
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{variant.sku}</p>
                                                            {variant.isDefault && <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase">Default</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(variant.combination).map(([k, v]) => (
                                                            <span key={k} className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-600 font-bold">
                                                                {k}: {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${variant.stock === 0 ? 'bg-rose-500 animate-pulse' : variant.stock <= (product.lowStockThreshold || 5) ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                        <div className="flex flex-col">
                                                            <span className={`text-xs font-black ${variant.stock === 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                {variant.stock} Units
                                                            </span>
                                                            {variant.stock === 0 && (
                                                                <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">Replenish Needed</span>
                                                            )}
                                                            {variant.stock > 0 && variant.stock <= (product.lowStockThreshold || 5) && (
                                                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Low Inventory</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4 rounded-r-2xl">
                                                    {(() => {
                                                        const vp = calculatePricing(
                                                            Number(variant.price || product.price || 0),
                                                            Number(product.discountAmount || 0),
                                                            product.discountType || DiscountType.FIXED,
                                                            Number(product.taxRate || 0)
                                                        );
                                                        return (
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-brand-600">{formatPrice(vp.finalPrice)}</span>
                                                                {(variant.price || product.price) !== vp.finalPrice && (
                                                                    <span className="text-[9px] text-slate-400 line-through opacity-50">{formatPrice(variant.price || product.price)}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Moderation List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-brand-500" />
                        Community Feedback
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reviews.length} Insights Shared</p>
                </div>

                <div className="grid gap-6">
                    {reviews?.length === 0 ? (
                        <div className="py-24 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <TrendingDown className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">No consumer data yet</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8 hover:shadow-xl transition-all group overflow-hidden relative">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0 text-center space-y-3">
                                        <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/10 rounded-[2rem] flex items-center justify-center text-3xl font-black text-brand-600 border border-brand-100 dark:border-brand-900/30">
                                            {review.user?.name?.charAt(0)}
                                        </div>
                                        <div className="flex items-center justify-center gap-1">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />)}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-0.5">{review.user?.name}</h4>
                                                <p className="text-xs font-bold text-slate-400">{review.user?.email}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${review.status === ReviewStatus.APPROVED ? 'bg-green-50 text-green-600 border border-green-100' :
                                                    review.status === ReviewStatus.REJECTED ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}>
                                                    {review.status}
                                                </span>
                                                <p className="text-[10px] font-black text-slate-300 uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl italic">"{review.comment}"</p>

                                        <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-slate-50 dark:border-slate-700/50">
                                            {review.status !== ReviewStatus.APPROVED && (
                                                <button
                                                    onClick={() => handleReviewAction(review.id, ReviewStatus.APPROVED)}
                                                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-emerald-500/10"
                                                >
                                                    Approve Entry
                                                </button>
                                            )}
                                            {review.status !== ReviewStatus.REJECTED && (
                                                <button
                                                    onClick={() => handleReviewAction(review.id, ReviewStatus.REJECTED)}
                                                    className="px-6 py-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all hover:-translate-y-0.5 active:scale-95"
                                                >
                                                    Terminate
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleReviewAction(review.id, 'delete')}
                                                className="ml-auto p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Hard Delete"
                                            >
                                                <XCircle className="w-5 h-5 stroke-[2.5]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
