"use client";

import Price from "@/components/shared/Price";
import { useCart } from "@/hooks/CartContext";
import { useWishlist } from "@/hooks/WishlistContext";
import { useSettings } from "@/hooks/SettingsContext";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Tag, Zap, Percent, Crown, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { calculatePricing } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  priority?: boolean;
  viewMode?: 'grid' | 'list';
  className?: string;
  cardRadius?: 'small' | 'large' | 'none';
}

export function PromotionTypeBadge({ type }: { type: string }) {
  const configs: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    specific_product: { label: 'Product Deal', icon: <Package className="w-3 h-3" />, color: 'bg-violet-500' },
    specific_category: { label: 'Category Sale', icon: <Tag className="w-3 h-3" />, color: 'bg-blue-500' },
    specific_brand: { label: 'Brand Offer', icon: <Crown className="w-3 h-3" />, color: 'bg-amber-500' },
    entire_order: { label: 'Sitewide Deal', icon: <Zap className="w-3 h-3" />, color: 'bg-rose-500' },
    minimum_cart_value: { label: 'Cart Bonus', icon: <ShoppingBag className="w-3 h-3" />, color: 'bg-emerald-500' },
  };
  const cfg = configs[type] || { label: 'Offer', icon: <Percent className="w-3 h-3" />, color: 'bg-slate-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${cfg.color} shadow-lg shadow-${cfg.color.replace('bg-', '')}/30 backdrop-blur-md`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function ProductCard({
  product,
  priority = false,
  viewMode = 'grid',
  className = "",
  cardRadius
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { settings } = useSettings();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);

  const currency = settings?.currency || 'BDT';
  const isWishlisted = isInWishlist(product.id);




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

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisting(true);
    await toggleWishlist(product.id);
    setWishlisting(false);
  };

  const { finalPrice, discountAmount } = calculatePricing(
    Number(product.price || 0),
    Number(product.discountAmount || 0),
    product.discountType || 'fixed',
    Number(product.taxRate || 0)
  );

  console.log("finalPrice", finalPrice);


  const basePrice = Number(product.price || 0);
  const discountPercentage = discountAmount > 0 && basePrice > 0
    ? Math.round((discountAmount / basePrice) * 100)
    : 0;

  // Promotions labels
  const hasPromo = product.applicablePromotions && product.applicablePromotions.length > 0;
  const mainPromo = hasPromo ? product.applicablePromotions[0] : null;

  // Design tokens
  const radius = cardRadius === 'small' ? 'rounded-xl' :
    cardRadius === 'none' ? 'rounded-none' : 'rounded-[2rem]';

  const imageRadius = cardRadius === 'small' ? 'rounded-lg' :
    cardRadius === 'none' ? 'rounded-none' : 'rounded-[1.5rem]';

  return (
    <motion.div
      layout
      className={`group relative flex bg-white dark:bg-slate-900 ${radius} overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 h-full ${viewMode === 'list' ? 'flex-row h-72' : 'flex-col'} ${className}`}
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full w-full">
        {/* Image Container */}
        <div className={`relative overflow-hidden bg-slate-50 dark:bg-slate-950 p-3 ${viewMode === 'list' ? 'w-72 h-full shrink-0' : 'aspect-[4/5] w-full'}`}>
          <div className={`relative w-full h-full overflow-hidden ${imageRadius} bg-white dark:bg-slate-900 shadow-inner`}>
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-200 dark:text-slate-800">
                <ShoppingBag className="w-20 h-20 opacity-10" />
              </div>
            )}

            {/* Quick View Link (Visual Only) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
              <div className="px-6 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest shadow-2xl translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                Explore Product
              </div>
            </div>
          </div>

          {/* Badges Container */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-10 pointer-events-none">
            {Number(product.stock) <= 0 ? (
              <span className="bg-slate-900/90 backdrop-blur-xl text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-xl border border-white/10">
                Sold Out
              </span>
            ) : (
              <>
                {discountPercentage > 0 && (
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-xl border border-white/20">
                    {discountPercentage}% OFF
                  </span>
                )}
                {mainPromo && (
                  <PromotionTypeBadge type={mainPromo.targetType} />
                )}
              </>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlisting}
            className={`absolute top-6 right-6 z-20 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-500 shadow-xl border ${isWishlisted
              ? "bg-rose-500 border-rose-400 text-white"
              : "bg-white/80 dark:bg-slate-900/80 border-white/20 text-slate-900 dark:text-white hover:scale-110 active:scale-95"
              }`}
          >
            {wishlisting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : "group-hover:scale-110 transition-transform"}`} />
            )}
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 flex flex-col flex-1 relative">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] line-clamp-1">
                {product.category?.name || 'Collection'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] line-clamp-1">
                {product.brand?.name || 'Exclusive'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-[1.4] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300 line-clamp-2">
              {product.name}
            </h3>

            {(product.shortDescription || product.description) && (
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4 opacity-70">
                {product.shortDescription || product.description?.replace(/<[^>]*>?/gm, '')}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800/50 mt-auto">
            <div className="flex flex-col">
              <Price
                amount={finalPrice}
                className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"
                showOriginal={discountAmount > 0}
                originalAmount={basePrice}
              />
              {mainPromo && (
                <span className="text-[9px] font-black text-brand-600 dark:text-brand-400 mt-1 uppercase tracking-wider">
                  {mainPromo.name} Applied
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {Number(product.stock) > 0 && (
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${adding
                    ? "bg-slate-100 dark:bg-slate-900 text-slate-300"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-500 hover:text-white dark:hover:text-white hover:-translate-y-1 active:scale-95"
                    }`}
                >
                  {adding ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingBag className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
