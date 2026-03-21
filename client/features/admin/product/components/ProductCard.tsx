"use client";

import Price from "@/components/shared/Price";
import { useCart } from "@/hooks/CartContext";
import { motion } from "framer-motion";
import { ArrowUpDown, Eye, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { calculatePricing } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  priority?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, priority = false, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  // Fallback for missing images
  const imageSrc = product.images?.[0] || "";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, redirect to product page to select variants
    if (product.variants && product.variants.length > 0) {
      router.push(`/products/${product.slug}`);
      return;
    }

    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
  };

  const { finalPrice, discountAmount } = calculatePricing(
    Number(product.price || 0),
    Number(product.discountAmount || 0),
    product.discountType || 'fixed',
    Number(product.taxRate || 0)
  );

  const discountAmt = discountAmount;
  const basePrice = Number(product.price || 0);
  const discountPercentage = discountAmt > 0 && basePrice > 0 ? Math.round((discountAmt / basePrice) * 100) : 0;

  const validPromotions = product.applicablePromotions?.filter((p: any) => p.isActive);

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group relative flex bg-white dark:bg-slate-800/50 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 h-full ${viewMode === 'list' ? 'flex-row h-52' : 'flex-col'}`}
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden bg-slate-50 dark:bg-slate-900/80 ${viewMode === 'list' ? 'w-52 h-full shrink-0' : 'aspect-[4/5] w-full'}`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
            <ShoppingBag className="w-12 h-12 opacity-20" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.stock <= 0 ? (
            <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
              Sold Out
            </span>
          ) : (
            <>
              {discountPercentage > 0 && (
                <span className="bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  {discountPercentage}% OFF
                </span>
              )}
              {validPromotions && validPromotions.length > 0 && (
                <span className="bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  {validPromotions[0].name}
                </span>
              )}
            </>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 dark:text-white shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col justify-between flex-1 relative bg-white dark:bg-transparent">
        <div>
          <div className="flex items-center justify-between mb-3 text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">
            {product.category?.name || 'Collection'}
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-brand-600 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
            {product.shortDescription || product.description?.replace(/<[^>]*>?/gm, '')}
          </p>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800 mt-auto">
          <Price
            amount={finalPrice}
            className="text-xl font-black text-slate-900 dark:text-white"
            showOriginal={discountAmt > 0}
            originalAmount={basePrice}
          />

          <div className="flex items-center gap-2">
            {product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${adding
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-400 hover:text-white dark:hover:text-white"
                  }`}
              >
                {adding ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
              </button>
            )}
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs group/btn">
              <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center group-hover/btn:bg-brand-600 group-hover/btn:text-white transition-all">
                <ArrowUpDown className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
