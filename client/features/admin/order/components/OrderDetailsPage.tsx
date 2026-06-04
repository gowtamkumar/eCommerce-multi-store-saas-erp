'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileText,
    Mail,
    MapPin,
    Package,
    Phone,
    RefreshCw,
    Truck,
    Loader2
} from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import { useDownloadInvoice } from '@/lib/handleDownloadInvoice';
import { getOrderStatusStyles } from '@/lib/utils';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { PaymentStatus } from '@/lib/enums/payment-status.enum';
import { ShippingZoneType } from '@/lib/enums/shipping-zone-type.enum';
import { CourierType } from '@/lib/enums/courier-type.enum';

// Subcomponents
import { useOrderDetails } from '../hooks/useOrderDetails';
import InvoicePrintArea from './InvoicePrintArea';
import PathaoCourierModal from './PathaoCourierModal';
import CourierStatusModal from './CourierStatusModal';

export default function OrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { settings, formatPrice } = useSettings();
    const { downloadInvoice } = useDownloadInvoice();

    const {
        order,
        setOrder,
        loading,
        updating,
        selectedCourier,
        showCourierModal,
        creatingOrder,
        creatingPathaoOrder,
        pathaoCities,
        pathaoZones,
        pathaoAreas,
        selectedCity,
        selectedZone,
        selectedArea,
        setSelectedArea,
        itemWeight,
        setItemWeight,
        calculatedPrice,
        loadingPrice,
        liveStatus,
        setLiveStatus,
        loadingStatus,
        showStatusModal,
        setShowStatusModal,
        handleStatusUpdate,
        handleRefresh,
        handleCourierSelect,
        handleCityChange,
        handleZoneChange,
        handleConfirmCourierOrder,
        handleCancelCourierOrder,
        handleCheckLiveStatus,
        handlePrintLabel,
        getItemReturnStatus,
        subtotal,
        totalDiscount,
        totalRefunded,
    } = useOrderDetails(id);

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

    return (
        <div className="max-w-full mx-auto space-y-8 pb-12">
            {/* Print-only Invoice */}
            <InvoicePrintArea
                order={order}
                settings={settings}
                formatPrice={formatPrice}
                subtotal={subtotal}
                totalDiscount={totalDiscount}
            />

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
                        Order{' '}
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
                                order.status || 'PENDING'
                            )}`}
                        >
                            {(order.status || 'PENDING').charAt(0).toUpperCase() +
                                (order.status || 'PENDING').slice(1).toLowerCase()}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => { void handleRefresh(); }}
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
                        onChange={(e) => { void handleStatusUpdate({ status: e.target.value }); }}
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
                                const productName = item.snapshot?.productName || item.product?.name || 'Product Unavailable';
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
                                                                .join(', ')}
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
                                                    const returnStatus = getItemReturnStatus(item.product?.id || '', item.variant?.id);
                                                    if (returnStatus && (returnStatus === 'approved' || returnStatus === 'refunded')) {
                                                        const returnedQty = order.returns?.find((req: any) => {
                                                            const found = req.items.find((i: any) =>
                                                                i.productId === (item.product?.id || '') &&
                                                                (i.variantId === item.variant?.id || (!i.variantId && !item.variant?.id))
                                                            );
                                                            return found;
                                                        })?.items.find((i: any) =>
                                                            i.productId === (item.product?.id || '') &&
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
                                            {(() => {
                                                const returnStatus = getItemReturnStatus(item.product?.id || '', item.variant?.id);
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
                                    <div className="flex justify-between text-orange-600 font-bold">
                                        <span>Total Refunded</span>
                                        <span>-{formatPrice(totalRefunded)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Shipping Fee</span>
                                    <span>{Number(order.shippingFee) === 0 ? 'Free' : (
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
                                        {order.customerEmail || 'No email provided'}
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
                                        {order.customerPhone || 'No phone provided'}
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
                                                            onClick={() => { void handleCheckLiveStatus(); }}
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
                                                                onClick={() => { void handlePrintLabel(); }}
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
                                                                    ? 'https://tracking.pathao.com/'
                                                                    : 'https://steadfast.com.bd/tracking'
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
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
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
                                            void handleStatusUpdate({ paymentStatus: e.target.value })
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
                                            value={order.transactionId || ''}
                                            onChange={(e) =>
                                                setOrder({ ...order, transactionId: e.target.value } as any)
                                            }
                                            placeholder="Enter ID"
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                        <button
                                            onClick={() =>
                                                void handleStatusUpdate({
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

            {/* Pathao / Steadfast Courier Modal */}
            <PathaoCourierModal
                isOpen={showCourierModal}
                onClose={handleCancelCourierOrder}
                onConfirm={handleConfirmCourierOrder}
                order={order}
                selectedCourier={selectedCourier}
                creatingOrder={creatingOrder}
                creatingPathaoOrder={creatingPathaoOrder}
                pathaoCities={pathaoCities}
                pathaoZones={pathaoZones}
                pathaoAreas={pathaoAreas}
                selectedCity={selectedCity}
                selectedZone={selectedZone}
                selectedArea={selectedArea}
                setSelectedArea={setSelectedArea}
                itemWeight={itemWeight}
                setItemWeight={setItemWeight}
                calculatedPrice={calculatedPrice}
                loadingPrice={loadingPrice}
                handleCityChange={handleCityChange}
                handleZoneChange={handleZoneChange}
                formatPrice={formatPrice}
            />

            {/* Live Tracking Status Modal */}
            <CourierStatusModal
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setLiveStatus(null);
                }}
                order={order}
                loadingStatus={loadingStatus}
                liveStatus={liveStatus}
            />
        </div>
    );
}
