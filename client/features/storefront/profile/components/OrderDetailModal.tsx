import React from 'react';
import { Eye, FileText, Package, RotateCcw, Star, Truck } from 'lucide-react';
import { getOrderStatusStyles } from '@/lib/utils';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { ReturnStatus } from '@/lib/enums/return-status.enum';

interface OrderDetailModalProps {
    order: any;
    formatPrice: (price: number) => string;
    onClose: () => void;
    onDownloadInvoice: (order: any) => void;
    onWriteReview: (item: any) => void;
    onReturnItem: (item: any) => void;
    getReturnStatus: (order: any, productId: string, variantId?: string) => ReturnStatus | null;
}

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
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Order Details
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                            #{order.id.slice(-8).toUpperCase()}
                        </p>
                    </div>
                    <div
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getOrderStatusStyles(
                            order.status
                        )}`}
                    >
                        {order.status}
                    </div>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Product Info */}
                    <div className="space-y-4">
                        {(order.items || []).map((item: any) => {
                            const productName = item.snapshot?.productName || item.product?.name || "Product Unavailable";
                            const productImage = item.snapshot?.productImage || item.product?.images?.[0];
                            const variantSku = item.snapshot?.variantSku || item.variant?.sku;
                            const variantOptions = item.snapshot?.variantOptions || item.variant?.combination;

                            return (
                                <div key={item.id} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl items-center">
                                    <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                        {productImage && (
                                            <img
                                                src={productImage}
                                                alt={productName}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                            {productName}
                                        </h4>
                                        {(variantSku || variantOptions) && (
                                            <div className="mt-0.5 flex flex-col gap-0.5">
                                                {variantSku && (
                                                    <p className="text-[10px] font-bold text-brand-600 uppercase">
                                                        SKU: {variantSku}
                                                    </p>
                                                )}
                                                {variantOptions && (
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                                                        {Object.entries(variantOptions)
                                                            .map(([key, value]) => `${key}: ${value}`)
                                                            .join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                                            Qty: {item.quantity} x {formatPrice(item.unitPrice)}
                                        </p>
                                        {Number(item.discountAmount) > 0 && (
                                            <p className="text-xs text-red-500 font-medium mt-1">
                                                Discount: -{formatPrice(item.discountAmount)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right flex items-center gap-2">
                                        <p className="font-bold text-slate-900 dark:text-white">
                                            {formatPrice(item.totalAmount)}
                                        </p>
                                        {order.status === OrderStatus.COMPLETED && item.product && (
                                            <button
                                                onClick={() => onWriteReview(item)}
                                                className="p-2 text-slate-400 hover:text-yellow-500 transition-colors"
                                                title="Write Review"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        )}
                                        {(() => {
                                            const returnStatus = getReturnStatus(order, item.product?.id, item.variant?.id);

                                            if (returnStatus) {
                                                return (
                                                    <span className={`text-xs px-2 py-1 rounded font-medium uppercase ${returnStatus === ReturnStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                                        returnStatus === ReturnStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                                            returnStatus === ReturnStatus.REFUNDED ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        Return: {returnStatus}
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
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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
                            );
                        })}
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-xl p-4 space-y-2">
                        {(() => {
                            // Calculate refunded amount
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
                                    {totalRefunded > 0 && (
                                        <div className="flex justify-between text-sm text-orange-600 font-medium">
                                            <span>Refunded Amount</span>
                                            <span>-{formatPrice(totalRefunded)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">
                                            Shipping
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {Number(order.shippingFee) === 0 ? (
                                                <span className="text-green-600">Free</span>
                                            ) : (
                                                formatPrice(order.shippingFee || 0)
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">
                                            Grand Total
                                        </span>
                                        <span className="font-bold text-lg text-brand-600 dark:text-brand-400">
                                            {formatPrice(order.totalAmount - totalRefunded)}
                                        </span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Tracking Info */}
                    {order.courierStatus && (
                        <div className="p-4 bg-brand-50 dark:bg-brand-900/10 rounded-xl border border-brand-100 dark:border-brand-900/20">
                            <div className="flex items-center gap-3 mb-2">
                                <Truck className="w-5 h-5 text-brand-600" />
                                <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                                    Tracking Information
                                </h5>
                            </div>
                            <div className="space-y-1 pl-8">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Courier: <span className="font-bold">{order.courierStatus}</span>
                                </p>
                                {order.trackingId && (
                                    <>
                                        <p className="text-xs text-slate-500">
                                            ID: <span className="font-mono font-bold">{order.trackingId}</span>
                                        </p>
                                        <a
                                            href={
                                                order.courierStatus.toLowerCase() === 'pathao'
                                                    ? `https://tracking.pathao.com/`
                                                    : `https://steadfast.com.bd/tracking`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors mt-2"
                                        >
                                            Click here to track your package →
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Delivery Info */}
                    <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm flex items-center gap-2">
                            🚚 Shipping Details
                        </h5>
                        {order.shippingAddress ? (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 space-y-1.5 border border-slate-100 dark:border-slate-700">
                                {order.shippingAddress.label && (
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 px-2 py-0.5 rounded-full mb-1">
                                        {order.shippingAddress.label}
                                    </span>
                                )}
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.shippingAddress.recipientName}</p>
                                <p className="text-xs text-slate-500 font-medium">{order.shippingAddress.phone}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {order.shippingAddress.address}
                                </p>
                                {order.shippingAddress.city && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {order.shippingAddress.city}
                                    </p>
                                )}
                                <p className="text-[10px] font-bold text-brand-600 uppercase mt-1">
                                    Zone: {order.shippingAddress.zone || order.deliveryZone || 'Inside'}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 space-y-1.5 border border-slate-100 dark:border-slate-700">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.customerName}</p>
                                <p className="text-xs text-slate-500 font-medium">{order.customerPhone}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {order.address}
                                </p>
                                {(order.city) && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {order.city}
                                    </p>
                                )}
                                <p className="text-[10px] font-bold text-brand-600 uppercase mt-1">
                                    Zone: {order.deliveryZone || 'Inside'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 flex gap-3">
                    <button
                        onClick={() => onDownloadInvoice(order)}
                        className="flex-1 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        Download Invoice
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
