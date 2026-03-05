"use client";

import Price from "@/components/shared/Price";
import { useCart } from "@/hooks/CartContext";
import { useSettings } from "@/hooks/SettingsContext";
import { PaymentMethod } from "@/lib/enums/payment-method";
import { useDownloadInvoice } from "@/lib/handleDownloadInvoice";
import { fetchAPI } from "@/services/api";
import * as cartApi from "@/services/cart";
import { motion } from "framer-motion";
import {
    Check,
    CreditCard,
    Download,
    Loader2,
    ShieldCheck,
    ShoppingBag,
    Tag,
    Truck,
    X,
} from "lucide-react";
import { getSession, signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";

export default function Checkout() {
    const {
        cart,
        items,
        loading: cartLoading,
        applyCoupon,
        removeCoupon,
    } = useCart();
    const { selectedCurrency, formatPrice } = useSettings();
    const { data: session, status: sessionStatus } = useSession();
    const { downloadInvoice } = useDownloadInvoice();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "sslcommerz">(
        PaymentMethod.COD as any,
    );
    const [step, setStep] = useState<"form" | "success">("form");
    const [lastOrder, setLastOrder] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
    });
    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update form data when session loads
    useEffect(() => {
        if (session?.user) {
            setFormData((prev) => ({
                ...prev,
                name: session.user?.name || "",
                email: session.user?.email || "",
                phone: session.user?.phone || "",
                address: session.user?.address || "",
            }));
        }
    }, [session]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        // Sanitize phone input: allow only digits and limit to 11
        if (name === "phone") {
            const cleaned = value.replace(/\D/g, "").slice(0, 11);
            setFormData((prev) => ({ ...prev, [name]: cleaned }));

            // Clear error as user types
            if (errors.phone) {
                setErrors((prev) => ({ ...prev, phone: "" }));
            }
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear other errors
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const summary = cart?.summary || {
        subtotal: 0,
        offer_discount: 0,
        coupon_discount: 0,
        payable: 0,
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        // Phone validation
        const phoneRegex = /^01\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            setErrors((prev) => ({
                ...prev,
                phone: "Please enter a valid 11-digit number starting with 01",
            }));
            toast.error("Invalid phone number");
            return;
        }

        setLoading(true);

        try {
            // const currentSession = session;
            // Guest Checkout Logic: Auto-Register if no session
            if (!session?.user) {
                try {
                    const generatedPassword = `User@${Math.random().toString(36).slice(-8)}!`;
                    const username =
                        formData.email.split("@")[0] + Math.floor(Math.random() * 1000);

                    // Register
                    await fetchAPI("/auth/register", {
                        method: "POST",
                        body: JSON.stringify({
                            name: formData.name,
                            email: formData.email,
                            username: username,
                            password: generatedPassword,
                        }),
                    });

                    // Login to get token
                    const loginResult = await signIn("credentials", {
                        username: username,
                        password: generatedPassword,
                        redirect: false,
                    });

                    console.log("loginResult", loginResult);


                    if (loginResult?.error) {
                        throw new Error(
                            "Account created but failed to auto-login. Please login to continue.",
                        );
                    }

                    // Let's inform the user gently
                    toast.success("Account created automatically!");
                    localStorage.removeItem("temp_cart");
                } catch (err: any) {
                    console.error("Auto-registration failed", err);
                    // If registration failed (e.g. email exists), we interrupt
                    toast.error(err.message || "Guest checkout failed. Please login.");
                    setLoading(false);
                    return;
                }
            }

            // Sync Cart to Backend to ensure latest prices/stock are used for validation
            const syncItems = items.map((item) => ({
                productId: item.product.id,
                variantId: item.variant?.id,
                quantity: item.quantity,
            }));
            await cartApi.syncCart(syncItems);

            const getSessions: any = await getSession()

            const orderData = {
                userId: getSessions.user.id,
                customerName: formData.name,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                address: formData.address,
                orderNotes: formData.notes,
                paymentMethod,
                currency: selectedCurrency.code,
                currencyRate: selectedCurrency.rate,
            };

            // 1. Create Order
            const orderJson = await fetchAPI("/orders", {
                method: "POST",
                body: JSON.stringify(orderData),
            });


            if (!orderJson.success) {
                toast.error(orderJson.error || "Failed to create order");
                setLoading(false);
                return;
            }

            const order = orderJson.order;
            console.log("order", order);


            if (paymentMethod === (PaymentMethod.SSLCOMMERZ as any)) {
                // 2. Initiate Payment
                const paymentJson = await fetchAPI("/payment/init", {
                    method: "POST",
                    body: JSON.stringify({
                        orderId: order.id,
                        callbackUrl: `${window.location.origin}/api/payment`,
                    }),
                });

                if (paymentJson.data.gatewayUrl) {
                    // await clearCart();
                    window.location.href = paymentJson.data.gatewayUrl;
                    return;
                } else {
                    throw new Error("Failed to initiate payment gateway");
                }
            } else {
                // COD Success
                setLastOrder(order);
                setStep("success");
            }
            localStorage.removeItem("temp_cart");
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            if (paymentMethod !== (PaymentMethod.SSLCOMMERZ as any)) {
                setLoading(false);
            }
        }
    };

    if (cartLoading && items.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            await applyCoupon(couponCode);
            setCouponCode("");
        } finally {
            setCouponLoading(false);
        }
    };

    if (items.length === 0 && step === "form") {
        return (
            <>
                <Navbar />
                <div className="min-h-screen pt-32 pb-12 bg-slate-50 dark:bg-slate-900 px-4">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Your cart is empty
                        </h1>
                        <p className="text-slate-500 mb-8">
                            Add some items to your cart to proceed to checkout.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                </div>
                <Footer />
                <WhatsAppWidget />
            </>
        );
    }

    if (step === "success") {
        return (
            <>
                <Navbar />
                <div className="min-h-screen pt-32 pb-12 bg-slate-50 dark:bg-slate-900 px-4 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-xl p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 font-display">
                            Order Confirmed!
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-10">
                            Thank you for your purchase. Your order ID is{" "}
                            <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                {lastOrder?.id?.slice(0, 8)}
                            </span>
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => downloadInvoice(lastOrder)}
                                className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download Invoice
                            </button>
                            <Link
                                href="/"
                                className="block w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <Footer />
                <WhatsAppWidget />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-24 pb-12 bg-slate-50 dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                        Checkout
                    </h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 md:p-8">
                                <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-green-500" />
                                        Secure Checkout
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Please fill in your details to complete your order.
                                    </p>
                                </div>

                                <form
                                    id="checkout-form"
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Contact Info */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Full Name
                                            </label>
                                            <input
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Email Address
                                            </label>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Phone Number
                                            </label>
                                            <input
                                                name="phone"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all ${errors.phone
                                                    ? "border-red-500 focus:ring-red-500"
                                                    : "border-slate-200 dark:border-slate-700"
                                                    }`}
                                                placeholder="017XXXXXXXX"
                                            />
                                            {errors.phone && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Shipping Address
                                            </label>
                                            <input
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                placeholder="123 Main St, City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Order Notes (Optional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            rows={3}
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                            placeholder="Special instructions for delivery..."
                                        />
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="space-y-3 pt-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Payment Method
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod(PaymentMethod.COD)}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${paymentMethod === PaymentMethod.COD
                                                    ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                                                    }`}
                                            >
                                                {paymentMethod === PaymentMethod.COD && (
                                                    <motion.div
                                                        layoutId="activePaymentCheckout"
                                                        className="absolute inset-0 border-2 border-brand-600 rounded-xl pointer-events-none"
                                                    />
                                                )}
                                                <Truck className="w-6 h-6" />
                                                <span className="font-semibold text-sm">
                                                    Cash on Delivery
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPaymentMethod(PaymentMethod.SSLCOMMERZ)
                                                }
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${paymentMethod === PaymentMethod.SSLCOMMERZ
                                                    ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                                                    }`}
                                            >
                                                {paymentMethod === PaymentMethod.SSLCOMMERZ && (
                                                    <motion.div
                                                        layoutId="activePaymentCheckout"
                                                        className="absolute inset-0 border-2 border-brand-600 rounded-xl pointer-events-none"
                                                    />
                                                )}
                                                <CreditCard className="w-6 h-6" />
                                                <span className="font-semibold text-sm">
                                                    Online Payment
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
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
                                                        className="object-cover"
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
                                                            .map((attr) => attr.value)
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

                                    {cart?.appliedCouponCode ? (
                                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                <span className="text-sm font-bold text-green-700 dark:text-green-400 font-mono tracking-wider">
                                                    {cart.appliedCouponCode}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeCoupon()}
                                                type="button"
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                title="Remove Coupon"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter code"
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-mono uppercase"
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
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
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <span>Total</span>
                                        <Price amount={summary.payable} />
                                    </div>
                                </div>

                                <button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        "Place Order"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <WhatsAppWidget />
        </>
    );
}
