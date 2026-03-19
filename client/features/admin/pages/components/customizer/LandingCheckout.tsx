"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Download, Loader2, ShieldCheck, Truck, CreditCard, Plus, Minus } from "lucide-react";
import { useSettings } from "@/hooks/SettingsContext";
import { PaymentMethod } from "@/lib/enums/payment-method";
import { useDownloadInvoice } from "@/lib/handleDownloadInvoice";
import { fetchAPI } from "@/services/api";
import { getSession, signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Price from "@/components/shared/Price";

import { CheckoutSettings } from "@/types/customizer";

interface LandingCheckoutProps {
  settings?: CheckoutSettings;
  styles?: any;
}

export default function LandingCheckout({ settings, styles }: LandingCheckoutProps) {
  const { selectedCurrency, formatPrice } = useSettings();
  const { data: session } = useSession();
  const { downloadInvoice } = useDownloadInvoice();

  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [localProduct, setLocalProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "sslcommerz">(PaymentMethod.COD as any);
  const [step, setStep] = useState<"form" | "success">("form");
  const [lastOrder, setLastOrder] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch product details if specified in settings
    const fetchProduct = async () => {
      if (settings?.productId) {
        setProductLoading(true);
        try {
          const res = await fetchAPI(`/products/${settings.productId}`);
          setLocalProduct(res.data || res);
        } catch (error) {
          console.error("Failed to fetch landing product", error);
          toast.error("Failed to load product details");
        } finally {
          setProductLoading(false);
        }
      }
    };

    fetchProduct();
  }, [settings?.productId]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "").slice(0, 11);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const summary = localProduct ? {
    subtotal: localProduct.price * quantity,
    offer_discount: (localProduct.discountAmount || 0) * quantity,
    payable: (localProduct.price - (localProduct.discountAmount || 0)) * quantity
  } : { subtotal: 0, offer_discount: 0, coupon_discount: 0, payable: 0 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localProduct) {
      toast.error("Product not loaded");
      return;
    }

    const phoneRegex = /^01\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrors((prev) => ({ ...prev, phone: "Please enter a valid 11-digit number starting with 01" }));
      toast.error("Invalid phone number");
      return;
    }

    setLoading(true);

    try {
      if (!session?.user) {
        try {
          const generatedPassword = `User@${Math.random().toString(36).slice(-8)}!`;
          const username = formData.email.split("@")[0] + Math.floor(Math.random() * 1000);
          await fetchAPI("/auth/register", {
            method: "POST",
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              username: username,
              password: generatedPassword,
            }),
          });
          await signIn("credentials", { username, password: generatedPassword, redirect: false });
          toast.success("Account created automatically!");
        } catch (err: any) {
          console.error("Auto-registration failed", err);
          toast.error(err.message || "Guest checkout failed. Please login.");
          setLoading(false);
          return;
        }
      }

      const getSessions: any = await getSession();

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
        items: [
          {
            productId: localProduct.id,
            quantity: quantity,
            // variants could be added here if needed, but the user didn't request variant selection on landing page yet
          }
        ]
      };

      const orderJson = await fetchAPI("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      if (!orderJson.success) {
        toast.error(orderJson.error || "Failed to create order");
        setLoading(false);
        return;
      }

      if (paymentMethod === (PaymentMethod.SSLCOMMERZ as any)) {
        const paymentJson = await fetchAPI("/payment/init", {
          method: "POST",
          body: JSON.stringify({
            orderId: orderJson.order.id,
            callbackUrl: `${window.location.origin}/api/payment`,
          }),
        });
        if (paymentJson.data.gatewayUrl) {
          window.location.href = paymentJson.data.gatewayUrl;
          return;
        } else {
          throw new Error("Failed to initiate payment gateway");
        }
      } else {
        setLastOrder(orderJson.order);
        setStep("success");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      if (paymentMethod !== (PaymentMethod.SSLCOMMERZ as any)) {
        setLoading(false);
      }
    }
  };

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-700"
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">Order Confirmed!</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Thank you for your purchase. Order ID: <span className="font-mono font-bold">#{lastOrder?.id?.slice(-8).toUpperCase()}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => downloadInvoice(lastOrder)}
            className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" /> Download Invoice
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4" style={{ paddingTop: styles?.paddingTop, paddingBottom: styles?.paddingBottom }}>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-10 md:p-16">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Form Section */}
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-2">
                  {settings?.title || "Complete Your Order"}
                </h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Secure 256-bit SSL encrypted checkout</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                    <input
                      name="name" required value={formData.name} onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
                    <input
                      name="email" type="email" required value={formData.email} onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
                  <input
                    name="phone" type="tel" required value={formData.phone} onChange={handleInputChange}
                    className={`w-full px-5 py-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400 ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                    placeholder="017XXXXXXXX"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1 ml-1">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Shipping Address</label>
                  <textarea
                    name="address" required value={formData.address} onChange={handleInputChange} rows={2}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                    placeholder="Area, Street, City"
                  />
                </div>

                <div className="pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 mb-3 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button" onClick={() => setPaymentMethod(PaymentMethod.COD)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === PaymentMethod.COD ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-400' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'}`}
                    >
                      <Truck className="w-6 h-6" />
                      <span className="font-bold text-sm">COD</span>
                    </button>
                    <button
                      type="button" onClick={() => setPaymentMethod(PaymentMethod.SSLCOMMERZ)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === PaymentMethod.SSLCOMMERZ ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-400' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'}`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="font-bold text-sm">Online</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full mt-6 py-4 bg-brand-600 hover:bg-brand-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-brand-500/30 hover:shadow-brand-500/40 disabled:opacity-70 flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (settings?.buttonText || "Order Now")}
                </button>
              </form>
            </div>

            {/* Summary Section */}
            {(settings?.showProductSummary !== false) && (
              <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Summary</h3>
                <div className="space-y-4 mb-8">
                  {productLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                  ) : localProduct ? (
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex-shrink-0 p-1 overflow-hidden">
                        {localProduct.images?.[0] ? (
                          <img
                            src={localProduct.images[0]}
                            alt={localProduct.name}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              (e.target as any).src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{localProduct.name}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <Price amount={(localProduct.price - (localProduct.discountAmount || 0)) * quantity} className="text-sm font-bold text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      No product selected
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <Price amount={summary.subtotal} className="font-medium text-slate-900 dark:text-white" />
                  </div>
                  {summary.offer_discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Discount</span>
                      <span className="text-green-600 font-medium">-<Price amount={summary.offer_discount} /></span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span className="text-slate-900 dark:text-white font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                    <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">Total</span>
                    <Price amount={summary.payable} className="text-xl font-black text-brand-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
