"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { fetchAPI } from "@/lib/api";
import { OrderStatus } from "@/lib/enums/order-status";
import ReturnModal from "./ReturnModal";

import { getOrderStatusStyles } from "@/lib/utils";
import { Eye, Package, RotateCcw, ShoppingBag, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface OrderItem {
    id: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    totalAmount: number;
    snapshot?: any;
    product: {
        id: string;
        name: string;
        images: string[];
        price: number;
    } | null;
    variant: {
        id: string;
        sku: string;
        combination: Record<string, string>;
    } | null;
}

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    paymentStatus: string;
    currency?: string;
    currencyRate?: number;
    items: OrderItem[];
    returns?: any[];
    customerName: string;
    address: string;
}

const CustomerOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [reviewingOrder, setReviewingOrder] = useState<OrderItem | null>(null);
    const [returningItem, setReturningItem] = useState<{
        id: string;
        productId: string;
        variantId?: string;
        productName: string;
        quantity: number;
        price: number;
        discount: number;
    } | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const getReturnStatus = (order: Order, productId: string, variantId?: string) => {
        if (!order.returns) return null;
        for (const req of order.returns) {
            const found = req.items.find((i: any) =>
                i.productId === productId &&
                (i.variantId === variantId || (!i.variantId && !variantId))
            );
            if (found) return req.status;
        }
        return null;
    };
    const { data: session } = useSession();
    const { settings, formatPrice } = useSettings();


    useEffect(() => {
        if (session?.user?.id) {
            fetchOrders();
        }
    }, [session?.user?.id]);

    const fetchOrders = async () => {
        try {
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            const res = await fetchAPI(`/orders/user/${session.user.id}`);

            if (res.success && res.data && Array.isArray(res.data)) {
                setOrders(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };


    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewingOrder || !reviewingOrder.product) return;

        setSubmittingReview(true);
        try {
            await fetchAPI(`/products/${reviewingOrder.product.id}/reviews`, {
                method: "POST",
                body: JSON.stringify({
                    rating,
                    comment,
                    customerName: session?.user?.name || "anonymous",
                    customerEmail: session?.user?.email || "anonymous",
                }),
            });

            toast.success("Review submitted for moderation!");
            setIsReviewModalOpen(false);
            setRating(5);
            setComment("");
        } catch (error) {
            console.error("Review submission error:", error);
            toast.error("Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading order history...</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 h-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-600" />
                Order History
            </h2>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        No orders yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        When you place an order, it will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const firstItem = order.items?.[0];
                        const itemCount = order.items?.length || 0;

                        const productName = firstItem?.snapshot?.productName || firstItem?.product?.name || "Product Unavailable";
                        const productImage = firstItem?.snapshot?.productImage || firstItem?.product?.images?.[0];
                        const variantSku = firstItem?.snapshot?.variantSku

                        return (
                            <div
                                key={order.id}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-brand-800 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                        {productImage ? (
                                            <img
                                                src={productImage}
                                                alt={productName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="w-6 h-6 m-auto text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                            {itemCount > 1
                                                ? `${productName} (+${itemCount - 1} more)`
                                                : productName}
                                        </h4>
                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                            {itemCount === 1 && firstItem && (
                                                <>
                                                    {variantSku && (
                                                        <p className="text-[10px] font-bold text-brand-600 uppercase">
                                                            SKU: {variantSku}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                        <span>Qty: {firstItem.quantity}</span>
                                                        {(() => {
                                                            const returnStatus = getReturnStatus(order, firstItem.product!.id, firstItem.variant?.id);
                                                            if (returnStatus && (returnStatus === 'approved' || returnStatus === 'refunded')) {
                                                                const returnedQty = order.returns?.find((req: any) => {
                                                                    const found = req.items.find((i: any) =>
                                                                        i.productId === firstItem.product!.id &&
                                                                        (i.variantId === firstItem.variant?.id || (!i.variantId && !firstItem.variant?.id))
                                                                    );
                                                                    return found;
                                                                })?.items.find((i: any) =>
                                                                    i.productId === firstItem.product!.id &&
                                                                    (i.variantId === firstItem.variant?.id || (!i.variantId && !firstItem.variant?.id))
                                                                )?.quantity;

                                                                if (returnedQty) {
                                                                    return (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-orange-600 font-semibold">Returned: {returnedQty}</span>
                                                                        </>
                                                                    );
                                                                }
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 dark:text-white">
                                            {formatPrice(order.totalAmount)}
                                        </p>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getOrderStatusStyles(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedOrder(null)}
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
                                    #{selectedOrder.id.slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <div
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getOrderStatusStyles(
                                    selectedOrder.status
                                )}`}
                            >
                                {selectedOrder.status}
                            </div>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Product Info */}
                            <div className="space-y-4">
                                {(selectedOrder.items || []).map((item) => {
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
                                                {selectedOrder.status === OrderStatus.COMPLETED && item.product && (
                                                    <button
                                                        onClick={() => {
                                                            setReviewingOrder(item);
                                                            setIsReviewModalOpen(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-yellow-500 transition-colors"
                                                        title="Write Review"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {(() => {
                                                    const returnStatus = getReturnStatus(selectedOrder, item.product!.id, item.variant?.id);

                                                    if (returnStatus) {
                                                        return (
                                                            <span className={`text-xs px-2 py-1 rounded font-medium uppercase ${returnStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                                returnStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    returnStatus === 'refunded' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                Return: {returnStatus}
                                                            </span>
                                                        );
                                                    }

                                                    if (selectedOrder.status === OrderStatus.COMPLETED || selectedOrder.paymentStatus === "Paid") {
                                                        return (
                                                            <button
                                                                onClick={() => {
                                                                    setReturningItem({
                                                                        id: item.id,
                                                                        productId: item.product!.id,
                                                                        variantId: item.variant?.id,
                                                                        productName: item.snapshot?.productName || item.product?.name || "Item",
                                                                        quantity: item.quantity,
                                                                        price: item.unitPrice,
                                                                        discount: item.discountAmount || 0
                                                                    });
                                                                    setIsReturnModalOpen(true);
                                                                }}
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
                                    const totalRefunded = (selectedOrder.returns || []).reduce((total: number, returnReq: any) => {
                                        if (returnReq.status === 'approved' || returnReq.status === 'refunded') {
                                            return total + returnReq.items.reduce((itemTotal: number, returnItem: any) => {
                                                const orderItem = selectedOrder.items?.find((oi: any) =>
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
                                                    Grand Total
                                                </span>
                                                <span className="font-bold text-lg text-brand-600 dark:text-brand-400">
                                                    {formatPrice(selectedOrder.totalAmount - totalRefunded)}
                                                </span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Delivery Info */}
                            <div>
                                <h5 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                                    Shipping Details
                                </h5>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {selectedOrder.address}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {isReviewModalOpen && reviewingOrder && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10 p-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Review &quot;{reviewingOrder.product?.name}&quot;
                        </h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Rating
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${rating >= star
                                                ? "bg-yellow-500 text-white"
                                                : "bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
                                                }`}
                                        >
                                            <Star className="w-5 h-5 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Your Feedback
                                </label>
                                <textarea
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 transition-all outline-none min-h-[120px]"
                                    placeholder="Share your experience with this product..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {submittingReview ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {isReturnModalOpen && returningItem && selectedOrder && (
                <ReturnModal
                    orderId={selectedOrder.id}
                    item={returningItem}
                    onClose={() => setIsReturnModalOpen(false)}
                    onSuccess={() => {
                        setIsReturnModalOpen(false);
                        // Optionally refresh orders?
                    }}
                />
            )}
        </div>
    );
};

export default CustomerOrders;
