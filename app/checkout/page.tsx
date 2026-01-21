"use client";

import Price from "@/components/Price";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { fetchAPI } from "@/lib/api";
import { PaymentMethod } from "@/lib/enums/payment-method";
import { useDownloadInvoice } from "@/lib/handleDownloadInvoice";
import { motion } from "framer-motion";
import { Check, CreditCard, Download, Loader2, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function CheckoutPage() {
  const { cart, items, updateQuantity, removeItem, clearCart, loading: cartLoading } = useCart();
  const { selectedCurrency, formatPrice } = useSettings();
  const { data: session } = useSession();
  const { downloadInvoice } = useDownloadInvoice();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'sslcommerz'>('cod');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [lastOrder, setLastOrder] = useState<any>(null);

  const subtotal = items.reduce((acc, item) => {
    return acc + (item.product?.price || 0) * item.quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);

    const orderData = {
      customerName: formData.get('name'),
      customerEmail: formData.get('email'),
      customerPhone: formData.get('phone'),
      address: formData.get('address'),
      orderNotes: formData.get('notes'),
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      paymentMethod,
      currency: selectedCurrency.code,
      currencyRate: selectedCurrency.rate,
    };

    try {
      // 1. Create Order
      const orderJson = await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (!orderJson.success) {
        toast.error(orderJson.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      const order = orderJson.order;

      if (paymentMethod === PaymentMethod.SSLCOMMERZ) {
        // 2. Initiate Payment
        const paymentJson = await fetchAPI('/payment/init', {
          method: 'POST',
          body: JSON.stringify({ orderId: order.id }),
        });

        if (paymentJson.gatewayUrl) {
          // Verify if we need to clear cart before redirecting? 
          // Usually better to clear after success, but here we redirect.
          // Let's clear locally as "Checkout in progress".
          await clearCart();
          window.location.href = paymentJson.gatewayUrl;
          return;
        } else {
          throw new Error('Failed to initiate payment gateway');
        }
      } else {
        // COD Success
        setLastOrder(order);
        await clearCart();
        setStep('success');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      if (paymentMethod !== PaymentMethod.SSLCOMMERZ) {
        setLoading(false);
      }
    }
  };

  if (cartLoading && items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    )
  }

  if (items.length === 0 && step === 'form') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 pb-12 bg-slate-50 dark:bg-slate-900 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h1>
            <p className="text-slate-500 mb-8">Add some items to your cart to proceed to checkout.</p>
            <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
        <WhatsAppWidget />
      </>
    )
  }

  if (step === 'success') {
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
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 font-display">Order Confirmed!</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-10">
              Thank you for your purchase. Your order ID is <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{lastOrder?.id?.slice(0, 8)}</span>
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 md:p-8">
                <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    Secure Checkout
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Please fill in your details to complete your order.</p>
                </div>

                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        name="name"
                        required
                        defaultValue={session?.user?.name || ''}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        required
                        defaultValue={session?.user?.email || ''}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                      <input
                        name="phone"
                        type="tel"
                        required
                        defaultValue={session?.user?.phone || ''}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Shipping Address</label>
                      <input
                        name="address"
                        required
                        defaultValue={session?.user?.address || ''}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="123 Main St, City, Country"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Order Notes (Optional)</label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      placeholder="Special instructions for delivery..."
                    />
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3 pt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod(PaymentMethod.COD)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${paymentMethod === PaymentMethod.COD
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                          }`}
                      >
                        {paymentMethod === PaymentMethod.COD && (
                          <motion.div layoutId="activePaymentCheckout" className="absolute inset-0 border-2 border-brand-600 rounded-xl pointer-events-none" />
                        )}
                        <Truck className="w-6 h-6" />
                        <span className="font-semibold text-sm">Cash on Delivery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod(PaymentMethod.SSLCOMMERZ)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${paymentMethod === PaymentMethod.SSLCOMMERZ
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                          }`}
                      >
                        {paymentMethod === PaymentMethod.SSLCOMMERZ && (
                          <motion.div layoutId="activePaymentCheckout" className="absolute inset-0 border-2 border-brand-600 rounded-xl pointer-events-none" />
                        )}
                        <CreditCard className="w-6 h-6" />
                        <span className="font-semibold text-sm">Online Payment</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 sticky top-24">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h3>

                <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                        {item.product?.images?.[0] && (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{item.product?.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                          <Price amount={(item.product?.price || 0) * item.quantity} className="text-sm font-bold" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <Price amount={subtotal} />
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span>Total</span>
                    <Price amount={subtotal} />
                  </div>
                </div>

                <button
                  form="checkout-form"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Place Order"}
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
