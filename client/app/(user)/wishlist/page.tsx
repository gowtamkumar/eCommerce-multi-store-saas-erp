"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Price from "@/components/shared/Price";
import { useCart } from "@/hooks/CartContext";
import { useWishlist } from "@/hooks/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSettings } from "@/hooks/SettingsContext";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, loading, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const { data: session, status } = useSession();
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
      // Optional: remove from wishlist after adding to cart? 
      // User didn't specify, but it's a common pattern. 
      // I'll keep it in wishlist for now unless they ask.
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-brand-600 dark:text-brand-400 font-black text-xs uppercase tracking-[0.3em]">
              <Heart className="w-4 h-4 fill-current" />
              Your Collection
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              Wishlist
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
          {wishlist.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your entire wishlist?")) {
                  clearWishlist();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-500 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear Wishlist
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800/50 rounded-[2.5rem] p-6 space-y-4 animate-pulse">
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {wishlist.map((item) => {
                const product = item.product;
                const {
                  base_price: basePrice,
                  discount: discountAmount,
                  tax: taxAmount,
                  final_price: finalPrice,
                } = item.pricing;

                return (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="group relative bg-white dark:bg-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500"
                  >
                    {/* Remove Action */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-900 flex items-center justify-center transition-all shadow-sm"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      className="block aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900"
                    >
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <ShoppingBag className="w-16 h-16" />
                        </div>
                      )}
                    </Link>

                    <div className="p-8">
                      <div className="mb-4">
                        <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2 block">
                          {product.category?.name || "Collection"}
                        </span>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <Price
                          amount={finalPrice}
                          className="text-2xl font-black text-slate-900 dark:text-white"
                          showOriginal={discountAmount > 0}
                          originalAmount={Number(basePrice) + Number(product.taxRate || 0)}
                        />

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={addingToCart === product.id || product.stock <= 0}
                          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${addingToCart === product.id
                            ? "bg-slate-100 text-slate-400 dark:bg-slate-800"
                            : product.stock <= 0
                              ? "bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed"
                              : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-400 hover:text-white dark:hover:text-white shadow-lg active:scale-95"
                            }`}
                        >
                          {addingToCart === product.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : product.stock <= 0 ? (
                            "Out of Stock"
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : status === "unauthenticated" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white dark:bg-slate-800/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700"
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 text-slate-200 dark:text-slate-700">
              <Heart className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Login to see your wishlist</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 font-medium">
              Save your favorite items and access them across all your devices by logging into your account.
            </p>
            <Link
              href="/login?callbackUrl=/wishlist"
              className="group flex items-center gap-3 bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white dark:bg-slate-800/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700"
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 text-slate-200 dark:text-slate-700">
              <Heart className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Your wishlist is empty</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 font-medium">
              Explore our premium collection and save your favorite items for later.
            </p>
            <Link
              href="/products"
              className="group flex items-center gap-3 bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )
        }
      </main>

      <Footer />
    </div>
  );
}
