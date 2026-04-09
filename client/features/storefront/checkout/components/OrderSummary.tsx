"use client";

import React from "react";
import Price from "@/components/shared/Price";
import { Tag, Check, X, Loader2 } from "lucide-react";

interface OrderSummaryProps {
    items: any[];
    summary: {
        subtotal: number;
        offer_discount: number;
        coupon_discount: number;
        tax?: number;
        payable: number;
        appliedCouponCode?: string;
        is_free_shipping?: boolean;
    };
    finalShippingFee: number;
    finalPayable: number;
    couponCode: string;
    onCouponCodeChange: (val: string) => void;
    onApplyCoupon: () => void;
    onRemoveCoupon: () => void;
    couponLoading: boolean;
    loading: boolean;
}

const OrderSummary = React.memo(({
    items,
    summary,
    finalShippingFee,
    finalPayable,
    couponCode,
    onCouponCodeChange,
    onApplyCoupon,
    onRemoveCoupon,
    couponLoading,
    loading
}: OrderSummaryProps) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Order Summary
            </h3>

            <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                    <div key={item.cart_item_id} className="flex gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                            {item.product?.image && (
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                                {item.product?.name}
                            </h4>
                            {item.variant && (
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {item.variant.attributes
                                        .map((attr: any) => attr.value)
                                        .join(", ")}
                                </p>
                            )}
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-slate-500">
                                    Qty: {item.quantity}
                                </span>
                                <Price
                                    amount={item.line_total}
                                    className="text-sm font-bold"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-6 pb-4 mb-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-600" />
                    Coupon Code
                </h4>

                {summary.appliedCouponCode ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-bold text-green-700 dark:text-green-400 font-mono tracking-wider">
                                {summary.appliedCouponCode}
                            </span>
                        </div>
                        <button
                            onClick={onRemoveCoupon}
                            type="button"
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
                            placeholder="Enter code"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-mono uppercase"
                            onKeyDown={(e) => e.key === 'Enter' && onApplyCoupon()}
                        />
                        <button
                            type="button"
                            onClick={onApplyCoupon}
                            disabled={!couponCode.trim() || couponLoading}
                            className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 text-sm flex items-center justify-center min-w-[80px]"
                        >
                            {couponLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Apply"
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <Price amount={summary.subtotal} />
                </div>
                {summary.offer_discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Product Dis.</span>
                        <span>
                            -<Price amount={summary.offer_discount} />
                        </span>
                    </div>
                )}
                {summary.coupon_discount > 0 && (
                    <div className="flex justify-between text-brand-600 font-medium">
                        <span>Coupon Dis.</span>
                        <span>
                            -<Price amount={summary.coupon_discount} />
                        </span>
                    </div>
                )}
                {summary.tax !== undefined && summary.tax > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Tax</span>
                        <span>
                            +<Price amount={summary.tax} />
                        </span>
                    </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Shipping</span>
                    {finalShippingFee === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                    ) : (
                        <span>
                            +<Price amount={finalShippingFee} />
                        </span>
                    )}
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span>Total</span>
                    <Price amount={finalPayable} />
                </div>
            </div>

            <button
                form="checkout-form"
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    "Place Order"
                )}
            </button>
        </div>
    );
});

OrderSummary.displayName = "OrderSummary";
export default OrderSummary;
