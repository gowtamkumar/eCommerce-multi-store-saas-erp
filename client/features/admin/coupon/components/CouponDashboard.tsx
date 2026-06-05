'use client';

import dynamic from 'next/dynamic';
import { useCouponManager } from '../hooks/useCouponManager';
import CouponFilters from './CouponFilters';
import CouponHeader from './CouponHeader';
import CouponList from './CouponList';

// Lazy load the form to optimize bundle size
const CouponForm = dynamic(() => import('./CouponForm'), {
    loading: () => null,
    ssr: false,
});

export default function CouponDashboard() {
    const coupon = useCouponManager();

    return (
        <>
            <div className="space-y-6">
                <CouponHeader onAdd={coupon.openCreate} />

                <CouponFilters
                    searchQuery={coupon.searchQuery}
                    onSearchChange={coupon.setSearchQuery}
                    statusFilter={coupon.statusFilter}
                    onStatusFilterChange={coupon.setStatusFilter}
                    isSearchLoading={coupon.isSearchLoading}
                />

                <CouponList
                    coupons={coupon.coupons}
                    loading={coupon.loading}
                    onEdit={coupon.openEdit}
                    onDelete={coupon.deleteCoupon}
                    pagination={coupon.pagination}
                    onPageChange={coupon.changePage}
                />
            </div>

            {coupon.isFormOpen && (
                <CouponForm
                    isOpen={coupon.isFormOpen}
                    initialData={coupon.selectedCoupon}
                    onClose={coupon.closeForm}
                    onSuccess={coupon.handleFormSuccess}
                />
            )}
        </>
    );
}
