'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { fetchAPI } from '@/lib/api';
import { Product, Review } from '@/types/product';
import { ArrowLeft, Calendar, Coins, Edit, Package, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';





export default function ProductReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const { settings, formatPrice } = useSettings();

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
                import('react-hot-toast').then(t => t.default.error('Failed to load data'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleReviewAction = async (reviewId: string, action: 'approved' | 'rejected' | 'delete') => {
        try {
            if (action === 'delete') {
                const res = await fetchAPI(`/reviews/${reviewId}`, { method: 'DELETE' });
                if (res.success) {
                    setReviews(reviews.filter(r => r.id !== reviewId));
                    import('react-hot-toast').then(t => t.default.success('Review deleted'));
                }
            } else {
                const res = await fetchAPI(`/reviews/${reviewId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: action }),
                });
                if (res.success) {
                    setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: action } : r));
                    import('react-hot-toast').then(t => t.default.success(`Review ${action}`));
                }
            }
        } catch (error) {
            import('react-hot-toast').then(t => t.default.error('Action failed'));
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

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">Product not found.</p>
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


    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Products
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Product Review & Feedback</h1>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Product
                    </Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Left Column - Images */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="aspect-square relative bg-slate-100 dark:bg-slate-900">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Package className="w-24 h-24 text-slate-300 dark:text-slate-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Thumbnails */}
                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                        ? 'border-brand-600 ring-2 ring-brand-200 dark:ring-brand-800'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
                                        }`}
                                >
                                    <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column - Product Info Preview */}
                <div className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{product.name}</h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <Coins className="w-8 h-8 text-green-600 dark:text-green-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Net Price</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatPrice((product.price || 0) - (product.discountAmount || 0))}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Stock</p>
                                    <p className="text-xl font-bold text-blue-600">{product.stock}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${product.status === 'active'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700'
                                    }`}
                            >
                                {product.status}
                            </span>
                        </div>

                        {/* Additional Product Details */}
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            {product.sku && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">SKU:</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{product.sku}</span>
                                </div>
                            )}

                            {product.category && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Category:</span>
                                    <span className="px-2 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-lg font-medium text-xs">{product.category.name}</span>
                                </div>
                            )}

                            {product.discountAmount && product.discountAmount > 0 && (
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Pricing Details</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Base Price:</span>
                                            <span className="line-through text-slate-500">{formatPrice(product.price)}</span>
                                        </div>
                                        <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                                            <span>Discount:</span>
                                            <span>-{formatPrice(product.discountAmount)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-green-600 dark:text-green-400 pt-1 border-t border-red-200 dark:border-red-800">
                                            <span>Final Price:</span>
                                            <span>{formatPrice(product.price - product.discountAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.description && (
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Description</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Product Attributes & Variants Section */}
            {((product.attributes && product.attributes.length > 0) || (product.variants && product.variants.length > 0)) && (
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Attributes */}
                    {product.attributes && product.attributes.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-brand-500" />
                                Product Attributes
                            </h3>
                            <div className="space-y-4">
                                {product.attributes.map((attr, idx) => (
                                    <div key={idx} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3 last:pb-0">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                            {attr.name}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {attr.values.map((value, vidx) => (
                                                <span
                                                    key={vidx}
                                                    className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium border border-brand-100 dark:border-brand-800"
                                                >
                                                    {value}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-brand-500" />
                                Product Variants ({product.variants.length})
                            </h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {product.variants.map((variant, idx) => (
                                    <div
                                        key={variant.id || idx}
                                        className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex-1">
                                                <p className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
                                                    SKU: {variant.sku}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                    {Object.entries(variant.combination).map(([key, value]) => (
                                                        <span
                                                            key={key}
                                                            className="text-xs px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-medium text-slate-700 dark:text-slate-300"
                                                        >
                                                            {key}: <span className="font-bold">{value}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xs font-bold px-2 py-1 rounded ${variant.stock > 0
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    Stock: {variant.stock}
                                                </p>
                                            </div>
                                        </div>
                                        {variant.price && (
                                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                                <Coins className="w-4 h-4 text-green-500" />
                                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                                    {formatPrice(variant.price)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Customer Reviews Moderation Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-brand-500" />
                        Customer Feedback
                    </h2>
                    <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-400">
                        {reviews.length} Total Reviews
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    {reviews.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Tag className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400">No reviews found for this product.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600 font-bold uppercase">
                                                    {review.customerName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{review.customerName}</h4>
                                                    <p className="text-xs text-slate-500">{review.customerEmail}</p>
                                                </div>
                                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-md ml-2">
                                                    <span className="text-xs font-bold text-yellow-600">{review.rating}</span>
                                                    <Coins className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                </div>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                                {review.comment}
                                            </p>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                                <span>Submitted on {new Date(review.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className={`${review.status === 'approved' ? 'text-green-500' :
                                                    review.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                                                    }`}>
                                                    Status: {review.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {review.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleReviewAction(review.id, 'approved')}
                                                        className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReviewAction(review.id, 'rejected')}
                                                        className="px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {review.status === 'approved' && (
                                                <button
                                                    onClick={() => handleReviewAction(review.id, 'rejected')}
                                                    className="px-3 py-1.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            {review.status === 'rejected' && (
                                                <button
                                                    onClick={() => handleReviewAction(review.id, 'approved')}
                                                    className="px-3 py-1.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleReviewAction(review.id, 'delete')}
                                                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                                title="Delete permanently"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Reuse some existing icons or define missing ones
const XCircle = ({ className, title }: { className?: string, title?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
