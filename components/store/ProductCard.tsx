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
    console.log("add card", product);

    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
  };

  const discountPercentage = product.discountAmount > 0
    ? Math.round((product.discountAmount / (product.price + product.discountAmount)) * 100)
    : 0;


  console.log("product", product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
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
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.stock <= 0 ? (
            <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
              Out of Stock
            </span>
          ) : (
            <>
              {discountPercentage > 0 && (
                <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                  -{discountPercentage}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Overlay Actions */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Quick View Button (Center) */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
            className="pointer-events-auto"
          >
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-sm font-semibold text-slate-900 dark:text-white shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
              <Eye className="w-4 h-4" />
              Quick View
            </button>
          </motion.div>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow p-4">
        <div className="mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {product.category?.name || 'Collection'}
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <Price
            amount={product.price}
            className="text-lg font-bold text-slate-900 dark:text-white"
            showOriginal={product.discountAmount > 0}
            originalAmount={+product.price + +product.discountAmount}
          />

          {/* Add to Cart Button */}
          {product.stock > 0 && (
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.9 }}
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
            </motion.button>
          )}
        </div>
      </div>
    </Link>
  );
}
