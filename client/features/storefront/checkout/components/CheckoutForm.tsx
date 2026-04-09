"use client";

import React from "react";
import { ShieldCheck, MapPin, Plus, Truck, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { PaymentMethod } from "@/lib/enums/payment-method.enum";
import { ShippingZoneType } from "@/lib/enums/shipping-zone-type.enum";
import type { ShippingAddress } from "@/services/shippingAddress";

interface CheckoutFormProps {
    session: any;
    formData: {
        email: string;
        notes: string;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    savedAddresses: ShippingAddress[];
    selectedAddressId: string | null;
    onAddressSelect: (id: string, zone: ShippingZoneType) => void;
    addingNewAddress: boolean;
    onToggleNewAddress: (val: boolean) => void;
    newAddressForm: any;
    onNewAddressChange: (field: string, value: any) => void;
    saveNewAddress: boolean;
    onToggleSaveAddress: (val: boolean) => void;
    paymentMethod: PaymentMethod;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const CheckoutForm = React.memo(({
    session,
    formData,
    onInputChange,
    savedAddresses,
    selectedAddressId,
    onAddressSelect,
    addingNewAddress,
    onToggleNewAddress,
    newAddressForm,
    onNewAddressChange,
    saveNewAddress,
    onToggleSaveAddress,
    paymentMethod,
    onPaymentMethodChange,
    onSubmit
}: CheckoutFormProps) => {
    return (
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

            <form id="checkout-form" onSubmit={onSubmit} className="space-y-6">
                {/* Shipping Address Section */}
                {session?.user && savedAddresses.length > 0 && (
                    <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-brand-600" />
                            Saved Shipping Addresses
                        </h4>
                        <div className="flex flex-col gap-3">
                            {savedAddresses.map(addr => (
                                <label key={addr.id} className={`cursor-pointer flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${selectedAddressId === addr.id && !addingNewAddress
                                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                                    : 'border-slate-200 dark:border-slate-700'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="savedAddress"
                                        className="mt-1 accent-brand-600"
                                        checked={selectedAddressId === addr.id && !addingNewAddress}
                                        onChange={() => onAddressSelect(addr.id, addr.zone as ShippingZoneType)}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{addr.label || addr.recipientName}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{addr.address}{addr.city ? `, ${addr.city}` : ''}</p>
                                        <p className="text-xs text-slate-400">{addr.phone}</p>
                                    </div>
                                    {addr.isDefault && <span className="ml-auto text-xs bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-medium">Default</span>}
                                </label>
                            ))}
                            <button
                                type="button"
                                onClick={() => onToggleNewAddress(true)}
                                className={`flex items-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all text-sm font-medium ${addingNewAddress
                                    ? 'border-brand-600 text-brand-600 bg-brand-50 dark:bg-brand-900/20'
                                    : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:border-brand-400'
                                    }`}
                            >
                                <Plus className="w-4 h-4" /> Use a different address
                            </button>
                        </div>
                    </div>
                )}

                {/* Contact Information */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={onInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                {/* New Address Form */}
                {addingNewAddress && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
                        <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Delivery Address</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Label (Home, Office)</label>
                                <input
                                    value={newAddressForm.label}
                                    onChange={e => onNewAddressChange('label', e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Home"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Recipient Name *</label>
                                <input
                                    value={newAddressForm.recipientName}
                                    onChange={e => onNewAddressChange('recipientName', e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Phone *</label>
                                <input
                                    value={newAddressForm.phone}
                                    onChange={e => onNewAddressChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    required
                                    placeholder="017XXXXXXXX"
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">City</label>
                                <input
                                    value={newAddressForm.city}
                                    onChange={e => onNewAddressChange('city', e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Full Address *</label>
                            <input
                                value={newAddressForm.address}
                                onChange={e => onNewAddressChange('address', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="House #, Road #, Area..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Delivery Zone</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[ShippingZoneType.INSIDE, ShippingZoneType.OUTSIDE].map(zone => (
                                    <label key={zone} className={`cursor-pointer p-3 rounded-lg border-2 text-sm font-medium transition-all ${newAddressForm.zone === zone ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700' : 'border-slate-200 dark:border-slate-600 text-slate-600'
                                        }`}>
                                        <input type="radio" className="sr-only" checked={newAddressForm.zone === zone} onChange={() => onNewAddressChange('zone', zone)} />
                                        {zone === ShippingZoneType.INSIDE ? 'Inside City' : 'Outside City'}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {session?.user && (
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={saveNewAddress}
                                    onChange={e => onToggleSaveAddress(e.target.checked)}
                                    className="w-4 h-4 accent-brand-600 rounded"
                                />
                                Save this address for future orders
                            </label>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Order Notes (Optional)
                    </label>
                    <textarea
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={onInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="Special instructions..."
                    />
                </div>

                {/* Payment Methods */}
                <div className="space-y-3 pt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {[PaymentMethod.COD, PaymentMethod.SSLCOMMERZ].map(method => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => onPaymentMethodChange(method)}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${paymentMethod === method
                                    ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700"
                                    : "border-slate-200 dark:border-slate-700 text-slate-600"
                                    }`}
                            >
                                {paymentMethod === method && (
                                    <motion.div
                                        layoutId="activePaymentCheckout"
                                        className="absolute inset-0 border-2 border-brand-600 rounded-xl pointer-events-none"
                                    />
                                )}
                                {method === PaymentMethod.COD ? <Truck className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                                <span className="font-semibold text-sm">
                                    {method === PaymentMethod.COD ? 'Cash on Delivery' : 'Online Payment'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
});

CheckoutForm.displayName = "CheckoutForm";
export default CheckoutForm;
