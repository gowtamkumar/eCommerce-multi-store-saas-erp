"use client";

import Price from "@/components/ui/Price";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { Eye, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  product: any;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, openCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  // Fallback for missing images
  const imageSrc = product.images?.[0] || "";
  const hasImage = !!imageSrc;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
    // openCart is called automatically by addToCart via context, 
    // but we can ensure visual feedback here if needed.
  };

  const discountPercentage = product.discountAmount > 0
    ? Math.round((product.discountAmount / (product.price + product.discountAmount)) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-500 hover:shadow-2xl"
        whileHover={{ y: -8 }}
      >
        {/* Product Image */}
        {hasImage ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
            <span className="text-6xl">📦</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.stock <= 0 ? (
            <span className="px-3 py-1 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
              Out of Stock
            </span>
          ) : (
            <>
              {discountPercentage > 0 && (
                <span className="px-3 py-1 bg-brand-600/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                  -{discountPercentage}%
                </span>
              )}
              {/* You might want a 'New' badge logic here */}
            </>
          )}
        </div>

        {/* Action Overlay */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} flex items-center justify-center gap-4`}>
          {/* Quick View / Details (Redundant with link but good for UI) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
            transition={{ delay: 0.1 }}
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur text-slate-900 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
          >
            <Eye className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Add to Cart Floating Button */}
        {product.stock > 0 && (
          <motion.button
            onClick={handleAddToCart}
            className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all z-20 focus:outline-none focus:ring-2 focus:ring-brand-500 ${adding
              ? "!bg-green-500 text-white"
              : "bg-white text-slate-900 hover:bg-brand-600 hover:text-white"
              }`}
            whileTap={{ scale: 0.9 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
          >
            {adding ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </motion.button>
        )}
      </motion.div>

      {/* Product Details */}
      <div className="pt-4 px-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
          {product.category?.name || 'Collection'}
        </p>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <Price
            amount={product.price}
            className="text-xl font-bold text-slate-900 dark:text-white"
            showOriginal={product.discountAmount > 0}
            originalAmount={+product.price + +product.discountAmount}
          />
        </div>
      </div>
    </Link>
  );
}
