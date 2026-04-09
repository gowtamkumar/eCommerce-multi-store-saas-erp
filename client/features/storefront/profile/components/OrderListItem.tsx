import { ReturnStatus } from '@/lib/enums/return-status.enum';
import { getOrderStatusStyles } from '@/lib/utils';
import { Eye, FileText, Package } from 'lucide-react';
import React from 'react';
import { OrderListItemProps } from '../type';


const OrderListItem = React.memo(({
    order,
    formatPrice,
    onViewDetail,
    onDownloadInvoice,
    getReturnStatus
}: OrderListItemProps) => {
    const firstItem = order.items?.[0];
    const itemCount = order.items?.length || 0;

    const productName = firstItem?.snapshot?.productName || firstItem?.product?.name || "Product Unavailable";
    const productImage = firstItem?.snapshot?.productImage || firstItem?.product?.images?.[0];
    const variantSku = firstItem?.snapshot?.variantSku || firstItem?.variant?.sku;

    return (
        <div
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-brand-800 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all cursor-pointer"
            onClick={() => onViewDetail(order)}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    {productImage ? (
                        <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                                        const returnStatus = getReturnStatus(order, firstItem.product?.id, firstItem.variant?.id);
                                        if (returnStatus && (returnStatus === ReturnStatus.APPROVED || returnStatus === ReturnStatus.REFUNDED)) {
                                            const returnedQty = order.returns?.find((req: any) => {
                                                const found = req.items.find((i: any) =>
                                                    i.productId === firstItem.product?.id &&
                                                    (i.variantId === firstItem.variant?.id || (!i.variantId && !firstItem.variant?.id))
                                                );
                                                return found;
                                            })?.items.find((i: any) =>
                                                i.productId === firstItem.product?.id &&
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
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(order);
                        }}
                        className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                        title="View Details"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownloadInvoice(order);
                        }}
                        className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                        title="Download Invoice"
                    >
                        <FileText className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});

OrderListItem.displayName = 'OrderListItem';

export default OrderListItem;
