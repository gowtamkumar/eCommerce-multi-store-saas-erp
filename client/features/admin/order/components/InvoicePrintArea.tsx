'use client';

import React from 'react';
import { Truck } from 'lucide-react';
import { PaymentStatus } from '@/lib/enums/payment-status.enum';
import type { Order } from '@/types/order';

interface InvoicePrintAreaProps {
    order: Order;
    settings: any;
    formatPrice: (price: any) => string;
    subtotal: number;
    totalDiscount: number;
}

export default function InvoicePrintArea({
    order,
    settings,
    formatPrice,
    subtotal,
    totalDiscount,
}: InvoicePrintAreaProps) {
    return (
        <div className="hidden print:block bg-white p-8 text-black">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
                        Invoice
                    </h1>
                    <p className="text-slate-500 font-mono">
                        #{order.id?.slice(-8)?.toUpperCase()}
                    </p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-brand-600">
                        {settings?.brandName || 'Store'}
                    </h2>
                    <p className="text-sm text-slate-500 max-w-[200px] ml-auto">
                        {settings?.address}
                    </p>
                    <p className="text-sm text-slate-500">{settings?.contactEmail}</p>
                    <p className="text-sm text-slate-500">{settings?.contactPhone}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
                        Billed To
                    </h3>
                    <p className="text-lg font-bold text-slate-900 mb-1">
                        {order.customerName}
                    </p>
                    <p className="text-slate-600">{order.customerEmail}</p>
                    <p className="text-slate-600 mb-4">{order.customerPhone}</p>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight mb-3 flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Delivery Details
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Recipient</span>
                                <span className="text-right text-slate-900 dark:text-white font-medium">{order.shippingAddress?.recipientName || order.customerName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Phone</span>
                                <span className="text-right text-slate-900 dark:text-white font-medium">{order.shippingAddress?.phone || order.customerPhone}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Address</span>
                                <span className="text-right text-slate-900 dark:text-white font-medium max-w-[200px]">
                                    {order.shippingAddress?.address || order.address}
                                </span>
                            </div>
                            {(order.shippingAddress?.city || order.city) && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">City</span>
                                    <span className="text-right text-slate-900 dark:text-white font-medium">{order.shippingAddress?.city || order.city}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Zone</span>
                                <span className="font-bold text-brand-600 capitalize">{order.shippingAddress?.zone || order.deliveryZone || 'Inside'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
                        Order Information
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 italic">Date</span>
                            <span className="font-bold text-slate-900">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 italic">Payment Status</span>
                            <span
                                className={`font-bold uppercase ${order.paymentStatus === PaymentStatus.PAID
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                                    }`}
                            >
                                {order.paymentStatus}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 italic">Payment Method</span>
                            <span className="font-bold text-slate-900 uppercase">
                                {order.paymentMethod}
                            </span>
                        </div>
                        {order.transactionId && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 italic">TXN ID</span>
                                <span className="font-bold text-slate-900 font-mono">
                                    {order.transactionId}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <table className="w-full mb-12 border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-900 text-left">
                        <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900">
                            Description
                        </th>
                        <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-center">
                            Qty
                        </th>
                        <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-right">
                            Unit Price
                        </th>
                        <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-right">
                            Line Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(order.items || []).map((item) => {
                        const productName = item.snapshot?.productName || item.product?.name || 'Product';
                        const productId = item.snapshot?.productId || item.product?.id;
                        const variantSku = item.snapshot?.variantSku;
                        const variantOptions = item.snapshot?.variantOptions;

                        return (
                            <tr key={item.id} className="border-b border-slate-100">
                                <td className="py-6">
                                    <p className="font-bold text-slate-900 text-lg mb-1">
                                        {productName}
                                    </p>
                                    <div className="flex flex-col gap-1 text-sm text-slate-500">
                                        <p>ID: #{productId?.slice(-6)?.toUpperCase() || 'N/A'}</p>
                                        {(variantSku || variantOptions) && (
                                            <div className="flex flex-col gap-0.5 mt-1 border-l-2 border-brand-200 pl-2">
                                                {variantSku && (
                                                    <p className="text-xs font-bold text-brand-600 uppercase">
                                                        SKU: {variantSku}
                                                    </p>
                                                )}
                                                {variantOptions && (
                                                    <p className="text-[10px] italic">
                                                        {Object.entries(variantOptions)
                                                            .map(([key, value]) => `${key}: ${value}`)
                                                            .join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-6 text-center font-bold text-slate-900">
                                    {item.quantity}
                                </td>
                                <td className="py-6 text-right font-medium text-slate-600">
                                    {formatPrice(item.unitPrice)}
                                </td>
                                <td className="py-6 text-right font-bold text-slate-900">
                                    {formatPrice(item.totalAmount)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-80 space-y-4">
                    <div className="flex justify-between text-sm text-slate-500 italic">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-900">
                            {formatPrice(subtotal)}
                        </span>
                    </div>
                    {totalDiscount > 0 && (
                        <div className="flex justify-between text-sm text-red-500">
                            <span>Total Discount</span>
                            <span className="font-medium">
                                -{formatPrice(totalDiscount)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm text-slate-500 italic">
                        <span>Shipping</span>
                        <span className="font-medium text-slate-900">
                            {Number(order.shippingFee) === 0 ? 'Free' : formatPrice(order.shippingFee || 0)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t-2 border-slate-900">
                        <span className="text-lg font-bold uppercase tracking-tighter">
                            Grand Total
                        </span>
                        <span className="text-3xl font-bold text-green-600">
                            {formatPrice(order.totalAmount)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-24 pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-400 italic">
                    Thank you for your business!
                </p>
                <div className="flex justify-center gap-4 mt-2">
                    <span className="text-[10px] text-slate-300 uppercase tracking-widest">
                        {settings?.brandName}
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-300 uppercase tracking-widest">
                        E-Commerce Invoice
                    </span>
                </div>
            </div>
        </div>
    );
}
