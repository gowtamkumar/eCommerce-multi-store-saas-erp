import React from 'react';
import { FileText, RotateCcw, Star, Truck, ArrowRight, X } from 'lucide-react';
import { getOrderStatusStyles } from '@/lib/utils';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { ReturnStatus } from '@/lib/enums/return-status.enum';
import { OrderDetailModalProps } from '../type';

const OrderDetailModal = ({
    order,
    formatPrice,
    onClose,
    onDownloadInvoice,
    onWriteReview,
    onReturnItem,
    getReturnStatus
}: OrderDetailModalProps) => {
    if (!order) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/10 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-90"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Order Details
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 font-bold">
                            #{order.id.slice(-8).toUpperCase()}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 pr-10">
                        <div
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${getOrderStatusStyles(
                                order.status
                            )}`}
                        >
                            {order.status}
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${order.paymentStatus === 'Paid' ? 'border-green-500 text-green-500 bg-green-50/50 dark:bg-green-900/10' : 'border-amber-500 text-amber-500 bg-amber-50/50 dark:bg-amber-900/10'}`}>
                            {order.paymentStatus}
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Order Meta Info Grid */}
                    <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-900 shadow-inner">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Date</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Email</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {order.customerEmail || 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {order.paymentMethod || 'N/A'}
                            </p>
                        </div>
                        {order.transactionId && (
                            <div className="space-y-1.5 text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TXN ID</p>
                                <p className="text-xs font-mono font-black text-brand-600 dark:text-brand-400 truncate">
                                    {order.transactionId}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <h5 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest flex items-center gap-2 px-1">
                            📦 Items Summary
                        </h5>
                        {(order.items || []).map((item: any) => {
                            const productName = item.snapshot?.productName || item.product?.name || "Product Unavailable";
                            const productImage = item.snapshot?.productImage || item.product?.images?.[0];
                            const variantSku = item.snapshot?.variantSku || item.variant?.sku;
                            const variantOptions = item.snapshot?.variantOptions || item.variant?.combination;

                            return (
                                <div key={item.id} className="flex gap-5 p-4 border border-slate-100 dark:border-slate-800/10 hover:border-brand-500/20 rounded-3xl items-center relative overflow-hidden group transition-all">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-600">
                                        {productImage && (
                                            <img
                                                src={productImage}
                                                alt={productName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-brand-600 transition-colors">
                                            {productName}
                                        </h4>
                                        {(variantSku || variantOptions) && (
                                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                                {variantSku && (
                                                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-tighter">
                                                        SKU: {variantSku}
                                                    </p>
                                                )}
                                                {variantOptions && (
                                                    <p className="text-[10px] text-slate-400 font-bold italic">
                                                        {Object.entries(variantOptions)
                                                            .map(([key, value]) => `${key}: ${value}`)
                                                            .join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded-md text-[10px] font-black text-slate-500">
                                                QTY: {item.quantity}
                                            </div>
                                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                {formatPrice(item.unitPrice)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="font-black text-lg text-slate-900 dark:text-white">
                                            {formatPrice(item.totalAmount)}
                                        </p>
                                        <div className="flex items-center justify-end gap-2">
                                            {order.status === OrderStatus.COMPLETED && item.product && (
                                                <button
                                                    onClick={() => onWriteReview(item)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-yellow-500 transition-all shadow-sm active:scale-90"
                                                    title="Write Review"
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                            )}
                                            {(() => {
                                                const returnStatus = getReturnStatus(order, item.product?.id, item.variant?.id);

                                                if (returnStatus) {
                                                    return (
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${returnStatus === ReturnStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                                            returnStatus === ReturnStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                                                returnStatus === ReturnStatus.REFUNDED ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {returnStatus}
                                                        </span>
                                                    );
                                                }

                                                if (order.status === OrderStatus.COMPLETED || order.paymentStatus === "Paid") {
                                                    return (
                                                        <button
                                                            onClick={() => onReturnItem({
                                                                id: item.id,
                                                                productId: item.product?.id,
                                                                variantId: item.variant?.id,
                                                                productName: item.snapshot?.productName || item.product?.name || "Item",
                                                                quantity: item.quantity,
                                                                price: item.unitPrice,
                                                                discount: item.discountAmount || 0
                                                            })}
                                                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm active:scale-90"
                                                            title="Return Item"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Customer Notes */}
                    {order.orderNotes && (
                        <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-3xl">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Customer Note</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium">"{order.orderNotes}"</p>
                        </div>
                    )}

                    {/* Comprehensive Price Breakdown */}
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 space-y-4 shadow-2xl relative overflow-hidden">
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                        
                        {(() => {
                            const subtotal = (order.items || []).reduce((acc: number, item: any) => acc + (Number(item.unitPrice) * item.quantity), 0);
                            const totalItemDiscount = (order.items || []).reduce((acc: number, item: any) => acc + (Number(item.discountAmount) * item.quantity), 0);
                            const totalRefunded = (order.returns || []).reduce((total: number, returnReq: any) => {
                                if (returnReq.status === ReturnStatus.APPROVED || returnReq.status === ReturnStatus.REFUNDED) {
                                    return total + returnReq.items.reduce((itemTotal: number, returnItem: any) => {
                                        const orderItem = order.items?.find((oi: any) =>
                                            oi.productId === returnItem.productId &&
                                            (oi.variantId === returnItem.variantId || (!oi.variantId && !returnItem.variantId))
                                        );
                                        if (orderItem) {
                                            const itemPrice = Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0);
                                            return itemTotal + (itemPrice * returnItem.quantity);
                                        }
                                        return itemTotal;
                                    }, 0);
                                }
                                return total;
                            }, 0);

                            return (
                                <>
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                        <span className="uppercase tracking-widest">Subtotal</span>
                                        <span className="text-white font-black">{formatPrice(subtotal)}</span>
                                    </div>
                                    {totalItemDiscount > 0 && (
                                        <div className="flex justify-between items-center text-xs font-bold text-rose-400">
                                            <span className="uppercase tracking-widest">Item Savings</span>
                                            <span className="font-black">-{formatPrice(totalItemDiscount)}</span>
                                        </div>
                                    )}
                                    {Number(order.couponDiscountAmount) > 0 && (
                                        <div className="flex justify-between items-center text-xs font-bold text-brand-400">
                                            <span className="uppercase tracking-widest">Coupon ({order.appliedCoupon})</span>
                                            <span className="font-black">-{formatPrice(order.couponDiscountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                        <span className="uppercase tracking-widest">Shipping Fee</span>
                                        <span className="text-white font-black">
                                            {Number(order.shippingFee) === 0 ? <span className="text-green-400">FREE</span> : formatPrice(order.shippingFee)}
                                        </span>
                                    </div>
                                    {Number(order.taxAmount) > 0 && (
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                            <span className="uppercase tracking-widest">Estimated Tax</span>
                                            <span className="text-white font-black">{formatPrice(order.taxAmount)}</span>
                                        </div>
                                    )}
                                    {totalRefunded > 0 && (
                                        <div className="flex justify-between items-center text-xs font-bold text-orange-400">
                                            <span className="uppercase tracking-widest">Total Refunded</span>
                                            <span className="font-black">-{formatPrice(totalRefunded)}</span>
                                        </div>
                                    )}
                                    <div className="pt-6 mt-2 border-t border-slate-800/50 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Final Amount</p>
                                            <span className="text-sm font-black text-white uppercase tracking-wider">Net Total</span>
                                        </div>
                                        <span className="text-4xl font-black text-brand-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                            {formatPrice(order.totalAmount - totalRefunded)}
                                        </span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Delivery & Logistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Courier Tracking */}
                        {order.courierStatus && (
                            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-slate-900">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <h5 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">
                                        Logistics
                                    </h5>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Courier</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{order.courierStatus}</span>
                                    </div>
                                    {order.trackingId && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Ref ID</span>
                                                <span className="text-[10px] font-mono font-black text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded cursor-pointer select-all">{order.trackingId}</span>
                                            </div>
                                            <a
                                                href={
                                                    order.courierStatus.toLowerCase() === 'pathao'
                                                        ? `https://tracking.pathao.com/`
                                                        : `https://steadfast.com.bd/tracking`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[10px] font-black text-brand-600 hover:tracking-widest transition-all mt-4 group"
                                            >
                                                LIVE TRACKING 
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Shipping details */}
                        <div className={`p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-slate-900 ${!order.courierStatus ? 'md:col-span-2' : ''}`}>
                            <h5 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${order.shippingAddress?.label === 'Home' ? 'bg-brand-500' : 'bg-amber-500'}`} />
                                Shipping Destination
                            </h5>
                            <div className="space-y-2">
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                    {order.shippingAddress?.recipientName || order.customerName}
                                </p>
                                <p className="text-xs text-slate-500 font-bold">
                                    {order.shippingAddress?.phone || order.customerPhone}
                                </p>
                                <p className="text-xs text-slate-400 leading-relaxed font-bold italic">
                                    {order.shippingAddress?.address || order.address}
                                    { (order.shippingAddress?.city || order.city) && `, ${order.shippingAddress?.city || order.city}` }
                                </p>
                                <div className="pt-2">
                                    <span className="px-3 py-1 bg-brand-500/10 text-brand-600 text-[9px] font-black uppercase rounded-lg border border-brand-500/20">
                                        {(order.shippingAddress?.zone || order.deliveryZone || 'Standard').toUpperCase()} DELIVERY
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700/50 flex gap-4">
                    <button
                        onClick={() => onDownloadInvoice(order)}
                        className="flex-1 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 active:scale-95 text-xs uppercase tracking-[0.2em]"
                    >
                        <FileText className="w-5 h-5" />
                        Download PDF Invoice
                    </button>
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
