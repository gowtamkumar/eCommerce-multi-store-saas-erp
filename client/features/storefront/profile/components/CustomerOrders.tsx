"use client";

import ReturnModal from "@/features/admin/return/components/ReturnModal";
import { useSettings } from "@/hooks/SettingsContext";
import { useDownloadInvoice } from "@/lib/handleDownloadInvoice";
import { fetchAPI } from "@/services/api";
import { Order } from "@/types/order";
import { ChevronLeft, ChevronRight, Loader2, Search, ShoppingBag, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import OrderDetailModal from "./OrderDetailModal";
import OrderListItem from "./OrderListItem";

const CustomerOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewingOrder, setReviewingOrder] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returningItem, setReturningItem] = useState<any>(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    const getReturnStatus = useCallback((order: Order, productId: string, variantId?: string) => {
        if (!order.returns) return null;
        for (const req of order.returns) {
            const found = req.items.find((i: any) =>
                i.productId === productId && (i.variantId === variantId || (!i.variantId && !variantId))
            );
            if (found) return req.status;
        }
        return null;
    }, []);

    const { data: session } = useSession();
    const { formatPrice } = useSettings();
    const { downloadInvoice } = useDownloadInvoice();

    useEffect(() => {
        if (session?.user?.id) {
            fetchOrders(debouncedSearch, pagination.page);
        }
    }, [session?.user?.id, debouncedSearch, pagination.page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchOrders = async (search?: string, page: number = 1) => {
        try {
            setLoading(true);
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
            });

            if (search) queryParams.append("search", search);

            const res = await fetchAPI(`/orders/user/${session.user.id}?${queryParams.toString()}`);

            if (res.success && res.data) {
                setOrders(res.data.orders || []);
                setPagination(prev => ({
                    ...prev,
                    total: res.data.pagination?.total ?? 0,
                    totalPages: res.data.pagination?.totalPages ?? 0
                }));
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            toast.error("Could not load your orders");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = useCallback((order: Order) => setSelectedOrder(order), []);
    const handleDownloadInvoice = useCallback((order: Order) => downloadInvoice(order), [downloadInvoice]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewingOrder) return;

        setSubmittingReview(true);
        try {
            const res = await fetchAPI('/reviews', {
                method: 'POST',
                body: JSON.stringify({
                    productId: reviewingOrder.productId,
                    orderId: selectedOrder?.id,
                    rating,
                    comment,
                    variantId: reviewingOrder.variantId
                })
            });

            if (res.success) {
                toast.success("Review submitted!");
                setIsReviewModalOpen(false);
                setComment("");
                setRating(5);
                fetchOrders(debouncedSearch, pagination.page);
            }
        } catch (error) {
            toast.error("Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Order History</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and track your recent orders</p>
                </div>
                <div className="relative group w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                    <p className="text-slate-500 font-bold animate-pulse">Fetching your orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100 dark:border-slate-700">
                        <ShoppingBag className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No orders found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        Your order list is empty. Start shopping to fill it up!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderListItem
                            key={order.id}
                            order={order}
                            formatPrice={formatPrice}
                            onViewDetail={handleViewDetail}
                            onDownloadInvoice={handleDownloadInvoice}
                            getReturnStatus={getReturnStatus}
                        />
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-6">
                    <p className="text-sm text-slate-500 font-medium">
                        Page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of <span className="font-bold text-slate-900 dark:text-white">{pagination.totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button
                            onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    formatPrice={formatPrice}
                    onClose={() => setSelectedOrder(null)}
                    onDownloadInvoice={handleDownloadInvoice}
                    onWriteReview={(item) => {
                        setReviewingOrder(item);
                        setIsReviewModalOpen(true);
                    }}
                    onReturnItem={(item) => {
                        setReturningItem(item);
                        setIsReturnModalOpen(true);
                    }}
                    getReturnStatus={getReturnStatus}
                />
            )}

            {isReviewModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/10">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Write a Review</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`p-1 transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-slate-300 dark:text-slate-600'}`}
                                        >
                                            <Star className="w-8 h-8 fill-current" />
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
