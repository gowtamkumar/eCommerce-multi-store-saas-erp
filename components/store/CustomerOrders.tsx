"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { fetchAPI } from "@/lib/api";
import { OrderStatus } from "@/lib/enums/order-status";

import { Eye, Package, ShoppingBag, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    paymentStatus: string;
    unitPrice?: number;
    discountAmount?: number;
    currency?: string;
    currencyRate?: number;
    quantity: number;
    productId: {
        id: string;
        name: string;
        images: string[];
        price: number;
    } | null;
    customerName: string;
    address: string;
}

const CustomerOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
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
                console.log("No user ID in session");
                setLoading(false);
                return;
            }

            const res = await fetchAPI(`/orders/user/${session.user.id}`);

            console.log("res", res);

            // fetchAPI returns the data directly (unwrapped)
            if (res.data && Array.isArray(res.data)) {
                setOrders(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case OrderStatus.COMPLETED:
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case OrderStatus.CANCELLED:
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewingOrder || !reviewingOrder.productId) return;

        setSubmittingReview(true);
        try {
            await fetchAPI(`/products/${reviewingOrder.productId.id}/reviews`, {
                method: "POST",
                body: JSON.stringify({
                    rating,
                    comment,
                    customerName: session?.user?.name || reviewingOrder.customerName,
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
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-brand-800 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                    {order.productId?.images?.[0] ? (
                                        <img
                                            src={order.productId.images[0]}
                                            alt={order.productId.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Package className="w-6 h-6 m-auto text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                        {order.productId?.name || "Product Unavailable"}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                <div className="text-right">
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {formatPrice(order.totalAmount)}
                                    </p>
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(
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
                                    {order.status === OrderStatus.COMPLETED && (
                                        <button
                                            onClick={() => {
                                                setReviewingOrder(order);
                                                setIsReviewModalOpen(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-yellow-500 transition-colors"
                                            title="Write Review"
                                        >
                                            <Star className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/10"
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
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(
                                    selectedOrder.status
                                )}`}
                            >
                                {selectedOrder.status}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Product Info */}
                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                    {selectedOrder.productId?.images?.[0] && (
                                        <img
                                            src={selectedOrder.productId.images[0]}
                                            alt={selectedOrder.productId.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                                        {selectedOrder.productId?.name}
                                    </h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        Quantity: {selectedOrder.quantity} x
                                        {formatPrice(selectedOrder.unitPrice || selectedOrder.productId?.price || 0)}
                                    </p>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">
                                        Subtotal
                                    </span>
                                    <span className="font-medium text-slate-900 dark:text-white">

                                        {formatPrice(
                                            (selectedOrder.unitPrice ||
                                                selectedOrder.productId?.price ||
                                                0) * selectedOrder.quantity
                                        )}
                                    </span>
                                </div>
                                {(selectedOrder.discountAmount || 0) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">
                                            Discount
                                        </span>
                                        <span className="font-medium text-red-500">
                                            -
                                            {formatPrice(
                                                (selectedOrder.discountAmount || 0) *
                                                selectedOrder.quantity
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center mt-2">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        Total
                                    </span>
                                    <span className="font-bold text-lg text-brand-600 dark:text-brand-400">
                                        {formatPrice(selectedOrder.totalAmount)}
                                    </span>
                                </div>
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
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10 p-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Review &quot;{reviewingOrder.productId?.name}&quot;
                        </h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Rating
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${s <= rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-slate-300 dark:text-slate-600"
                                                    }`}
                                            />
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
        </div>
    );
};

export default CustomerOrders;
