import CreateOrder from '@/features/admin/order/components/CreateOrder';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Create Order",
};

export default function CreateOrderPage() {
    return (
        <div className="pt-24 min-h-screen bg-slate-50 dark:bg-slate-900">
            <CreateOrder />
        </div>
    );
}
