"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Price from "@/components/shared/Price";
import { useCart } from "@/hooks/CartContext";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Cart() {
    const { cart, items, updateQuantity, removeItem, loading } = useCart();
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
                <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>
                        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform group-hover:scale-110 transition-transform duration-500">
                            <ShoppingBag className="w-12 h-12 text-blue-600 animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 font-display text-center">Your cart is empty</h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg text-center">
                            Looks like you haven't discovered anything you love yet. Let's change that!
                        </p>
                        <div className="flex justify-center">
                            <Link href="/" className="inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95 group">
                                Start Shopping
                                <Plus className="ml-2 w-5 h-5 group-hover:rotate-90 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const summary = cart?.summary || { subtotal: 0, offer_discount: 0, coupon_discount: 0, tax: 0, payable: 0 };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col selection:bg-blue-100">
            <Navbar />

            <main className="flex-grow pt-28 pb-16">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display italic uppercase">
                            Shopping <span className="text-blue-600 font-bold not-italic">Cart</span>
                        </h1>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => (
                                <div key={item.cart_item_id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow group">
                                    <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                                        {item.product?.image ? (
                                            <Image
                                                src={item.product?.image}
                                                alt={item.product?.name}
                                                fill
                                                priority
                                                unoptimized
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ShoppingBag className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 truncate">
                                                    {item.product?.name}
                                                </h3>
                                                {item.variant && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {item.variant.attributes.map((attr, idx) => (
                                                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                                                {attr.name}: {attr.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <Price amount={item.pricing?.final_price || item.line_total / item.quantity} className="text-lg font-black text-blue-600" />
                                                    {(item.pricing?.base_price || 0) > (item.pricing?.final_price || 0) && (
                                                        <Price amount={item.pricing.base_price} className="text-sm text-slate-400 line-through font-medium" />
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.cart_item_id)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-6">
                                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200/50 dark:border-slate-800">
                                                <button
                                                    onClick={() => updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all active:scale-90"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-sm font-black w-8 text-center text-slate-900 dark:text-white font-mono">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all active:scale-90"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Line Total</p>
                                                <Price amount={item.line_total} className="text-xl font-black text-slate-900 dark:text-white font-display" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 sticky top-28 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 font-display italic uppercase leading-none">
                                    Order <span className="text-blue-600 not-italic">Summary</span>
                                </h2>

                                <div className="space-y-5 mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                                        <Price amount={summary.subtotal} className="font-bold text-slate-700 dark:text-slate-300" />
                                    </div>
                                    
                                    {summary.offer_discount > 0 && (
                                        <div className="flex justify-between items-center group">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                                                Product Discount
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            </span>
                                            <span className="font-bold text-green-600 dark:text-green-400">-<Price amount={summary.offer_discount} /></span>
                                        </div>
                                    )}

                                    {summary.coupon_discount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Coupon Discount</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">-<Price amount={summary.coupon_discount} /></span>
                                        </div>
                                    )}

                                    {(summary.tax || 0) > 0 && (
                                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                            <span className="font-medium">Estimated Tax (VAT)</span>
                                            <Price amount={summary.tax || 0} className="font-bold text-slate-700 dark:text-slate-300" />
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                        <span className="font-medium">Shipping</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">Calculated later</span>
                                    </div>
                                </div>

                                <div className="border-t-2 border-dashed border-slate-100 dark:border-slate-700 pt-6 mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Total</span>
                                        <Price amount={summary.payable || 0} className="text-3xl font-black text-blue-600 font-display" />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => router.push('/checkout')} 
                                    className="w-full py-5 rounded-[1.5rem] bg-blue-600 hover:bg-black dark:hover:bg-white dark:hover:text-black text-white font-black text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-200/50 dark:shadow-none uppercase tracking-widest italic"
                                >
                                    Proceed to Checkout
                                </button>

                                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Secure checkout powered by Stripe
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
