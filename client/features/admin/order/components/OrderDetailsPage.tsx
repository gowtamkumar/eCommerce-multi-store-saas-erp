"use client";

import { useSettings } from "@/hooks/SettingsContext";
import { fetchAPI } from "@/services/api";
import { OrderStatus } from "@/lib/enums/order-status.enum";
import { PaymentStatus } from "@/lib/enums/payment-status.enum";
import { getOrderStatusStyles, handleCreatePathaoOrder, handleCreateSteadfastOrder, handleManualDispatch, updateOrderStatus } from "@/lib/utils";
import { useDownloadInvoice } from "@/lib/handleDownloadInvoice";
import { Order } from "@/types/order";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileText,
    Loader2,
    Mail,
    MapPin,
    Package,
    Phone,
    RefreshCw,
    Truck
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CourierType } from "@/lib/enums/courier-type.enum";
import { ShippingZoneType } from "@/lib/enums/shipping-zone-type.enum";



export default function OrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { settings, formatPrice } = useSettings();
    const [selectedCourier, setSelectedCourier] = useState<string>("");
    const [showCourierModal, setShowCourierModal] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState<string | null>(null);
    const [creatingPathaoOrder, setCreatingPathaoOrder] = useState<string | null>(null);
    const { downloadInvoice } = useDownloadInvoice();

    // New states for Pathao city/zone integration and live status tracking
    const [pathaoCities, setPathaoCities] = useState<any[]>([]);
    const [pathaoZones, setPathaoZones] = useState<any[]>([]);
    const [pathaoAreas, setPathaoAreas] = useState<any[]>([]);
    const [selectedCity, setSelectedCity] = useState<number>(0);
    const [selectedZone, setSelectedZone] = useState<number>(0);
    const [selectedArea, setSelectedArea] = useState<number>(0);
    const [itemWeight, setItemWeight] = useState<number>(0.5);
    const [calculatedPrice, setCalculatedPrice] = useState<any>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [liveStatus, setLiveStatus] = useState<any>(null);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const getItemReturnStatus = (productId: string, variantId?: string) => {
        if (!order?.returns) return null;
        for (const req of order.returns) {
            const found = req.items.find((i: any) =>
                i.productId === productId &&
                (i.variantId === variantId || (!i.variantId && !variantId))
            );
            if (found) return req.status;
        }
        return null;
    };

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetchAPI(`/orders/${id}`);

            if (res.success && res.data) {
                setOrder(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch order", error);
            toast.error("Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (updates: any) => {
        setUpdating(true);
        const result = await updateOrderStatus(id, updates);

        if (result.success && result.data) {
            setOrder(result.data);
            toast.success("Order updated successfully");
        } else {
            toast.error(result.error || "Failed to update order");
        }
        setUpdating(false);
    };

    const handleRefresh = async () => {
        await fetchOrder();
        toast.success("Order data refreshed");
    };

    const handleCourierSelect = (courier: string) => {
        if (courier) {
            setSelectedCourier(courier);
            setShowCourierModal(true);
        }
    };

    const fetchCities = async () => {
        try {
            const res = await fetchAPI(`/courier/pathao/cities`);
            if (res.success && res.data?.data?.data) {
                setPathaoCities(res.data.data.data);
            }
        } catch (error) {
            console.error("Failed to load cities", error);
        }
    };

    const handleCityChange = async (cityId: number) => {
        setSelectedCity(cityId);
        setSelectedZone(0);
        setSelectedArea(0);
        setCalculatedPrice(null);
        try {
            const res = await fetchAPI(`/courier/pathao/city/${cityId}/zones`);
            if (res.success && res.data?.data?.data) {
                setPathaoZones(res.data.data.data);
            }
        } catch (error) {
            console.error("Failed to load zones", error);
        }
    };

    const handleZoneChange = async (zoneId: number) => {
        setSelectedZone(zoneId);
        setSelectedArea(0);
        setCalculatedPrice(null);
        try {
            const res = await fetchAPI(`/courier/pathao/zone/${zoneId}/areas`);
            if (res.success && res.data?.data?.data) {
                setPathaoAreas(res.data.data.data);
            }
            calculatePrice(selectedCity, zoneId);
        } catch (error) {
            console.error("Failed to load areas", error);
        }
    };

    const calculatePrice = async (cityId: number, zoneId: number) => {
        setLoadingPrice(true);
        try {
            const res = await fetchAPI(`/courier/pathao/price-calculation`, {
                method: 'POST',
                body: JSON.stringify({
                    recipientCity: cityId,
                    recipientZone: zoneId,
                    itemWeight,
                    itemType: 2,
                    deliveryType: 48,
                })
            });
            if (res.success && res.data?.data) {
                setCalculatedPrice(res.data.data);
            }
        } catch (error) {
            console.error("Failed to calculate price", error);
        } finally {
            setLoadingPrice(false);
        }
    };

    useEffect(() => {
        if (showCourierModal && selectedCourier === CourierType.PATHAO) {
            fetchCities();
        }
    }, [showCourierModal, selectedCourier]);

    const handleConfirmCourierOrder = async (order: Order) => {
        const courier = selectedCourier;
        setShowCourierModal(false);
        setSelectedCourier("");

        let res;
        if (courier === CourierType.STEADFAST) {
            res = await handleCreateSteadfastOrder(order, setCreatingOrder);
        } else if (courier === CourierType.PATHAO) {
            res = await handleCreatePathaoOrder(order, setCreatingPathaoOrder, {
                recipient_city: selectedCity || undefined,
                recipient_zone: selectedZone || undefined,
                recipient_area: selectedArea || undefined,
                item_weight: itemWeight,
            });
        } else if (courier === CourierType.IN_STORE) {
            res = await handleManualDispatch(order, setCreatingOrder);
        }

        if (res?.success) {
            fetchOrder();
        }
    };

    const handleCancelCourierOrder = () => {
        setShowCourierModal(false);
        setSelectedCourier("");
        setPathaoZones([]);
        setPathaoAreas([]);
        setSelectedCity(0);
        setSelectedZone(0);
        setSelectedArea(0);
        setCalculatedPrice(null);
    };

    const handleCheckLiveStatus = async () => {
        if (!order || !order.trackingId || !order.courierStatus) return;
        setLoadingStatus(true);
        setShowStatusModal(true);
        try {
            const courier = order.courierStatus.toLowerCase();
            const res = await fetchAPI(`/courier/${courier}/status/${order.trackingId}`);
            if (res.success && res.data) {
                setLiveStatus(res.data);
            } else {
                toast.error("Could not fetch tracking data from courier");
            }
        } catch (error) {
            console.error("Failed to check status", error);
            toast.error("Failed to fetch live courier status");
        } finally {
            setLoadingStatus(false);
        }
    };

    const handlePrintLabel = async () => {
        if (!order || !order.trackingId || !order.courierStatus) return;
        try {
            const courier = order.courierStatus.toLowerCase();
            if (courier === 'steadfast') {
                const res = await fetchAPI(`/courier/steadfast/label/${order.trackingId}`);
                if (res.success && res.data?.printUrl) {
                    window.open(res.data.printUrl, '_blank');
                } else {
                    toast.error("Failed to fetch label link");
                }
            } else {
                toast.error("Label download is only supported for Steadfast at this time");
            }
        } catch (error) {
            console.error("Failed to get label", error);
            toast.error("Failed to retrieve shipping label");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Order not found.
                </p>
                <Link href="/admin/orders" className="text-brand-600 hover:underline">
                    Back to Orders
                </Link>
            </div>
        );
    }

    const subtotal = (order.items || []).reduce((acc, item) => acc + (Number(item.unitPrice) * item.quantity), 0);
    const totalDiscount = (order.items || []).reduce((acc, item) => acc + (Number(item.discountAmount) * item.quantity), 0);

    // Calculate total refunded amount
    const totalRefunded = (order.returns || []).reduce((total, returnReq) => {
        if (returnReq.status === 'approved' || returnReq.status === 'refunded') {
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
        <div className="max-w-full mx-auto space-y-8 pb-12">
            {/* Print-only Invoice */}
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
                            {settings?.brandName || "Store"}
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
                                        ? "text-green-600"
                                        : "text-yellow-600"
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
                            const productName = item.snapshot?.productName || item.product?.name || "Product";
                            const productId = item.snapshot?.productId || item.product?.id;
                            const variantSku = item.snapshot?.variantSku
                            const variantOptions = item.snapshot?.variantOptions

                            return (
                                <tr key={item.id} className="border-b border-slate-100">
                                    <td className="py-6">
                                        <p className="font-bold text-slate-900 text-lg mb-1">
                                            {productName}
                                        </p>
                                        <div className="flex flex-col gap-1 text-sm text-slate-500">
                                            <p>ID: #{productId?.slice(-6)?.toUpperCase() || "N/A"}</p>
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
                                                                .join(", ")}
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
                                {Number(order.shippingFee) === 0 ? "Free" : formatPrice(order.shippingFee || 0)}
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

            {/* Header */}
            <div className="flex flex-col gap-4 print:hidden">
                <div>
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
                        Order{" "}
                        <span className="text-slate-400 font-mono text-xl sm:text-2xl uppercase">
                            #{order.id.slice(-8)}
                        </span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span className="hidden sm:inline">{new Date(order.createdAt).toLocaleString()}</span>
                            <span className="sm:hidden">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span
                            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getOrderStatusStyles(
                                order.status || "PENDING"
                            )}`}
                        >
                            {(order.status || "PENDING").charAt(0).toUpperCase() +
                                (order.status || "PENDING").slice(1).toLowerCase()}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                        title="Refresh order data"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="sm:inline">Refresh</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="sm:inline">Print</span>
                    </button>
                    <button
                        onClick={() => downloadInvoice(order)}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="sm:inline">Download Invoice</span>
                    </button>
                    <select
                        value={order.status || OrderStatus.PENDING}
                        onChange={(e) => handleStatusUpdate({ status: e.target.value })}
                        disabled={updating}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer border-none outline-none ring-2 ring-slate-100 dark:ring-slate-700 transition-all ${getOrderStatusStyles(
                            order.status || OrderStatus.PENDING
                        )}`}
                    >
                        <option value={OrderStatus.PENDING}>Mark as Pending</option>
                        <option value={OrderStatus.PROCESSING}>Mark as Processing</option>
                        <option value={OrderStatus.CONFIRMED}>Mark as Confirmed</option>
                        <option value={OrderStatus.SHIPPED}>Mark as Shipped</option>
                        <option value={OrderStatus.COMPLETED}>Mark as Completed</option>
                        <option value={OrderStatus.CANCELLED}>Mark as Cancelled</option>
                    </select>
                    <select
                        value={selectedCourier}
                        onChange={(e) => handleCourierSelect(e.target.value)}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer hover:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                    >
                        <option value="">🚚 Create Courier Order</option>
                        <option value={CourierType.STEADFAST}>📦 Steadfast</option>
                        <option value={CourierType.PATHAO}>🚚 Pathao</option>
                        <option value={CourierType.IN_STORE}>🚚 Manual</option>
                    </select>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 print:hidden">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items Section */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Package className="w-4 sm:w-5 h-4 sm:h-5 text-brand-500" />
                                Order Items
                            </h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                            {(order.items || []).map((item) => {
                                const productName = item.snapshot?.productName || item.product?.name || "Product Unavailable";
                                const productImage = item.snapshot?.productImage || item.product?.images?.[0];
                                const variantSku = item.snapshot?.variantSku || item.variant?.sku;
                                const variantOptions = item.snapshot?.variantOptions || item.variant?.combination;

                                return (
                                    <div key={item.id} className="flex items-center gap-3 sm:gap-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative border border-slate-100 dark:border-slate-700">
                                            {productImage ? (
                                                <img
                                                    src={productImage}
                                                    alt={productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {item.product ? (
                                                <Link
                                                    href={`/admin/products/${item.product.id}`}
                                                    className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 transition-colors block truncate"
                                                >
                                                    {productName}
                                                </Link>
                                            ) : (
                                                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block truncate">
                                                    {productName} <span className="text-xs font-normal text-slate-500 italic ml-2">(Deleted)</span>
                                                </span>
                                            )}

                                            {(variantSku || variantOptions) && (
                                                <div className="mt-1 flex flex-col gap-0.5">
                                                    {variantSku && (
                                                        <p className="text-[9px] sm:text-[10px] font-black text-brand-600 uppercase tracking-widest">
                                                            SKU: {variantSku}
                                                        </p>
                                                    )}
                                                    {variantOptions && (
                                                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 italic truncate">
                                                            {Object.entries(variantOptions)
                                                                .map(([key, value]) => `${key}: ${value}`)
                                                                .join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-slate-500">Qty:</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                                                </div>
                                                {(() => {
                                                    const returnStatus = getItemReturnStatus(item.product?.id || "", item.variant?.id);
                                                    if (returnStatus && (returnStatus === 'approved' || returnStatus === 'refunded')) {
                                                        const returnedQty = order.returns?.find((req: any) => {
                                                            const found = req.items.find((i: any) =>
                                                                i.productId === (item.product?.id || "") &&
                                                                (i.variantId === item.variant?.id || (!i.variantId && !item.variant?.id))
                                                            );
                                                            return found;
                                                        })?.items.find((i: any) =>
                                                            i.productId === (item.product?.id || "") &&
                                                            (i.variantId === item.variant?.id || (!i.variantId && !item.variant?.id))
                                                        )?.quantity;

                                                        if (returnedQty) {
                                                            return (
                                                                <>
                                                                    <span className="text-slate-300">•</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-medium text-orange-500">Returned:</span>
                                                                        <span className="font-bold text-orange-600">{returnedQty}</span>
                                                                    </div>
                                                                </>
                                                            );
                                                        }
                                                    }
                                                    return null;
                                                })()}
                                                <span className="text-slate-300">•</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-slate-500">Unit Price:</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(item.unitPrice)}</span>
                                                </div>
                                                {Number(item.discountAmount) > 0 && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium text-red-500">Discount/Unit:</span>
                                                            <span className="font-bold text-red-600">-{formatPrice(item.discountAmount)}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Price Calculation Breakdown */}
                                            <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div className="text-[10px] sm:text-xs space-y-0.5">
                                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                                        <span>{item.quantity} × {formatPrice(item.unitPrice)}</span>
                                                        <span className="font-medium">{formatPrice(item.quantity * item.unitPrice)}</span>
                                                    </div>
                                                    {Number(item.discountAmount) > 0 && (
                                                        <div className="flex justify-between text-red-500">
                                                            <span>Discount ({item.quantity} × {formatPrice(item.discountAmount)})</span>
                                                            <span className="font-medium">-{formatPrice(item.quantity * item.discountAmount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200 dark:border-slate-600">
                                                        <span>Item Total</span>
                                                        <span className="text-brand-600">{formatPrice(item.totalAmount)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            {/* <p className="text-lg font-bold text-brand-600">
                                                {formatPrice(item.totalAmount)}
                                            </p> */}
                                            {(() => {
                                                const returnStatus = getItemReturnStatus(item.product?.id || "", item.variant?.id);
                                                if (returnStatus) {
                                                    return (
                                                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${returnStatus === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            returnStatus === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                returnStatus === 'refunded' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            }`}>
                                                            Return: {returnStatus}
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                );
                            })}

                            {(!order.items || order.items.length === 0) && (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">No items in this order</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
                            <div className="space-y-2 max-w-sm ml-auto">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-red-500">
                                        <span>Total Discount</span>
                                        <span>-{formatPrice(totalDiscount)}</span>
                                    </div>
                                )}
                                {totalRefunded > 0 && (
                                    <div className="flex justify-between text-orange-600 font-medium">
                                        <span>Refunded Amount</span>
                                        <span>-{formatPrice(totalRefunded)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Shipping {order.deliveryZone && `(${order.deliveryZone})`}</span>
                                    <span>{Number(order.shippingFee) === 0 ? (
                                        <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                                    ) : (
                                        formatPrice(order.shippingFee || 0)
                                    )}</span>
                                </div>
                                {Number(order.taxAmount) > 0 && (
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Tax</span>
                                        <span>{formatPrice(order.taxAmount || 0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span>Payable Amount</span>
                                    <span className="text-green-600">
                                        {formatPrice(order.totalAmount - totalRefunded)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Order Notes */}
                    {order.orderNotes && (
                        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-500" />
                                Order Notes
                            </h2>
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 p-4 rounded-xl">
                                <p className="text-slate-700 dark:text-slate-300 italic">
                                    "{order.orderNotes}"
                                </p>
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8 print:hidden">
                    {/* Customer Info */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                            Customer Details
                        </h2>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <Package className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                        Name
                                    </p>
                                    <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-white">
                                        {order.customerName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                        Email
                                    </p>
                                    <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                        {order.customerEmail || "No email provided"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                        Phone
                                    </p>
                                    <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-white">
                                        {order.customerPhone || "No phone provided"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                                        Shipping Address
                                    </p>
                                    {order.shippingAddress ? (
                                        <div className="space-y-0.5">
                                            {order.shippingAddress.label && (
                                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 px-2 py-0.5 rounded-full mb-1">
                                                    {order.shippingAddress.label}
                                                </span>
                                            )}
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.shippingAddress.recipientName}</p>
                                            <p className="text-xs text-slate-500 font-medium">{order.shippingAddress.phone}</p>
                                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {order.shippingAddress.address}
                                            </p>
                                            {order.shippingAddress.city && (
                                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                                                    {order.shippingAddress.city}
                                                </p>
                                            )}
                                            <p className="text-[10px] font-bold text-brand-600 uppercase mt-1">
                                                Zone: {order.shippingAddress.zone || order.deliveryZone || 'Inside'}
                                            </p>
                                            {order.shippingAddress.zone && (
                                                <p className="text-[10px] font-medium text-slate-400 capitalize mt-0.5">
                                                    📍 {order.shippingAddress.zone === ShippingZoneType.INSIDE ? 'Inside City' : 'Outside City'}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                                            {order.address || 'No address provided'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {order.courierStatus && (
                                <div className="flex items-start gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                                        <Truck className="w-4 h-4 text-brand-600" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                            Shipping & Tracking
                                        </p>
                                        <div className="mt-1 space-y-3">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {order.courierStatus}
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 rounded-md">SHIPMENT CREATED</span>
                                                </p>
                                            </div>
                                            {order.trackingId && (
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Tracking ID</p>
                                                        <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                                            {order.trackingId}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        <button
                                                            onClick={handleCheckLiveStatus}
                                                            disabled={loadingStatus}
                                                            className="px-2.5 py-1 text-xs font-bold bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 hover:bg-brand-100 rounded-lg transition-colors flex items-center gap-1 border border-brand-200/50 dark:border-brand-900/50"
                                                        >
                                                            {loadingStatus ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <span>🔍 Live Status</span>
                                                            )}
                                                        </button>

                                                        {order.courierStatus.toLowerCase() === 'steadfast' && (
                                                            <button
                                                                onClick={handlePrintLabel}
                                                                className="px-2.5 py-1 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                                                            >
                                                                <span>🖨️ Print Label</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="pt-1">
                                                        <a
                                                            href={
                                                                order.courierStatus.toLowerCase() === 'pathao'
                                                                    ? `https://tracking.pathao.com/`
                                                                    : `https://steadfast.com.bd/tracking`
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider"
                                                        >
                                                            Track on Courier Portal →
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Payment Info */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                            Payment Status
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                            Method
                                        </p>
                                        <p className="font-medium text-slate-900 dark:text-white uppercase text-sm">
                                            {order.paymentMethod}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.paymentStatus === PaymentStatus.PAID
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
                                        }`}
                                >
                                    {order.paymentStatus}
                                </span>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Update Payment Status
                                    </label>
                                    <select
                                        value={order.paymentStatus}
                                        onChange={(e) =>
                                            handleStatusUpdate({ paymentStatus: e.target.value })
                                        }
                                        disabled={updating}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    >
                                        <option value={PaymentStatus.PENDING}>Pending</option>
                                        <option value={PaymentStatus.PAID}>Paid</option>
                                        <option value={PaymentStatus.FAILED}>Failed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Transaction ID / Reference
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={order.transactionId || ""}
                                            onChange={(e) =>
                                                setOrder({ ...order, transactionId: e.target.value } as any)
                                            }
                                            placeholder="Enter ID"
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                        <button
                                            onClick={() =>
                                                handleStatusUpdate({
                                                    transactionId: order.transactionId,
                                                })
                                            }
                                            disabled={updating}
                                            className="px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Courier Confirmation Modal */}
            {showCourierModal && order && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 max-w-lg w-full transform transition-all animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-xl">
                                🚚
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    Create {selectedCourier === CourierType.PATHAO ? 'Pathao' : selectedCourier === CourierType.STEADFAST ? 'Steadfast' : 'Manual'} Order
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Order ref: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{order.id.slice(-8).toUpperCase()}</span>
                                </p>
                            </div>
                        </div>

                        {selectedCourier === CourierType.PATHAO && (
                            <div className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pathao Delivery Destination Details</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">City</label>
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => handleCityChange(Number(e.target.value))}
                                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        >
                                            <option value={0}>Select City</option>
                                            {pathaoCities.map((city: any) => (
                                                <option key={city.city_id} value={city.city_id}>{city.city_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Zone</label>
                                        <select
                                            value={selectedZone}
                                            onChange={(e) => handleZoneChange(Number(e.target.value))}
                                            disabled={!selectedCity}
                                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all disabled:opacity-50"
                                        >
                                            <option value={0}>Select Zone</option>
                                            {pathaoZones.map((zone: any) => (
                                                <option key={zone.zone_id} value={zone.zone_id}>{zone.zone_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Area</label>
                                        <select
                                            value={selectedArea}
                                            onChange={(e) => setSelectedArea(Number(e.target.value))}
                                            disabled={!selectedZone}
                                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all disabled:opacity-50"
                                        >
                                            <option value={0}>Select Area</option>
                                            {pathaoAreas.map((area: any) => (
                                                <option key={area.area_id} value={area.area_id}>{area.area_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Weight (KG)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={itemWeight}
                                            onChange={(e) => {
                                                setItemWeight(Number(e.target.value));
                                                if (selectedCity && selectedZone) calculatePrice(selectedCity, selectedZone);
                                            }}
                                            className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                </div>

                                {loadingPrice && (
                                    <div className="text-center text-xs text-brand-600 font-medium py-2 flex items-center justify-center gap-1.5">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Estimating shipping rate...</span>
                                    </div>
                                )}

                                {!loadingPrice && calculatedPrice && (
                                    <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900 rounded-xl flex items-center justify-between">
                                        <span className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider">Estimated Shipping Cost:</span>
                                        <span className="text-sm font-black text-brand-600">{formatPrice(calculatedPrice.price || 0)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedCourier !== CourierType.PATHAO && (
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                                Are you sure you want to initialize a courier shipment for order <span className="font-bold text-slate-850 dark:text-white bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono">#{order.id.slice(-8).toUpperCase()}</span> using {selectedCourier === CourierType.STEADFAST ? 'Steadfast Courier' : 'manual dispatch'}?
                            </p>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelCourierOrder}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleConfirmCourierOrder(order)}
                                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-brand-500/20 flex items-center gap-2"
                            >
                                {(creatingOrder || creatingPathaoOrder) && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Confirm Dispatch
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Tracking Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 max-w-md w-full transform transition-all animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    Live Courier Status
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">
                                    TRACKING: {order?.trackingId}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setLiveStatus(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        {loadingStatus && (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Contacting Courier API...</p>
                            </div>
                        )}

                        {!loadingStatus && liveStatus && (
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Status</span>
                                    <h4 className="text-xl font-black text-brand-600 mt-1 uppercase">
                                        {liveStatus.status || liveStatus.order_status || liveStatus.data?.status || 'Unknown'}
                                    </h4>
                                </div>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Tracking Timeline</span>
                                    
                                    {/* Steadfast Status Logs */}
                                    {liveStatus.status_log && Array.isArray(liveStatus.status_log) && liveStatus.status_log.length > 0 ? (
                                        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-700 space-y-4">
                                            {liveStatus.status_log.map((log: any, idx: number) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-slate-800" />
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{log.status}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{log.date || log.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-xs text-slate-500">
                                            No detailed status history logs found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
