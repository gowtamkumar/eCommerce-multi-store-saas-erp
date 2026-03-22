"use client";

import { useCart } from "@/hooks/CartContext";
import { ShoppingBag } from "lucide-react";
import Price from "./Price";

const FloatingCartWidget = () => {
  const { cart, items, isCartOpen, openCart } = useCart();

  const summary = cart?.summary || { payable: 0 };
  
  if (isCartOpen) return null;

  return (
    <button
      onClick={openCart}
      className="fixed z-40 right-0 top-1/2 -translate-y-1/2 shadow-xl rounded-l-xl flex flex-col items-center cursor-pointer transition-transform hover:-translate-x-1 overflow-hidden font-sans border border-r-0 border-brand-500/20 group"
      aria-label="Open cart"
    >
      <div className="bg-brand-600 group-hover:bg-brand-500 transition-colors px-3 py-3 flex flex-col items-center gap-1 w-full min-w-[70px] sm:min-w-[80px]">
        <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-white opacity-90" />
        <span className="text-[11px] sm:text-xs font-bold italic text-white tracking-widest uppercase mt-1">
          {items.length} item{items.length !== 1 && 's'}
        </span>
      </div>
      <div className="bg-brand-700 group-hover:bg-brand-600 transition-colors w-full py-2 px-2 text-center flex items-center justify-center">
        <Price amount={summary.payable || 0} className="text-[13px] sm:text-sm font-bold text-white tracking-wider" />
      </div>
    </button>
  );
};

export default FloatingCartWidget;
