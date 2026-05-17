import PurchaseOrderForm from '@/features/admin/purchase/components/PurchaseOrderForm';
import { Suspense } from 'react';

export default function NewPurchasePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading purchase order form...</div>}>
            <PurchaseOrderForm />
        </Suspense>
    );
}
