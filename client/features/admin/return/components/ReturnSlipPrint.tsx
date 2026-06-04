"use client";

import { ReturnRequest } from "@/types/order";

interface ReturnSlipPrintProps {
    returnRequest: ReturnRequest;
    settings: any;
    formatPrice: (price: number) => string;
}

export default function ReturnSlipPrint({ returnRequest, settings, formatPrice }: ReturnSlipPrintProps) {
    return (
        <div className="hidden print:block bg-white p-8 text-black">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
                        Return Slip
                    </h1>
                    <p className="text-slate-500 font-mono">
                        #{returnRequest.id?.slice(-8)?.toUpperCase()}
                    </p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-brand-600">
                        {settings?.brandName || "Store"}
                    </h2>
                    <p className="text-sm text-slate-500 max-w-[200px] ml-auto">
                        {settings?.address}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12 border-t pt-8">
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Info</h3>
                    <p className="text-lg font-bold text-slate-900">{returnRequest.order?.customerName}</p>
                    <p className="text-slate-600">{returnRequest.order?.customerEmail}</p>
                    <p className="text-slate-600">{returnRequest.order?.customerPhone}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Original Order</h3>
                    <p className="text-lg font-bold text-slate-900 uppercase">#{returnRequest.order?.id?.slice(-8)}</p>
                    <p className="text-slate-600">Status: {returnRequest.status.toUpperCase()}</p>
                    <p className="text-slate-600">Date: {new Date(returnRequest.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <table className="w-full mb-12 border-collapse">
                <thead>
                    <tr className="border-b-2 border-slate-900 text-left">
                        <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900">Item</th>
                        <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-center">Qty</th>
                        <th className="py-4 font-bold uppercase text-xs tracking-widest text-slate-900 text-right">Refund Est.</th>
                    </tr>
                </thead>
                <tbody>
                    {returnRequest.items.map((returnItem: any, index: number) => {
                        const orderItem = returnRequest.order?.items?.find(
                            (oi: any) => oi.productId === returnItem.productId &&
                                (oi.variantId === returnItem.variantId || (!oi.variantId && !returnItem.variantId))
                        );
                        const unitPrice = orderItem ? (Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0)) : 0;
                        return (
                            <tr key={index} className="border-b border-slate-100">
                                <td className="py-6">
                                    <p className="font-bold text-slate-900">{orderItem?.product?.name || "Product"}</p>
                                    {orderItem?.variant?.sku && <p className="text-xs text-slate-500 uppercase">SKU: {orderItem.variant.sku}</p>}
                                </td>
                                <td className="py-6 text-center font-bold">{returnItem.quantity}</td>
                                <td className="py-6 text-right font-bold text-slate-900">{formatPrice(unitPrice * returnItem.quantity)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex justify-end pt-8 border-t-2 border-slate-900">
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1">Total Refund Estimate</p>
                    <p className="text-4xl font-bold text-green-600">
                        {formatPrice(returnRequest.items.reduce((total: number, item: any) => {
                            const orderItem = returnRequest.order?.items?.find((oi: any) => oi.productId === item.productId && (oi.variantId === item.variantId || (!oi.variantId && !item.variantId)));
                            return total + (orderItem ? (Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0)) * item.quantity : 0);
                        }, 0))}
                    </p>
                </div>
            </div>
        </div>
    );
}
