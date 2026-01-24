"use client";

import Price from "@/components/ui/Price";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, items, updateQuantity, removeItem, loading } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your cart is empty</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const summary = cart?.summary || { subtotal: 0, offer_discount: 0, coupon_discount: 0, payable: 0 };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.cart_item_id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm flex gap-6">
                <div className="relative w-24 h-24 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden">
                  {item.product?.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {item.product?.name}
                      </h3>
                      {item.variant && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {item.variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <Price amount={item.line_total} className="text-lg font-bold text-slate-900 dark:text-white" />
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.cart_item_id)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <Price amount={summary.subtotal} />
                </div>
                {summary.offer_discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-<Price amount={summary.offer_discount} /></span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mb-8">
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <Price amount={summary.payable} />
                </div>
              </div>

              <button onClick={() => router.push('/checkout')} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
