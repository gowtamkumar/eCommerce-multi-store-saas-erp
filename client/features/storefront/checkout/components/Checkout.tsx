"use client";

import { useCart } from "@/hooks/CartContext";
import { useSettings } from "@/hooks/SettingsContext";
import { PaymentMethod } from "@/lib/enums/payment-method.enum";
import { useDownloadInvoice } from "@/lib/handleDownloadInvoice";
import { calculateShippingFee } from "@/lib/utils";
import { fetchAPI } from "@/services/api";
import * as cartApi from "@/services/cart";
import { motion } from "framer-motion";
import { Check, Download, Loader2, ShoppingBag } from "lucide-react";
import { getSession, signIn, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ShippingZoneType } from "@/lib/enums/shipping-zone-type.enum";
import type { ShippingAddress } from "@/services/shippingAddress";
import * as shippingAddressApi from "@/services/shippingAddress";

// Sub-components
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";

export default function Checkout() {
    const {
        cart,
        items,
        loading: cartLoading,
        applyCoupon,
        removeCoupon,
    } = useCart();
    const { selectedCurrency, settings } = useSettings();
    const { data: session } = useSession();
    const { downloadInvoice } = useDownloadInvoice();

    // UI State
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"form" | "success">("form");
    const [lastOrder, setLastOrder] = useState<any>(null);

    // Form & Address State
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
    const [shippingZone, setShippingZone] = useState<ShippingZoneType>(ShippingZoneType.INSIDE);
    const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [addingNewAddress, setAddingNewAddress] = useState(false);
    const [saveNewAddress, setSaveNewAddress] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);

    const [newAddressForm, setNewAddressForm] = useState({
        label: 'Home',
        recipientName: '',
        phone: '',
        address: '',
        city: '',
        zone: ShippingZoneType.INSIDE,
    });

    const [formData, setFormData] = useState({
        email: "",
        notes: "",
    });

    // 1. Initial Data Loading
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({ ...prev, email: session.user?.email || "" }));
            setNewAddressForm(prev => ({
                ...prev,
                recipientName: session.user?.name || '',
                phone: session.user?.phone || ''
            }));

            shippingAddressApi.getShippingAddresses().then(addresses => {
                setSavedAddresses(addresses);
                if (addresses.length > 0) {
                    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                    setSelectedAddressId(defaultAddr.id);
                    setShippingZone((defaultAddr.zone as any) || ShippingZoneType.INSIDE);
                } else {
                    setAddingNewAddress(true);
                }
            }).catch(() => setAddingNewAddress(true));
        } else {
            setAddingNewAddress(true);
        }
    }, [session]);

    // 2. Optimized Calculations
    const summary = useMemo(() => cart?.summary || {
        subtotal: 0,
        offer_discount: 0,
        coupon_discount: 0,
        tax: 0,
        payable: 0,
        is_free_shipping: false,
    }, [cart?.summary]);

    const finalShippingFee = useMemo(() =>
        summary.is_free_shipping ? 0 : calculateShippingFee(shippingZone, settings?.shippingConfig, summary.payable)
        , [shippingZone, settings?.shippingConfig, summary.payable, summary.is_free_shipping]);

    const finalPayable = useMemo(() => summary.payable + finalShippingFee, [summary.payable, finalShippingFee]);

    // 3. Stable Handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleNewAddressChange = useCallback((field: string, value: any) => {
        setNewAddressForm(prev => ({ ...prev, [field]: value }));
        if (field === 'zone') setShippingZone(value);
    }, []);

    const handleAddressSelect = useCallback((id: string, zone: ShippingZoneType) => {
        setSelectedAddressId(id);
        setAddingNewAddress(false);
        setShippingZone(zone);
    }, []);

    const handleApplyCoupon = useCallback(async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            await applyCoupon(couponCode);
            setCouponCode("");
        } finally {
            setCouponLoading(false);
        }
    }, [couponCode, applyCoupon]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0 || loading) return;

        if (addingNewAddress && !/^01\d{9}$/.test(newAddressForm.phone)) {
            toast.error("Invalid phone number");
            return;
        }

        setLoading(true);
        try {
            // Auto-register for guests
            if (!session?.user) {
                const generatedPassword = `User@${Math.random().toString(36).slice(-8)}!`;
                const username = formData.email.split("@")[0] + Math.floor(Math.random() * 1000);

                await fetchAPI("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({
                        name: newAddressForm.recipientName,
                        email: formData.email,
                        username: username,
                        password: generatedPassword,
                    }),
                });

                const loginResult = await signIn("credentials", {
                    username: username,
                    password: generatedPassword,
                    redirect: false,
                });

                if (loginResult?.error) throw new Error("Auto-login failed. Please login manually.");
                toast.success("Account created automatically!");
            }

            // Sync Cart
            const syncItems = items.map(item => ({
                productId: item.product.id,
                variantId: item.variant?.id,
                quantity: item.quantity,
            }));
            await cartApi.syncCart(syncItems);

            const currentSession: any = await getSession();
            const orderData: any = {
                userId: currentSession?.user?.id,
                customerEmail: formData.email,
                orderNotes: formData.notes,
                paymentMethod,
                currency: selectedCurrency.code,
                currencyRate: selectedCurrency.rate,
                shippingZone,
            };

            if (selectedAddressId && !addingNewAddress) {
                const addr = savedAddresses.find(a => a.id === selectedAddressId);
                if (addr) {
                    orderData.shippingAddressId = selectedAddressId;
                    orderData.customerName = addr.recipientName;
                    orderData.customerPhone = addr.phone;
                    orderData.address = addr.address;
                }
            } else {
                if (!newAddressForm.address || !newAddressForm.recipientName || !newAddressForm.phone) {
                    throw new Error('Please fill in all address fields');
                }
                orderData.address = newAddressForm.address;
                orderData.customerName = newAddressForm.recipientName;
                orderData.customerPhone = newAddressForm.phone;

                if (saveNewAddress && session?.user) {
                    const saved = await shippingAddressApi.createShippingAddress({
                        ...newAddressForm,
                        isDefault: savedAddresses.length === 0,
                    });
                    if (saved?.id) orderData.shippingAddressId = saved.id;
                }
            }

            const orderJson = await fetchAPI("/orders", { method: "POST", body: JSON.stringify(orderData) });
            if (!orderJson.success) throw new Error(orderJson.error || "Failed to create order");

            const order = orderJson.data?.order;
            if (paymentMethod === PaymentMethod.SSLCOMMERZ) {
                const paymentJson = await fetchAPI("/payment/init", {
                    method: "POST",
                    body: JSON.stringify({ orderId: order.id, callbackUrl: `${window.location.origin}/api/payment` }),
                });
                if (paymentJson.data.gatewayUrl) {
                    window.location.href = paymentJson.data.gatewayUrl;
                    return;
                }
                throw new Error("Failed to initiate payment");
            } else {
                setLastOrder(order);
                setStep("success");
                localStorage.removeItem("temp_cart");
            }
        } catch (error: any) {
            toast.error(error.message || "Checkout failed");
        } finally {
            if (paymentMethod !== PaymentMethod.SSLCOMMERZ) setLoading(false);
        }
    };

    if (cartLoading && items.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (items.length === 0 && step === "form") {
        return (
            <>
                <Navbar />
                <div className="min-h-screen pt-32 pb-12 bg-slate-50 dark:bg-slate-900 px-4">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cart is empty</h1>
                        <p className="text-slate-500 mb-8">Add components to your cart to proceed.</p>
                        <Link href="/" className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (step === "success") {
        return (
            <>
                <Navbar />
                <div className="min-h-screen pt-32 pb-12 bg-slate-50 dark:bg-slate-900 px-4 flex items-center justify-center">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-xl p-8 text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }} className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 font-display">Order Confirmed!</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-10">
                            Order ID: <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{lastOrder?.id?.slice(0, 8)}</span>
                        </p>
                        <div className="space-y-3">
                            <button onClick={() => downloadInvoice(lastOrder)} className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
                                <Download className="w-5 h-5" /> Download Invoice
                            </button>
                            <Link href="/" className="block w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                Continue Shopping
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <Footer />
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
                        <div className="lg:col-span-2">
                            <CheckoutForm
                                session={session}
                                formData={formData}
                                onInputChange={handleInputChange}
                                savedAddresses={savedAddresses}
                                selectedAddressId={selectedAddressId}
                                onAddressSelect={handleAddressSelect}
                                addingNewAddress={addingNewAddress}
                                onToggleNewAddress={setAddingNewAddress}
                                newAddressForm={newAddressForm}
                                onNewAddressChange={handleNewAddressChange}
                                saveNewAddress={saveNewAddress}
                                onToggleSaveAddress={setSaveNewAddress}
                                paymentMethod={paymentMethod}
                                onPaymentMethodChange={setPaymentMethod}
                                onSubmit={handleSubmit}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <OrderSummary
                                items={items}
                                summary={summary}
                                finalShippingFee={finalShippingFee}
                                finalPayable={finalPayable}
                                couponCode={couponCode}
                                onCouponCodeChange={setCouponCode}
                                onApplyCoupon={handleApplyCoupon}
                                onRemoveCoupon={removeCoupon}
                                couponLoading={couponLoading}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
