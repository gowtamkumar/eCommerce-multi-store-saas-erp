import CartsList from '@/features/admin/cart/components/CartsList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Active Carts | Admin Dashboard',
    description: 'Manage and view active shopping carts in the store.',
};

export default function AdminCartsPage() {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
            <CartsList />
        </div>
    );
}
