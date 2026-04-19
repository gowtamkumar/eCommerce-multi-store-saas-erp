import { PurchaseOrderPaymentStatus } from "@/lib/enums/purchase-order-payment.enum";
import { PurchaseOrderStatus } from "@/lib/enums/purchase-order.type.enum";
import { CheckCircle, XCircle } from "lucide-react";

export const getStatusBadge = (status: string) => {
    switch (status) {
        case PurchaseOrderStatus.DRAFT: return <span className="px-2 py-1 rounded-md text-[10px] font-black tracking-widest bg-slate-100 text-slate-500 uppercase">Draft</span>;
        case PurchaseOrderStatus.PENDING: return <span className="px-2 py-1 rounded-md text-[10px] font-black tracking-widest bg-blue-100 text-blue-600 uppercase border border-blue-200">Pending</span>;
        case PurchaseOrderStatus.RECEIVED: return <span className="px-2 py-1 rounded-md text-[10px] font-black tracking-widest bg-emerald-100 text-emerald-600 uppercase flex items-center gap-1 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Received</span>;
        case PurchaseOrderStatus.CANCELLED: return <span className="px-2 py-1 rounded-md text-[10px] font-black tracking-widest bg-red-100 text-red-600 uppercase flex items-center gap-1 border border-red-200"><XCircle className="w-3 h-3" /> Cancelled</span>;
        default: return <span className="px-2 py-1 rounded-md text-[10px] font-black tracking-widest bg-slate-100 text-slate-600 uppercase">{status}</span>;
    }
};


export const getPaymentStatusBadge = (status: string) => {
    switch (status) {
        case PurchaseOrderPaymentStatus.PAID: return <span className="px-2 py-1 rounded-md text-[10px] font-black tracking-widest bg-emerald-100 text-emerald-600 uppercase border border-emerald-200 shadow-sm">Paid</span>;
        case PurchaseOrderPaymentStatus.PARTIAL: return <span className="px-2 py-1 rounded-md text-[10px] font-black tracking-widest bg-orange-100 text-orange-600 uppercase border border-orange-200 shadow-sm">Partial</span>;
        case PurchaseOrderPaymentStatus.PENDING:
        default: return <span className="px-2 py-1 rounded-md text-[10px] font-black tracking-widest bg-rose-100 text-rose-600 uppercase border border-rose-200 shadow-sm">Unpaid</span>;
    }
};
