"use client";

import Price from "@/components/shared/Price";
import { useCart } from "@/hooks/CartContext";
import { useWishlist } from "@/hooks/WishlistContext";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart, Loader2, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const WishlistComponent = () => {
    const { wishlist, removeFromWishlist, loading, refreshWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { status } = useSession();
    const [addingToCart, setAddingToCart] = useState<string | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            refreshWishlist();
        }
    }, [status]);

    const handleAddToCart = async (product: any) => {
        setAddingToCart(product.id);
        try {
            await addToCart(product.id, 1);
        } finally {
            setAddingToCart(null);
        }
    };

    if (loading && wishlist.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800/50 rounded-3xl p-4 space-y-4 animate-pulse border border-slate-100 dark:border-slate-800">
                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 text-slate-200 dark:text-slate-800">
                    <Heart className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium">
                    You haven't saved any items yet. Start exploring our premium collection!
                </p>
                <Link
                    href="/products"
                    className="flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                >
                    Explore Products
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Saved Items</h3>
                    <p className="text-slate-500 text-sm font-medium">{wishlist.length} products in your wishlist</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600">
                    <Heart className="w-5 h-5 fill-current" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {wishlist.map((item) => {
                        const product = item.product;
                        const pricing = item.pricing || {};
                        const {
                            final_price: finalPrice = 0,
                            base_price: basePrice = 0,
                            discount: discountAmount = 0
                        } = pricing;

                        return (
                            <motion.div
                                key={item.productId}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative bg-white dark:bg-slate-800/40 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300"
                            >
                                {/* Quick Remove */}
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-400 hover:text-red-500 flex items-center justify-center transition-all shadow-sm"
                                    title="Remove"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                <Link href={`/products/${product.slug}`} className="block aspect-square relative overflow-hidden bg-slate-50 dark:bg-slate-900">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <ShoppingBag className="w-12 h-12" />
                                        </div>
                                    )}
                                </Link>

                                <div className="p-5">
                                    <div className="mb-3">
                                        <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1 block">
                                            {product.category?.name || "Product"}
                                        </span>
                                        <Link href={`/products/${product.slug}`}>
                                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition-colors">
                                                {product.name}
                                            </h4>
                                        </Link>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <Price
                                            amount={finalPrice}
                                            className="text-lg font-black text-slate-900 dark:text-white"
                                            showOriginal={discountAmount > 0}
                                            originalAmount={Number(basePrice) + (Number(product.taxRate) || 0)}
                                        />

                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={addingToCart === product.id || product.stock <= 0}
                                            className={`p-2.5 rounded-xl transition-all ${addingToCart === product.id
                                                ? "bg-slate-100 text-slate-400 dark:bg-slate-700"
                                                : product.stock <= 0
                                                    ? "bg-slate-100 text-slate-400 dark:bg-slate-700 cursor-not-allowed"
                                                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-400 hover:text-white dark:hover:text-white shadow-lg active:scale-90"
                                                }`}
                                            title="Add to Cart"
                                        >
                                            {addingToCart === product.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <ShoppingCart className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WishlistComponent;
